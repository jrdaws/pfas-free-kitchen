"use client";
import { can } from "@/lib/entitlements";

export function EntitlementsCard() {
  const capabilities = [
    { name: "analytics", label: "Analytics Dashboard", allowed: can("analytics") },
    { name: "export", label: "Data Export", allowed: can("export") },
    { name: "api", label: "API Access", allowed: can("api") },
    { name: "customDomain", label: "Custom Domain", allowed: can("customDomain") },
    { name: "whiteLabel", label: "White Label", allowed: can("whiteLabel") },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl sm:text-2xl">🔐</span>
        <h2 className="text-lg sm:text-xl font-semibold dark:text-white m-0">Entitlements</h2>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
        Role-based capability checks using can() helper function
      </p>

      <div className="space-y-2">
        {capabilities.map((cap) => (
          <div key={cap.name} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <span className="text-sm sm:text-base dark:text-gray-200">{cap.label}</span>
            <span className={`px-2 sm:px-3 py-1 rounded text-xs font-medium ${
              cap.allowed
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
            }`}>
              {cap.allowed ? 'Allowed' : 'Denied'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <code className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
          {`const canExport = can('export'); // ${can('export')}`}
        </code>
      </div>
    </div>
  );
}
