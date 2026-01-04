"use client";

interface AuditEntry {
  id: string;
  userId: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

interface AuditLogTableProps {
  logs: AuditEntry[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "login":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "logout":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No audit logs found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              Time
            </th>
            <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              User
            </th>
            <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              Action
            </th>
            <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              Resource
            </th>
            <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatTimestamp(log.timestamp)}
              </td>
              <td className="py-3 text-sm dark:text-gray-300">
                {log.userEmail || log.userId.slice(0, 8)}
              </td>
              <td className="py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${getActionColor(
                    log.action
                  )}`}
                >
                  {log.action}
                </span>
              </td>
              <td className="py-3 text-sm dark:text-gray-300">
                {log.resource}
                {log.resourceId && (
                  <span className="text-gray-500 dark:text-gray-500 ml-1">
                    #{log.resourceId.slice(0, 8)}
                  </span>
                )}
              </td>
              <td className="py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                {log.details ? JSON.stringify(log.details) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

