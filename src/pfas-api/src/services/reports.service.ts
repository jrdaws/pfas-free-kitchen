/**
 * Reports service for PFAS-Free Kitchen Platform API
 * STUB: Implement business logic in production
 */

import type {
  ReportRequest,
  ReportResponse,
  AdminReportsResponse,
  UpdateReportResponse,
  AdminReportListParams,
  UpdateReportRequest,
} from '../types/api.types.js';
import type { ReportIssueType, ReportPriority } from '../types/domain.types.js';
import { NotImplementedError } from '../errors/AppError.js';

// Priority assignment based on issue type
const ISSUE_PRIORITY: Record<ReportIssueType, ReportPriority> = {
  suspected_pfas: 'high',
  materials_changed: 'high',
  counterfeit_risk: 'high',
  listing_mismatch: 'normal',
  other: 'normal',
};

// SLA hours based on priority
const PRIORITY_SLA: Record<ReportPriority, number> = {
  critical: 24,
  high: 72,
  normal: 168, // 7 days
  low: 336, // 14 days
};

export class ReportsService {
  /**
   * Submit a new report
   * TODO: Implement in w6-reports-service
   */
  static async submit(
    request: ReportRequest,
    sessionId?: string,
    ipHash?: string,
    userAgentHash?: string
  ): Promise<ReportResponse> {
    throw new NotImplementedError('ReportsService.submit');
  }

  /**
   * Get reports for admin review
   * TODO: Implement in w6-reports-service
   */
  static async listReports(params: AdminReportListParams): Promise<AdminReportsResponse> {
    throw new NotImplementedError('ReportsService.listReports');
  }

  /**
   * Update report status/priority
   * TODO: Implement in w6-reports-service
   */
  static async updateReport(
    reportId: string,
    updates: UpdateReportRequest,
    actorId: string
  ): Promise<UpdateReportResponse> {
    throw new NotImplementedError('ReportsService.updateReport');
  }

  /**
   * Get priority for issue type
   */
  static getPriorityForIssue(issueType: ReportIssueType): ReportPriority {
    return ISSUE_PRIORITY[issueType] || 'normal';
  }

  /**
   * Get SLA hours for priority
   */
  static getSlaHours(priority: ReportPriority): number {
    return PRIORITY_SLA[priority] || 168;
  }

  /**
   * Calculate SLA deadline
   */
  static calculateSlaDeadline(createdAt: Date, priority: ReportPriority): Date {
    const slaHours = this.getSlaHours(priority);
    return new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
  }
}
