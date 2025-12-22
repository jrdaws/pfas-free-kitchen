/**
 * Usage Tracker & Budget System
 *
 * Track API calls, AI tokens, storage, and enforce budget limits.
 * In production, this would sync with a database and trigger alerts/throttling.
 */

export interface UsageStats {
  apiCalls: number;
  tokens: number;
  storage: number;
  limits: {
    apiCalls: number;
    tokens: number;
    storage: number;
  };
}

export type UsageMetric = 'api' | 'tokens' | 'storage';

// In-memory usage tracking - use database in production
const usage = {
  apiCalls: 7842,
  tokens: 1_234_567,
  storage: 3.7,
};

// Plan limits
const limits = {
  apiCalls: 10_000,
  tokens: 2_000_000,
  storage: 5, // GB
};

/**
 * Get current usage statistics
 */
export function getUsageStats(): UsageStats {
  return {
    ...usage,
    limits,
  };
}

/**
 * Track a usage event
 *
 * @example
 * ```ts
 * usage.track('api', 1); // Increment API call counter
 * usage.track('tokens', 500); // Add 500 tokens to usage
 * ```
 */
export function track(metric: UsageMetric, amount: number = 1): void {
  switch (metric) {
    case 'api':
      usage.apiCalls += amount;
      break;
    case 'tokens':
      usage.tokens += amount;
      break;
    case 'storage':
      usage.storage += amount;
      break;
  }

  // Check if we're approaching limits
  checkLimits();
}

/**
 * Check if current usage is within limits
 */
export function isWithinLimits(metric?: UsageMetric): boolean {
  if (metric) {
    const key = metric === 'api' ? 'apiCalls' : metric;
    return (usage as any)[key] < (limits as any)[key];
  }

  // Check all metrics
  return (
    usage.apiCalls < limits.apiCalls &&
    usage.tokens < limits.tokens &&
    usage.storage < limits.storage
  );
}

/**
 * Get percentage of limit used
 */
export function getUsagePercentage(metric: UsageMetric): number {
  const key = metric === 'api' ? 'apiCalls' : metric;
  return ((usage as any)[key] / (limits as any)[key]) * 100;
}

/**
 * Check limits and log warnings
 */
function checkLimits(): void {
  const metrics: UsageMetric[] = ['api', 'tokens', 'storage'];

  metrics.forEach(metric => {
    const percentage = getUsagePercentage(metric);

    if (percentage >= 90) {
      console.warn(`[USAGE] ${metric} at ${percentage.toFixed(1)}% of limit`);
    }
  });
}

/**
 * Reset usage counters (e.g., monthly reset)
 */
export function resetUsage(metric?: UsageMetric): void {
  if (metric) {
    const key = metric === 'api' ? 'apiCalls' : metric;
    (usage as any)[key] = 0;
  } else {
    usage.apiCalls = 0;
    usage.tokens = 0;
    usage.storage = 0;
  }

  console.log(`[USAGE] Reset ${metric || 'all metrics'}`);
}

/**
 * Get remaining quota
 */
export function getRemainingQuota(metric: UsageMetric): number {
  const key = metric === 'api' ? 'apiCalls' : metric;
  return Math.max(0, (limits as any)[key] - (usage as any)[key]);
}

/**
 * Check if adding amount would exceed limit
 */
export function wouldExceedLimit(metric: UsageMetric, amount: number): boolean {
  const key = metric === 'api' ? 'apiCalls' : metric;
  return (usage as any)[key] + amount > (limits as any)[key];
}

/**
 * Enforce usage limit - throws error if exceeded
 */
export function enforceLimit(metric: UsageMetric): void {
  if (!isWithinLimits(metric)) {
    throw new Error(`Usage limit exceeded for ${metric}`);
  }
}

/**
 * Get usage report for current period
 */
export function getUsageReport(): {
  metric: UsageMetric;
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
}[] {
  const metrics: UsageMetric[] = ['api', 'tokens', 'storage'];

  return metrics.map(metric => {
    const key = metric === 'api' ? 'apiCalls' : metric;
    return {
      metric,
      current: (usage as any)[key],
      limit: (limits as any)[key],
      percentage: getUsagePercentage(metric),
      remaining: getRemainingQuota(metric),
    };
  });
}
