/**
 * Provider Health Aggregation
 *
 * Check health status of all integrated services (auth, billing, AI, etc.)
 * Provides unified health monitoring across all providers.
 */

export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface ProviderHealth {
  name: string;
  status: HealthStatus;
  responseTime: number;
  lastCheck: string;
  message?: string;
  details?: Record<string, any>;
}

export interface AggregatedHealth {
  overall: HealthStatus;
  providers: ProviderHealth[];
  timestamp: string;
}

/**
 * Mock provider health checks
 * In production, these would make actual HTTP requests or SDK calls
 */
const checkProviders = (): ProviderHealth[] => {
  const now = new Date();

  return [
    {
      name: 'Supabase Auth',
      status: 'healthy',
      responseTime: 45,
      lastCheck: new Date(now.getTime() - 30000).toISOString().slice(11, 19),
      message: 'All systems operational',
    },
    {
      name: 'Stripe Payments',
      status: 'healthy',
      responseTime: 120,
      lastCheck: new Date(now.getTime() - 45000).toISOString().slice(11, 19),
      message: 'Processing normally',
    },
    {
      name: 'Anthropic AI',
      status: 'degraded',
      responseTime: 850,
      lastCheck: new Date(now.getTime() - 15000).toISOString().slice(11, 19),
      message: 'Elevated response times',
    },
    {
      name: 'PostgreSQL Database',
      status: 'healthy',
      responseTime: 12,
      lastCheck: new Date(now.getTime() - 10000).toISOString().slice(11, 19),
      message: 'Low latency',
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      responseTime: 3,
      lastCheck: new Date(now.getTime() - 20000).toISOString().slice(11, 19),
      message: 'Cache hit rate: 94%',
    },
  ];
};

/**
 * Get health status for all providers
 */
export function getProviderHealth(): ProviderHealth[] {
  return checkProviders();
}

/**
 * Get aggregated health across all providers
 */
export function getAggregatedHealth(): AggregatedHealth {
  const providers = checkProviders();

  // Determine overall status
  const hasDown = providers.some(p => p.status === 'down');
  const hasDegraded = providers.some(p => p.status === 'degraded');

  const overall: HealthStatus = hasDown
    ? 'down'
    : hasDegraded
    ? 'degraded'
    : 'healthy';

  return {
    overall,
    providers,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check health of a specific provider
 */
export function checkProvider(providerName: string): ProviderHealth | null {
  const providers = checkProviders();
  return providers.find(p => p.name === providerName) || null;
}

/**
 * Get unhealthy providers
 */
export function getUnhealthyProviders(): ProviderHealth[] {
  return checkProviders().filter(p => p.status !== 'healthy');
}

/**
 * Check if all critical providers are healthy
 */
export function areCriticalProvidersHealthy(): boolean {
  const critical = ['Supabase Auth', 'PostgreSQL Database'];
  const providers = checkProviders();

  return critical.every(name => {
    const provider = providers.find(p => p.name === name);
    return provider?.status === 'healthy';
  });
}

/**
 * Get average response time across all providers
 */
export function getAverageResponseTime(): number {
  const providers = checkProviders();
  const total = providers.reduce((sum, p) => sum + p.responseTime, 0);
  return Math.round(total / providers.length);
}

/**
 * Export health report
 */
export function exportHealthReport(): string {
  const health = getAggregatedHealth();

  return JSON.stringify(
    {
      ...health,
      summary: {
        total: health.providers.length,
        healthy: health.providers.filter(p => p.status === 'healthy').length,
        degraded: health.providers.filter(p => p.status === 'degraded').length,
        down: health.providers.filter(p => p.status === 'down').length,
        avgResponseTime: getAverageResponseTime(),
      },
    },
    null,
    2
  );
}

/**
 * Monitor health and log warnings
 */
export function monitorHealth(): void {
  const unhealthy = getUnhealthyProviders();

  if (unhealthy.length > 0) {
    console.warn('[HEALTH] Unhealthy providers detected:', unhealthy);
  }

  if (!areCriticalProvidersHealthy()) {
    console.error('[HEALTH] Critical provider failure detected!');
  }
}
