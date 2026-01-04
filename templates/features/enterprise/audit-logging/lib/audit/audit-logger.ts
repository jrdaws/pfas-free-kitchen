/**
 * Audit Logger
 * 
 * Track all user actions for compliance and debugging.
 */

import { createClient } from "@/lib/supabase";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "view"
  | "export"
  | "import"
  | "permission_change"
  | "settings_change";

export interface AuditEntry {
  id: string;
  userId: string;
  userEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  userId: string,
  action: AuditAction,
  resource: string,
  options: {
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    resource,
    resource_id: options.resourceId,
    details: options.details,
    ip_address: options.ipAddress,
    user_agent: options.userAgent,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(options: {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditEntry[]; total: number }> {
  const supabase = createClient();
  const { limit = 50, offset = 0 } = options;

  let query = supabase
    .from("audit_logs")
    .select("*, profiles(email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }
  if (options.action) {
    query = query.eq("action", options.action);
  }
  if (options.resource) {
    query = query.eq("resource", options.resource);
  }
  if (options.startDate) {
    query = query.gte("created_at", options.startDate.toISOString());
  }
  if (options.endDate) {
    query = query.lte("created_at", options.endDate.toISOString());
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to get audit logs:", error);
    return { logs: [], total: 0 };
  }

  return {
    logs: (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      userEmail: (row.profiles as Record<string, unknown>)?.email as string | undefined,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      timestamp: new Date(row.created_at),
    })),
    total: count || 0,
  };
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  options: Parameters<typeof getAuditLogs>[0],
  format: "json" | "csv" = "json"
): Promise<string> {
  const { logs } = await getAuditLogs({ ...options, limit: 10000 });

  if (format === "csv") {
    const headers = ["Timestamp", "User", "Action", "Resource", "Resource ID", "Details"];
    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.userEmail || log.userId,
      log.action,
      log.resource,
      log.resourceId || "",
      JSON.stringify(log.details || {}),
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  return JSON.stringify(logs, null, 2);
}

/**
 * Get audit summary
 */
export async function getAuditSummary(
  startDate: Date,
  endDate: Date
): Promise<Record<AuditAction, number>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("action")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (error || !data) {
    return {} as Record<AuditAction, number>;
  }

  const summary: Record<string, number> = {};
  for (const row of data) {
    summary[row.action] = (summary[row.action] || 0) + 1;
  }

  return summary as Record<AuditAction, number>;
}

