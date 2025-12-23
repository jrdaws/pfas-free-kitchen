/**
 * Cost Tracking Utilities
 * 
 * Tracks API token usage and enforces daily/monthly limits.
 * Uses Redis for distributed tracking, with in-memory fallback.
 */

import { Redis } from "@upstash/redis";

// Cost control configuration (can be overridden via env vars)
const DAILY_TOKEN_LIMIT = parseInt(process.env.DAILY_TOKEN_LIMIT || "1000000", 10);
const MONTHLY_TOKEN_LIMIT = parseInt(process.env.MONTHLY_TOKEN_LIMIT || "20000000", 10);
const COST_ALERT_THRESHOLD = parseInt(process.env.COST_ALERT_THRESHOLD || "80", 10);

// Estimated tokens per operation (for pre-flight checks)
export const TOKEN_ESTIMATES = {
  projectGeneration: 15000,
  previewGeneration: 5000,
};

// Initialize Redis client
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn("Redis initialization for cost tracking failed:", error);
  redis = null;
}

// In-memory fallback tracking
const memoryUsage = {
  daily: { tokens: 0, resetAt: getEndOfDay() },
  monthly: { tokens: 0, resetAt: getEndOfMonth() },
};

export interface UsageStats {
  daily: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    resetAt: number;
  };
  monthly: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    resetAt: number;
  };
}

export interface CostCheckResult {
  allowed: boolean;
  reason?: string;
  stats: UsageStats;
  alertLevel: "normal" | "warning" | "critical";
}

/**
 * Get end of current day (UTC)
 */
function getEndOfDay(): number {
  const now = new Date();
  const endOfDay = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return endOfDay.getTime();
}

/**
 * Get end of current month (UTC)
 */
function getEndOfMonth(): number {
  const now = new Date();
  const endOfMonth = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    1, 0, 0, 0, 0
  ));
  return endOfMonth.getTime();
}

/**
 * Get Redis keys for current day/month
 */
function getRedisKeys(): { daily: string; monthly: string } {
  const now = new Date();
  const dayKey = `cost:daily:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
  const monthKey = `cost:monthly:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return { daily: dayKey, monthly: monthKey };
}

/**
 * Get current usage statistics
 */
export async function getUsageStats(): Promise<UsageStats> {
  const now = Date.now();

  if (redis) {
    try {
      const keys = getRedisKeys();
      const [dailyUsed, monthlyUsed] = await Promise.all([
        redis.get<number>(keys.daily),
        redis.get<number>(keys.monthly),
      ]);

      const daily = dailyUsed || 0;
      const monthly = monthlyUsed || 0;

      return {
        daily: {
          used: daily,
          limit: DAILY_TOKEN_LIMIT,
          remaining: Math.max(0, DAILY_TOKEN_LIMIT - daily),
          percentUsed: Math.round((daily / DAILY_TOKEN_LIMIT) * 100),
          resetAt: getEndOfDay(),
        },
        monthly: {
          used: monthly,
          limit: MONTHLY_TOKEN_LIMIT,
          remaining: Math.max(0, MONTHLY_TOKEN_LIMIT - monthly),
          percentUsed: Math.round((monthly / MONTHLY_TOKEN_LIMIT) * 100),
          resetAt: getEndOfMonth(),
        },
      };
    } catch (error) {
      console.error("Redis usage stats fetch failed:", error);
    }
  }

  // In-memory fallback
  // Reset if needed
  if (now > memoryUsage.daily.resetAt) {
    memoryUsage.daily = { tokens: 0, resetAt: getEndOfDay() };
  }
  if (now > memoryUsage.monthly.resetAt) {
    memoryUsage.monthly = { tokens: 0, resetAt: getEndOfMonth() };
  }

  return {
    daily: {
      used: memoryUsage.daily.tokens,
      limit: DAILY_TOKEN_LIMIT,
      remaining: Math.max(0, DAILY_TOKEN_LIMIT - memoryUsage.daily.tokens),
      percentUsed: Math.round((memoryUsage.daily.tokens / DAILY_TOKEN_LIMIT) * 100),
      resetAt: memoryUsage.daily.resetAt,
    },
    monthly: {
      used: memoryUsage.monthly.tokens,
      limit: MONTHLY_TOKEN_LIMIT,
      remaining: Math.max(0, MONTHLY_TOKEN_LIMIT - memoryUsage.monthly.tokens),
      percentUsed: Math.round((memoryUsage.monthly.tokens / MONTHLY_TOKEN_LIMIT) * 100),
      resetAt: memoryUsage.monthly.resetAt,
    },
  };
}

/**
 * Check if an operation is allowed based on cost limits
 */
export async function checkCostLimit(estimatedTokens: number): Promise<CostCheckResult> {
  const stats = await getUsageStats();

  const dailyAfter = stats.daily.used + estimatedTokens;
  const monthlyAfter = stats.monthly.used + estimatedTokens;

  // Check if limits would be exceeded
  if (dailyAfter > DAILY_TOKEN_LIMIT) {
    return {
      allowed: false,
      reason: `Daily token limit (${DAILY_TOKEN_LIMIT.toLocaleString()}) would be exceeded`,
      stats,
      alertLevel: "critical",
    };
  }

  if (monthlyAfter > MONTHLY_TOKEN_LIMIT) {
    return {
      allowed: false,
      reason: `Monthly token limit (${MONTHLY_TOKEN_LIMIT.toLocaleString()}) would be exceeded`,
      stats,
      alertLevel: "critical",
    };
  }

  // Determine alert level
  let alertLevel: "normal" | "warning" | "critical" = "normal";
  const dailyPercent = (dailyAfter / DAILY_TOKEN_LIMIT) * 100;
  const monthlyPercent = (monthlyAfter / MONTHLY_TOKEN_LIMIT) * 100;

  if (dailyPercent >= COST_ALERT_THRESHOLD || monthlyPercent >= COST_ALERT_THRESHOLD) {
    alertLevel = "warning";
  }
  if (dailyPercent >= 95 || monthlyPercent >= 95) {
    alertLevel = "critical";
  }

  return {
    allowed: true,
    stats,
    alertLevel,
  };
}

/**
 * Record token usage after an operation
 */
export async function recordUsage(tokensUsed: number): Promise<void> {
  if (redis) {
    try {
      const keys = getRedisKeys();
      const now = Date.now();

      // Daily key expires at end of day
      const dailyTTL = Math.ceil((getEndOfDay() - now) / 1000);
      // Monthly key expires at end of month
      const monthlyTTL = Math.ceil((getEndOfMonth() - now) / 1000);

      await Promise.all([
        redis.incrby(keys.daily, tokensUsed).then(() => redis!.expire(keys.daily, dailyTTL)),
        redis.incrby(keys.monthly, tokensUsed).then(() => redis!.expire(keys.monthly, monthlyTTL)),
      ]);

      // Log usage for monitoring
      const stats = await getUsageStats();
      if (stats.daily.percentUsed >= COST_ALERT_THRESHOLD) {
        console.warn(`[Cost Alert] Daily usage at ${stats.daily.percentUsed}% (${stats.daily.used.toLocaleString()} tokens)`);
      }
      if (stats.monthly.percentUsed >= COST_ALERT_THRESHOLD) {
        console.warn(`[Cost Alert] Monthly usage at ${stats.monthly.percentUsed}% (${stats.monthly.used.toLocaleString()} tokens)`);
      }
    } catch (error) {
      console.error("Redis usage recording failed:", error);
      // Fallback to memory
      recordUsageMemory(tokensUsed);
    }
  } else {
    recordUsageMemory(tokensUsed);
  }
}

/**
 * In-memory usage recording fallback
 */
function recordUsageMemory(tokensUsed: number): void {
  const now = Date.now();

  // Reset if needed
  if (now > memoryUsage.daily.resetAt) {
    memoryUsage.daily = { tokens: 0, resetAt: getEndOfDay() };
  }
  if (now > memoryUsage.monthly.resetAt) {
    memoryUsage.monthly = { tokens: 0, resetAt: getEndOfMonth() };
  }

  memoryUsage.daily.tokens += tokensUsed;
  memoryUsage.monthly.tokens += tokensUsed;
}

/**
 * Check if cost tracking (Redis) is available
 */
export function isCostTrackingAvailable(): boolean {
  return redis !== null;
}

/**
 * Get cost estimate for display
 * Based on Claude 3.5 Sonnet pricing: $3/M input, $15/M output
 */
export function estimateCost(tokens: number): { usd: number; formatted: string } {
  // Assume 30% input, 70% output ratio
  const inputTokens = tokens * 0.3;
  const outputTokens = tokens * 0.7;
  const cost = (inputTokens * 3 + outputTokens * 15) / 1_000_000;
  return {
    usd: cost,
    formatted: `$${cost.toFixed(4)}`,
  };
}

/**
 * Admin endpoint helper - get full usage report
 */
export async function getUsageReport(): Promise<{
  stats: UsageStats;
  tracking: "redis" | "memory";
  limits: {
    daily: number;
    monthly: number;
    alertThreshold: number;
  };
  estimatedMonthlyCost: string;
}> {
  const stats = await getUsageStats();
  const monthlyEstimate = estimateCost(stats.monthly.used);

  return {
    stats,
    tracking: redis ? "redis" : "memory",
    limits: {
      daily: DAILY_TOKEN_LIMIT,
      monthly: MONTHLY_TOKEN_LIMIT,
      alertThreshold: COST_ALERT_THRESHOLD,
    },
    estimatedMonthlyCost: monthlyEstimate.formatted,
  };
}

