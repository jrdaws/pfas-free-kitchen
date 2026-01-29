/**
 * SLA Service
 * Manages Service Level Agreement deadlines and status for reports
 */

import type { ReportPriority, ReportIssueType } from '../types/domain.types.js';
import type { SLAStatus, SLAStatusType } from '../state-machines/types.js';
import { db } from '../config/database.js';
import { logger } from '../config/logger.js';

// ============================================================
// SLA CONFIGURATION
// ============================================================

/**
 * SLA hours by priority level
 */
export const SLA_HOURS: Record<ReportPriority, number> = {
  critical: 24,    // 1 day
  high: 72,        // 3 days
  normal: 168,     // 7 days
  low: 336,        // 14 days
};

/**
 * Priority mapping by issue type
 */
export const ISSUE_PRIORITY_MAP: Record<ReportIssueType, ReportPriority> = {
  suspected_pfas: 'high',
  materials_changed: 'high',
  counterfeit_risk: 'high',
  listing_mismatch: 'normal',
  other: 'normal',
};

/**
 * Warning thresholds (hours before deadline)
 */
export const WARNING_THRESHOLDS = {
  atRisk: 24,      // < 24 hours = at risk
  urgent: 8,       // < 8 hours = urgent
};

// ============================================================
// SLA SERVICE
// ============================================================

export class SLAService {
  /**
   * Calculate SLA deadline from creation time and priority
   */
  static calculateDeadline(createdAt: Date, priority: ReportPriority): Date {
    const hours = SLA_HOURS[priority];
    const deadline = new Date(createdAt);
    deadline.setHours(deadline.getHours() + hours);
    return deadline;
  }

  /**
   * Calculate deadline for new report
   */
  static calculateNewDeadline(priority: ReportPriority): Date {
    return this.calculateDeadline(new Date(), priority);
  }

  /**
   * Determine priority based on issue type
   */
  static determinePriority(issueType: ReportIssueType): ReportPriority {
    return ISSUE_PRIORITY_MAP[issueType] || 'normal';
  }

  /**
   * Get SLA hours for a priority level
   */
  static getSLAHours(priority: ReportPriority): number {
    return SLA_HOURS[priority];
  }

  /**
   * Check SLA status for a single report
   */
  static async checkSLAStatus(reportId: string): Promise<SLAStatus> {
    const report = await db.queryOne<{
      id: string;
      status: string;
      sla_deadline: Date | null;
      updated_at: Date;
    }>(
      `SELECT id, status, sla_deadline, updated_at FROM user_reports WHERE id = $1`,
      [reportId]
    );

    if (!report || !report.sla_deadline) {
      return { status: 'unknown' };
    }

    return this.calculateSLAStatus(
      report.sla_deadline,
      report.status,
      report.updated_at
    );
  }

  /**
   * Calculate SLA status from deadline and current state
   */
  static calculateSLAStatus(
    deadline: Date,
    status: string,
    resolvedAt?: Date
  ): SLAStatus {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Check if report is resolved
    const isResolved = status === 'resolved' || status === 'dismissed';

    if (isResolved) {
      const resolved = resolvedAt ? new Date(resolvedAt) : now;
      const wasMet = resolved <= deadlineDate;
      return {
        status: wasMet ? 'met' : 'breached',
        resolvedAt: resolved,
      };
    }

    // Check if breached
    if (hoursRemaining < 0) {
      return {
        status: 'breached',
        hoursOverdue: Math.abs(hoursRemaining),
      };
    }

    // Check if at risk
    if (hoursRemaining < WARNING_THRESHOLDS.atRisk) {
      return {
        status: 'at_risk',
        hoursRemaining,
      };
    }

    return {
      status: 'on_track',
      hoursRemaining,
    };
  }

  /**
   * Get all reports approaching or past SLA deadline
   */
  static async getAtRiskReports(): Promise<AtRiskReport[]> {
    const atRiskThreshold = new Date();
    atRiskThreshold.setHours(atRiskThreshold.getHours() + WARNING_THRESHOLDS.atRisk);

    const reports = await db.query<{
      id: string;
      product_id: string;
      status: string;
      priority: string;
      sla_deadline: Date;
      hours_remaining: number;
    }>(
      `SELECT 
        id, product_id, status, priority, sla_deadline,
        EXTRACT(EPOCH FROM (sla_deadline - NOW())) / 3600 as hours_remaining
       FROM user_reports
       WHERE status NOT IN ('resolved', 'dismissed')
         AND sla_deadline IS NOT NULL
         AND sla_deadline < $1
       ORDER BY sla_deadline ASC`,
      [atRiskThreshold]
    );

    return reports.map(r => ({
      reportId: r.id,
      productId: r.product_id,
      status: r.status,
      priority: r.priority as ReportPriority,
      slaDeadline: r.sla_deadline,
      hoursRemaining: r.hours_remaining,
      slaStatus: r.hours_remaining < 0 ? 'breached' : 'at_risk' as SLAStatusType,
    }));
  }

  /**
   * Get SLA compliance metrics
   */
  static async getComplianceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<SLAComplianceMetrics> {
    // Get all resolved reports in date range
    const reports = await db.query<{
      id: string;
      priority: string;
      sla_deadline: Date;
      resolved_at: Date;
    }>(
      `SELECT id, priority, sla_deadline, updated_at as resolved_at
       FROM user_reports
       WHERE status IN ('resolved', 'dismissed')
         AND updated_at BETWEEN $1 AND $2
         AND sla_deadline IS NOT NULL`,
      [startDate, endDate]
    );

    const total = reports.length;
    let met = 0;
    let breached = 0;
    const byPriority: Record<ReportPriority, { met: number; breached: number }> = {
      critical: { met: 0, breached: 0 },
      high: { met: 0, breached: 0 },
      normal: { met: 0, breached: 0 },
      low: { met: 0, breached: 0 },
    };

    for (const report of reports) {
      const resolvedAt = new Date(report.resolved_at);
      const deadline = new Date(report.sla_deadline);
      const priority = report.priority as ReportPriority;

      if (resolvedAt <= deadline) {
        met++;
        byPriority[priority].met++;
      } else {
        breached++;
        byPriority[priority].breached++;
      }
    }

    return {
      total,
      met,
      breached,
      complianceRate: total > 0 ? (met / total) * 100 : 100,
      byPriority,
      period: { startDate, endDate },
    };
  }

  /**
   * Extend SLA deadline (for special circumstances)
   */
  static async extendDeadline(
    reportId: string,
    additionalHours: number,
    reason: string,
    actorId: string
  ): Promise<Date> {
    const report = await db.queryOne<{ sla_deadline: Date }>(
      `SELECT sla_deadline FROM user_reports WHERE id = $1`,
      [reportId]
    );

    if (!report?.sla_deadline) {
      throw new Error('Report not found or has no SLA deadline');
    }

    const newDeadline = new Date(report.sla_deadline);
    newDeadline.setHours(newDeadline.getHours() + additionalHours);

    await db.query(
      `UPDATE user_reports SET sla_deadline = $1, updated_at = NOW() WHERE id = $2`,
      [newDeadline, reportId]
    );

    // Audit log
    await db.query(
      `INSERT INTO audit_log (
        actor_type, actor_id, action, entity_type, entity_id,
        old_values, new_values, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'admin',
        actorId,
        'report.sla_extended',
        'report',
        reportId,
        JSON.stringify({ sla_deadline: report.sla_deadline }),
        JSON.stringify({ sla_deadline: newDeadline }),
        JSON.stringify({ additionalHours, reason }),
      ]
    );

    logger.info({
      reportId,
      previousDeadline: report.sla_deadline,
      newDeadline,
      additionalHours,
      reason,
      actorId,
    }, 'SLA deadline extended');

    return newDeadline;
  }
}

// ============================================================
// TYPES
// ============================================================

export interface AtRiskReport {
  reportId: string;
  productId: string;
  status: string;
  priority: ReportPriority;
  slaDeadline: Date;
  hoursRemaining: number;
  slaStatus: SLAStatusType;
}

export interface SLAComplianceMetrics {
  total: number;
  met: number;
  breached: number;
  complianceRate: number;
  byPriority: Record<ReportPriority, { met: number; breached: number }>;
  period: { startDate: Date; endDate: Date };
}
