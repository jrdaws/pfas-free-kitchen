/**
 * State Machine Types
 * Type definitions for product and report workflow state machines
 */

import type { VerificationTier, ClaimType, ReportPriority, ReportIssueType } from '../types/domain.types.js';

// ============================================================
// PRODUCT STATE TYPES
// ============================================================

export type ProductState =
  | 'draft'
  | 'pending_review'
  | 'under_review'
  | 'needs_info'
  | 'published'
  | 'suspended'
  | 'archived';

export type ProductEventType =
  | 'SUBMIT_FOR_REVIEW'
  | 'ASSIGN_REVIEWER'
  | 'ESCALATE'
  | 'APPROVE'
  | 'REJECT'
  | 'RETURN_TO_QUEUE'
  | 'REQUEST_CHANGES'
  | 'PROVIDE_INFO'
  | 'TIMEOUT'
  | 'SUSPEND'
  | 'UPDATE'
  | 'FLAG_FOR_REVALIDATION'
  | 'REINSTATE'
  | 'ARCHIVE';

export interface ProductContext {
  productId: string;
  reviewLane: 'standard' | 'high_risk';
  reviewerId: string | null;
  rejectionReason: string | null;
  suspensionReason: string | null;
  suspensionResolved: boolean;
  decision?: VerificationDecision;
  product?: ProductMinimalData;
}

export interface ProductMinimalData {
  name: string;
  brandId: string | null;
  categoryId: string | null;
}

export interface VerificationDecision {
  tier: VerificationTier;
  claimType?: ClaimType;
  rationale: string;
  evidenceIds: string[];
  scopeText?: string;
  unknowns?: string[];
}

export interface ProductEvent {
  type: ProductEventType;
  reviewerId?: string;
  reason?: string;
  decision?: VerificationDecision;
  suspensionResolved?: boolean;
}

// ============================================================
// REPORT STATE TYPES
// ============================================================

export type ReportState =
  | 'submitted'
  | 'under_review'
  | 'awaiting_info'
  | 'resolved'
  | 'dismissed';

export type ReportEventType =
  | 'ASSIGN'
  | 'AUTO_DISMISS'
  | 'RESOLVE_DISMISS'
  | 'RESOLVE_ACTION'
  | 'REQUEST_MORE_INFO'
  | 'ESCALATE'
  | 'INFO_PROVIDED'
  | 'TIMEOUT';

export interface ReportContext {
  reportId: string;
  productId: string;
  priority: ReportPriority;
  issueType: ReportIssueType;
  assigneeId: string | null;
  resolution: string | null;
  slaDeadline: Date | null;
  duplicateReportId: string | null;
  productAction?: ProductAction;
}

export type ProductAction =
  | 'suspend'
  | 'downgrade_tier'
  | 'update_info'
  | 'flag_revalidation'
  | 'none';

export interface ReportEvent {
  type: ReportEventType;
  assigneeId?: string;
  resolution?: string;
  productAction?: ProductAction;
  additionalInfo?: string;
}

// ============================================================
// TRANSITION TYPES
// ============================================================

export interface TransitionResult {
  previousState: string;
  newState: string;
  entityId: string;
  entityType: 'product' | 'report';
  timestamp: Date;
  actorId: string;
}

export interface InvalidTransitionError extends Error {
  currentState: string;
  attemptedEvent: string;
  validEvents: string[];
}

// ============================================================
// SLA TYPES
// ============================================================

export type SLAStatusType = 'on_track' | 'at_risk' | 'breached' | 'met' | 'unknown';

export interface SLAStatus {
  status: SLAStatusType;
  hoursRemaining?: number;
  hoursOverdue?: number;
  resolvedAt?: Date;
}

export const SLA_HOURS: Record<ReportPriority, number> = {
  critical: 24,
  high: 72,
  normal: 168,  // 7 days
  low: 336,     // 14 days
};

// ============================================================
// QUEUE TYPES
// ============================================================

export interface QueueStats {
  pending: number;
  underReview: number;
  byLane: {
    standard: number;
    highRisk: number;
  };
  avgAgeHours: number;
}

export interface QueueListParams {
  lane?: 'standard' | 'high_risk';
  assignedTo?: string;
  unassignedOnly?: boolean;
  page: number;
  limit: number;
}
