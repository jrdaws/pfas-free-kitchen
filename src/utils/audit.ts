/**
 * PFAS-Free Kitchen Admin Console - Audit Logging Utility
 * 
 * Logs all admin actions to audit_log for compliance and traceability.
 * @see docs/pfas-platform/03-ADMIN-CONSOLE-SPEC.md "1.3 Access Control"
 */

import crypto from 'crypto';
import type { AuthenticatedUser } from '../auth/session';

/**
 * Audit log entry for admin actions.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actor_type: 'admin' | 'system' | 'api';
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  actor_ip_hash: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Actions that can be audited.
 */
export type AuditAction =
  // Authentication
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.session_revoked'
  // Catalog
  | 'catalog.product_created'
  | 'catalog.product_updated'
  | 'catalog.product_deleted'
  | 'catalog.brand_created'
  | 'catalog.brand_updated'
  | 'catalog.category_created'
  | 'catalog.category_updated'
  // Verification
  | 'verification.started'
  | 'verification.decided'
  | 'verification.tier_changed'
  // Evidence
  | 'evidence.uploaded'
  | 'evidence.linked'
  | 'evidence.unlinked'
  | 'evidence.archived'
  // Reports
  | 'report.submitted'
  | 'report.assigned'
  | 'report.resolved'
  | 'report.dismissed'
  // Admin
  | 'user.created'
  | 'user.role_changed'
  | 'user.deactivated'
  | 'settings.updated';

/**
 * Entity types that can be audited.
 */
export type EntityType =
  | 'product'
  | 'brand'
  | 'category'
  | 'retailer'
  | 'verification'
  | 'evidence'
  | 'report'
  | 'user'
  | 'settings'
  | 'session';

/**
 * In-memory audit log storage.
 * In production, replace with database writes.
 */
const auditLog: AuditLogEntry[] = [];

/**
 * Generate a unique audit log ID.
 */
function generateAuditId(): string {
  return `aud_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Hash an IP address for privacy-preserving logging.
 * Uses SHA-256 with a salt to prevent rainbow table attacks.
 */
function hashIpAddress(ip: string | null): string | null {
  if (!ip) return null;
  
  const salt = process.env.AUDIT_IP_SALT || 'pfas-admin-audit-salt';
  return crypto.createHash('sha256')
    .update(`${salt}:${ip}`)
    .digest('hex')
    .slice(0, 16); // Truncate for storage efficiency
}

/**
 * Log an admin action to the audit log.
 * 
 * @param user - The authenticated admin user performing the action
 * @param action - The action being performed
 * @param entityType - The type of entity being acted upon
 * @param entityId - The ID of the entity being acted upon
 * @param oldValues - Previous state of the entity (for updates)
 * @param newValues - New state of the entity (for creates/updates)
 * @param options - Additional options
 * 
 * @example
 * await logAdminAction(
 *   req.user,
 *   'verification.decided',
 *   'product',
 *   'prd_abc123',
 *   { tier: 1, claim_type: null },
 *   { tier: 2, claim_type: 'A' }
 * );
 */
export async function logAdminAction(
  user: AuthenticatedUser | null,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
  options?: {
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: generateAuditId(),
    timestamp: new Date(),
    actor_type: user ? 'admin' : 'system',
    actor_id: user?.id ?? null,
    actor_email: user?.email ?? null,
    actor_role: user?.role ?? null,
    actor_ip_hash: hashIpAddress(options?.ipAddress ?? null),
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    metadata: options?.metadata ?? null,
  };

  // Store entry (in production, write to database)
  auditLog.push(entry);

  // In production, also emit to logging infrastructure
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      type: 'audit_log',
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    }));
  }

  return entry;
}

/**
 * Log a system-initiated action.
 * Used for automated processes like scheduled tasks.
 */
export async function logSystemAction(
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
  metadata?: Record<string, unknown>
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: generateAuditId(),
    timestamp: new Date(),
    actor_type: 'system',
    actor_id: null,
    actor_email: null,
    actor_role: null,
    actor_ip_hash: null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    metadata: metadata ?? null,
  };

  auditLog.push(entry);

  return entry;
}

/**
 * Log an API-initiated action.
 * Used for actions triggered via API keys rather than user sessions.
 */
export async function logApiAction(
  apiKeyId: string,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
  options?: {
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: generateAuditId(),
    timestamp: new Date(),
    actor_type: 'api',
    actor_id: apiKeyId,
    actor_email: null,
    actor_role: null,
    actor_ip_hash: hashIpAddress(options?.ipAddress ?? null),
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    metadata: options?.metadata ?? null,
  };

  auditLog.push(entry);

  return entry;
}

/**
 * Query audit log entries.
 * In production, this would query the database.
 */
export function queryAuditLog(filters: {
  actorId?: string;
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): AuditLogEntry[] {
  let results = auditLog;

  if (filters.actorId) {
    results = results.filter(e => e.actor_id === filters.actorId);
  }
  if (filters.entityType) {
    results = results.filter(e => e.entity_type === filters.entityType);
  }
  if (filters.entityId) {
    results = results.filter(e => e.entity_id === filters.entityId);
  }
  if (filters.action) {
    results = results.filter(e => e.action === filters.action);
  }
  if (filters.startDate) {
    results = results.filter(e => e.timestamp >= filters.startDate!);
  }
  if (filters.endDate) {
    results = results.filter(e => e.timestamp <= filters.endDate!);
  }

  // Sort by timestamp descending (most recent first)
  results = [...results].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply pagination
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 50;
  
  return results.slice(offset, offset + limit);
}

/**
 * Get audit trail for a specific entity.
 * Returns all actions taken on an entity, chronologically.
 */
export function getEntityAuditTrail(
  entityType: EntityType,
  entityId: string
): AuditLogEntry[] {
  return queryAuditLog({ entityType, entityId });
}

/**
 * Get recent actions by a user.
 */
export function getUserActions(
  userId: string,
  limit: number = 50
): AuditLogEntry[] {
  return queryAuditLog({ actorId: userId, limit });
}

/**
 * Export audit log entries for compliance reporting.
 * Returns entries in a format suitable for CSV export.
 */
export function exportAuditLog(filters: {
  startDate: Date;
  endDate: Date;
  entityType?: EntityType;
}): Array<{
  timestamp: string;
  actor_type: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: string;
}> {
  const entries = queryAuditLog({
    ...filters,
    limit: 10000, // Max export size
  });

  return entries.map(e => ({
    timestamp: e.timestamp.toISOString(),
    actor_type: e.actor_type,
    actor_email: e.actor_email ?? 'system',
    action: e.action,
    entity_type: e.entity_type,
    entity_id: e.entity_id,
    changes: JSON.stringify({
      old: e.old_values,
      new: e.new_values,
    }),
  }));
}
