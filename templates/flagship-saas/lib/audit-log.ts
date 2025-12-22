/**
 * Audit Log System
 *
 * Append-only event tracking for compliance, debugging, and security.
 * In production, this would write to a database or specialized logging service.
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory store for demo - use database in production
let auditLogs: AuditLogEntry[] = [];

// Generate some sample data
const generateSampleLogs = (): AuditLogEntry[] => {
  const now = new Date();
  return [
    {
      id: 'log-1',
      timestamp: new Date(now.getTime() - 120000).toISOString().slice(11, 19),
      action: 'user.login',
      userId: 'user-123',
      metadata: { method: 'email' },
    },
    {
      id: 'log-2',
      timestamp: new Date(now.getTime() - 90000).toISOString().slice(11, 19),
      action: 'project.created',
      userId: 'user-123',
      metadata: { projectId: 'proj-456', name: 'My Project' },
    },
    {
      id: 'log-3',
      timestamp: new Date(now.getTime() - 60000).toISOString().slice(11, 19),
      action: 'api.called',
      userId: 'user-123',
      metadata: { endpoint: '/api/data', method: 'GET' },
    },
    {
      id: 'log-4',
      timestamp: new Date(now.getTime() - 30000).toISOString().slice(11, 19),
      action: 'settings.updated',
      userId: 'user-123',
      metadata: { field: 'notification_email', value: 'new@example.com' },
    },
    {
      id: 'log-5',
      timestamp: new Date(now.getTime() - 5000).toISOString().slice(11, 19),
      action: 'export.downloaded',
      userId: 'user-123',
      metadata: { format: 'csv', rows: 1250 },
    },
  ];
};

// Initialize with sample data
auditLogs = generateSampleLogs();

/**
 * Append a new entry to the audit log
 *
 * @example
 * ```ts
 * auditLog.append('user.login', {
 *   userId: user.id,
 *   method: 'oauth',
 *   provider: 'github'
 * });
 * ```
 */
export function append(
  action: string,
  metadata?: Record<string, any>,
  userId?: string
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    userId: userId || 'user-123', // In real app, get from auth context
    metadata,
  };

  auditLogs.push(entry);

  // In production, write to database/logging service
  console.log('[AUDIT]', entry);

  return entry;
}

/**
 * Get recent audit log entries
 */
export function getRecentAuditLogs(limit: number = 10): AuditLogEntry[] {
  return auditLogs.slice(-limit).reverse();
}

/**
 * Search audit logs by action
 */
export function searchByAction(action: string): AuditLogEntry[] {
  return auditLogs.filter(log => log.action === action);
}

/**
 * Search audit logs by user
 */
export function searchByUser(userId: string): AuditLogEntry[] {
  return auditLogs.filter(log => log.userId === userId);
}

/**
 * Search audit logs by time range
 */
export function searchByTimeRange(
  startTime: Date,
  endTime: Date
): AuditLogEntry[] {
  return auditLogs.filter(log => {
    const logTime = new Date(log.timestamp);
    return logTime >= startTime && logTime <= endTime;
  });
}

/**
 * Get count of specific action
 */
export function countAction(action: string): number {
  return auditLogs.filter(log => log.action === action).length;
}

/**
 * Export audit logs (for compliance)
 */
export function exportLogs(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(auditLogs, null, 2);
  }

  // Simple CSV export
  const headers = ['id', 'timestamp', 'action', 'userId', 'metadata'];
  const rows = auditLogs.map(log => [
    log.id,
    log.timestamp,
    log.action,
    log.userId,
    JSON.stringify(log.metadata || {})
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
