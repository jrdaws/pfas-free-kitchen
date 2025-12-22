"use client";
import { getRecentAuditLogs } from "@/lib/audit-log";

export function AuditLogCard() {
  const logs = getRecentAuditLogs(5);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl sm:text-2xl">📝</span>
        <h2 className="text-lg sm:text-xl font-semibold dark:text-white m-0">Audit Logs</h2>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
        Append-only event tracking for compliance and debugging
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded border-l-4 border-blue-500">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs sm:text-sm font-medium dark:text-white">{log.action}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{log.timestamp}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              User: <span className="font-mono">{log.userId}</span>
            </div>
            {log.metadata && (
              <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                {JSON.stringify(log.metadata, null, 0)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <code className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 block">
          {`auditLog.append('user.login', { userId, ip });`}
        </code>
      </div>
    </div>
  );
}
