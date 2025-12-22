"use client";
import { getProviderHealth } from "@/lib/provider-health";

export function ProviderHealthCard() {
  const providers = getProviderHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'degraded': return 'text-yellow-600 dark:text-yellow-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl sm:text-2xl">🔌</span>
        <h2 className="text-lg sm:text-xl font-semibold dark:text-white m-0">Provider Health</h2>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
        Aggregated health status for all service integrations
      </p>

      <div className="space-y-2">
        {providers.map((provider) => (
          <div key={provider.name} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(provider.status)}</span>
                <span className="text-sm sm:text-base font-medium dark:text-white">{provider.name}</span>
              </div>
              <span className={`text-xs sm:text-sm font-medium ${getStatusColor(provider.status)}`}>
                {provider.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Response: {provider.responseTime}ms</span>
              <span>Last checked: {provider.lastCheck}</span>
            </div>
            {provider.message && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {provider.message}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <code className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 block">
          {`const health = await provider.health();`}
        </code>
      </div>
    </div>
  );
}
