import { Redis } from "@upstash/redis";

// Rate limiting configuration
const DEMO_RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 24 * 60 * 60; // 24 hours in seconds

// Initialize Redis client (optional - gracefully handles missing env vars)
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn("Redis initialization failed, falling back to simple rate limiting:", error);
  redis = null;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: number;
}

/**
 * Check if a session has exceeded the rate limit
 * Uses Redis for distributed tracking when available,
 * falls back to simple per-invocation checks otherwise
 */
export async function checkRateLimit(
  sessionId: string,
  userApiKey?: string
): Promise<RateLimitResult> {
  // Users with their own API key bypass rate limiting
  if (userApiKey) {
    return {
      allowed: true,
      remaining: -1, // Unlimited
    };
  }

  // Redis-based distributed rate limiting (production)
  if (redis) {
    try {
      const key = `rate-limit:${sessionId}`;
      const current = await redis.get<number>(key);

      if (current === null) {
        // First request from this session
        await redis.setex(key, RATE_LIMIT_WINDOW, 1);
        return {
          allowed: true,
          remaining: DEMO_RATE_LIMIT - 1,
          resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000,
        };
      }

      if (current >= DEMO_RATE_LIMIT) {
        // Rate limit exceeded
        const ttl = await redis.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetAt: Date.now() + ttl * 1000,
        };
      }

      // Increment counter
      const newCount = await redis.incr(key);
      const ttl = await redis.ttl(key);

      return {
        allowed: true,
        remaining: Math.max(0, DEMO_RATE_LIMIT - newCount),
        resetAt: Date.now() + ttl * 1000,
      };
    } catch (error) {
      console.error("Redis rate limit check failed:", error);
      // Fallback to allowing the request if Redis fails
      return {
        allowed: true,
        remaining: -1,
      };
    }
  }

  // Simple fallback rate limiting (development/no Redis)
  // Just check a per-invocation limit - less accurate but works
  // In production, strongly recommend using Redis

  // For now, allow all requests in fallback mode
  // The sessionId tracking will happen client-side via localStorage
  return {
    allowed: true,
    remaining: DEMO_RATE_LIMIT, // Optimistic - client tracks actual usage
  };
}

/**
 * Reset rate limit for a session (useful for testing)
 */
export async function resetRateLimit(sessionId: string): Promise<void> {
  if (redis) {
    try {
      const key = `rate-limit:${sessionId}`;
      await redis.del(key);
    } catch (error) {
      console.error("Redis rate limit reset failed:", error);
    }
  }
}

/**
 * Get current usage for a session
 */
export async function getRateLimitStatus(
  sessionId: string
): Promise<{ used: number; limit: number; resetAt?: number }> {
  if (redis) {
    try {
      const key = `rate-limit:${sessionId}`;
      const current = await redis.get<number>(key);
      const ttl = await redis.ttl(key);

      return {
        used: current || 0,
        limit: DEMO_RATE_LIMIT,
        resetAt: ttl > 0 ? Date.now() + ttl * 1000 : undefined,
      };
    } catch (error) {
      console.error("Redis status check failed:", error);
    }
  }

  // Fallback
  return {
    used: 0,
    limit: DEMO_RATE_LIMIT,
  };
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}
