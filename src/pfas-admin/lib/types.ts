/**
 * Admin Console Types
 */

// ============================================================
// USER & AUTH
// ============================================================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string;
}

export type AdminRole = 'reviewer' | 'senior_reviewer' | 'admin' | 'super_admin';

export interface Session {
  user: AdminUser;
  expiresAt: string;
}

// ============================================================
// QUEUE
// ============================================================

export interface QueueItem {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  categoryName: string;
  lane: 'standard' | 'high_risk';
  status: QueueStatus;
  riskScore: number;
  riskTerms: string[];
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export type QueueStatus = 'pending' | 'under_review' | 'needs_info' | 'completed';

export interface QueueFilters {
  lane?: 'all' | 'standard' | 'high_risk';
  status?: QueueStatus | 'all';
  assigned?: 'unassigned' | 'mine' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface QueueStats {
  total: number;
  pending: number;
  underReview: number;
  highRisk: number;
  todayChange: number;
  avgReviewTime: number;
}

// ============================================================
// PRODUCT REVIEW
// ============================================================

export interface ProductForReview {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand: { id: string; name: string };
  category: { id: string; name: string; slug: string };
  sourceUrl?: string;
  rawData: Record<string, unknown>;
  components: ProductComponent[];
  verification?: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductComponent {
  id: string;
  role: ComponentRole;
  materialId?: string;
  materialName?: string;
  coatingId?: string;
  coatingName?: string;
  pfasStatus: 'verified_free' | 'claimed_free' | 'unknown' | 'contains_pfas';
  notes?: string;
}

export type ComponentRole =
  | 'cooking_surface'
  | 'body'
  | 'lid'
  | 'handle'
  | 'rim'
  | 'coating'
  | 'other';

export interface RiskAssessment {
  score: number;
  level: 'low' | 'moderate' | 'high' | 'auto_reject';
  terms: RiskTerm[];
  ceramicNonstick: boolean;
  requiresEscalation: boolean;
}

export interface RiskTerm {
  term: string;
  level: 'low' | 'moderate' | 'high' | 'auto_reject';
  context?: string;
}

export interface VerificationStatus {
  tier: 0 | 1 | 2 | 3 | 4;
  claimType?: 'A' | 'B' | 'C';
  scope?: string;
  unknowns: string[];
  rationale?: string;
  evidenceIds: string[];
  reviewerId?: string;
  decisionDate?: string;
}

// ============================================================
// EVIDENCE
// ============================================================

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  sourceUrl?: string;
  capturedAt: string;
  metadata: Record<string, unknown>;
  linkedProductIds: string[];
  uploadedBy: string;
  uploadedAt: string;
}

export type EvidenceType =
  | 'lab_report'
  | 'brand_statement'
  | 'policy_document'
  | 'screenshot'
  | 'certification'
  | 'other';

// ============================================================
// REPORTS
// ============================================================

export interface Report {
  id: string;
  productId: string;
  productName: string;
  issueType: ReportIssueType;
  priority: ReportPriority;
  status: ReportStatus;
  description: string;
  reporterEmail?: string;
  assigneeId?: string;
  assigneeName?: string;
  resolution?: string;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportIssueType =
  | 'suspected_pfas'
  | 'materials_changed'
  | 'listing_mismatch'
  | 'counterfeit_risk'
  | 'other';

export type ReportPriority = 'critical' | 'high' | 'normal' | 'low';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'awaiting_info'
  | 'resolved'
  | 'dismissed';

export interface ReportStats {
  total: number;
  open: number;
  highPriority: number;
  resolvedToday: number;
  slaStatus: {
    onTrack: number;
    atRisk: number;
    breached: number;
  };
}

// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardStats {
  queue: QueueStats;
  reports: ReportStats;
  coverage: CoverageStats;
}

export interface CoverageStats {
  published: number;
  tier1Plus: number;
  weekChange: number;
  tierDistribution: Array<{ tier: number; count: number }>;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: string;
  actorName: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export type ActivityType =
  | 'product_published'
  | 'product_rejected'
  | 'evidence_uploaded'
  | 'report_resolved'
  | 'review_completed';

// ============================================================
// CHECKLISTS
// ============================================================

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  completed?: boolean;
  notes?: string;
}

export interface CategoryChecklist {
  categorySlug: string;
  items: ChecklistItem[];
}
