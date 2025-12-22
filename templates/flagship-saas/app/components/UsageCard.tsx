"use client";
import { getUsageStats } from "@/lib/usage-tracker";

export function UsageCard() {
  const usage = getUsageStats();

  const calculatePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl sm:text-2xl">📈</span>
        <h2 className="text-lg sm:text-xl font-semibold dark:text-white m-0">Usage & Budgets</h2>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
        Track API calls, tokens, and enforce budget limits
      </p>

      <div className="space-y-4">
        {/* API Calls */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm sm:text-base dark:text-gray-200">API Calls</span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {usage.apiCalls.toLocaleString()} / {usage.limits.apiCalls.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor(calculatePercentage(usage.apiCalls, usage.limits.apiCalls))}`}
              style={{ width: `${calculatePercentage(usage.apiCalls, usage.limits.apiCalls)}%` }}
            />
          </div>
        </div>

        {/* Tokens */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm sm:text-base dark:text-gray-200">AI Tokens</span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {usage.tokens.toLocaleString()} / {usage.limits.tokens.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor(calculatePercentage(usage.tokens, usage.limits.tokens))}`}
              style={{ width: `${calculatePercentage(usage.tokens, usage.limits.tokens)}%` }}
            />
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm sm:text-base dark:text-gray-200">Storage (GB)</span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {usage.storage.toFixed(1)} / {usage.limits.storage}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor(calculatePercentage(usage.storage, usage.limits.storage))}`}
              style={{ width: `${calculatePercentage(usage.storage, usage.limits.storage)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <code className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 block">
          {`usage.track('api', 1); // Increment counter`}
        </code>
      </div>
    </div>
  );
}
