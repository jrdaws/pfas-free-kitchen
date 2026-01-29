/**
 * Zod validation schemas for PFAS-Free Kitchen Platform API
 */

import { z } from 'zod';

// ============================================================
// COMMON SCHEMAS
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export const uuidSchema = z.string().uuid();

export const slugSchema = z.string().min(1).max(500).regex(/^[a-z0-9-]+$/);

// ============================================================
// PRODUCT SCHEMAS
// ============================================================

export const listProductsSchema = z.object({
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  tier: z.array(z.coerce.number().int().min(0).max(4)).optional()
    .or(z.string().transform(val => val.split(',').map(Number))),
  material: z.array(z.string()).optional()
    .or(z.string().transform(val => val.split(','))),
  coating_type: z.array(z.string()).optional()
    .or(z.string().transform(val => val.split(','))),
  food_contact_surface: z.array(z.string()).optional()
    .or(z.string().transform(val => val.split(','))),
  induction_compatible: z.coerce.boolean().optional(),
  oven_safe_min_temp: z.coerce.number().int().optional(),
  retailer_id: z.string().optional(),
  sort: z.enum(['tier_desc', 'tier_asc', 'name_asc', 'name_desc', 'newest']).default('tier_desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export const productIdSchema = z.object({
  product_id: z.string().min(1),
});

export const compareProductsSchema = z.object({
  ids: z.string().min(1).transform(val => val.split(',')).refine(
    (ids) => ids.length >= 2 && ids.length <= 4,
    { message: 'Must compare between 2 and 4 products' }
  ),
});

// ============================================================
// VERIFICATION SCHEMAS
// ============================================================

export const verificationDecisionSchema = z.object({
  product_id: z.string().min(1),
  tier: z.number().int().min(0).max(4),
  claim_type: z.enum(['A', 'B', 'C']).optional(),
  scope_text: z.string().max(500).optional(),
  scope_component_ids: z.array(z.string()).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  rationale: z.string().min(1).max(2000),
  evidence_ids: z.array(z.string()).optional(),
  unknowns: z.array(z.string()).optional(),
});

// ============================================================
// EVIDENCE SCHEMAS
// ============================================================

export const evidenceIdSchema = z.object({
  evidence_id: z.string().min(1),
});

export const evidenceUploadSchema = z.object({
  type: z.enum(['lab_report', 'brand_statement', 'policy_document', 'screenshot', 'correspondence']),
  product_id: z.string().min(1),
  source: z.enum(['brand_submission', 'retailer', 'user_report', 'internal']),
  metadata: z.record(z.unknown()).optional(),
});

export const labReportMetadataSchema = z.object({
  lab_name: z.string().min(1),
  accreditation: z.string().optional(),
  method: z.string().min(1),
  method_reference: z.string().optional(),
  analyte_list_ref: z.string().optional(),
  lod_ng_g: z.number().optional(),
  loq_ng_g: z.number().optional(),
  sample_scope: z.object({
    units: z.number().int().positive(),
    lots: z.number().int().positive(),
    component_ids: z.array(z.string()).optional(),
  }).optional(),
  collection_date: z.string().optional(),
  report_date: z.string().optional(),
});

export const brandStatementMetadataSchema = z.object({
  statement_text: z.string().min(1),
  statement_date: z.string(),
  signatory: z.string().optional(),
});

export const screenshotMetadataSchema = z.object({
  source_url: z.string().url(),
  captured_at: z.string(),
  description: z.string().optional(),
});

// ============================================================
// SEARCH SCHEMAS
// ============================================================

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  category_id: z.string().optional(),
  filters: z.string().optional(), // JSON-encoded filter object
  sort: z.enum(['relevance', 'tier_desc', 'name_asc']).default('relevance'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export const autocompleteSchema = z.object({
  q: z.string().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

// ============================================================
// REPORT SCHEMAS
// ============================================================

export const reportSchema = z.object({
  product_id: z.string().min(1),
  issue_type: z.enum(['suspected_pfas', 'materials_changed', 'listing_mismatch', 'counterfeit_risk', 'other']),
  description: z.string().min(10).max(5000),
  evidence_urls: z.array(z.string().url()).max(5).optional(),
  contact_email: z.string().email().optional(),
});

export const adminReportsSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'resolved', 'dismissed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export const updateReportSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'resolved', 'dismissed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  notes: z.string().max(2000).optional(),
});

export const reportIdSchema = z.object({
  report_id: z.string().min(1),
});

// ============================================================
// AFFILIATE SCHEMAS
// ============================================================

export const affiliateClickSchema = z.object({
  product_id: z.string().min(1),
  retailer_id: z.string().min(1),
  session_id: z.string().optional(),
  referrer_page: z.string().max(500).optional(),
  user_agent_hash: z.string().optional(),
});

// ============================================================
// QUEUE SCHEMAS
// ============================================================

export const queueSchema = z.object({
  status: z.enum(['pending_review', 'under_review']).optional(),
  review_lane: z.enum(['standard', 'high_risk']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export const queueIdSchema = z.object({
  queue_id: z.string().min(1),
});

export const assignQueueSchema = z.object({
  reviewer_id: z.string().min(1),
});

// ============================================================
// AUDIT LOG SCHEMAS
// ============================================================

export const auditLogSchema = z.object({
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  action: z.string().optional(),
  actor_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ListProductsInput = z.infer<typeof listProductsSchema>;
export type CompareProductsInput = z.infer<typeof compareProductsSchema>;
export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;
export type EvidenceUploadInput = z.infer<typeof evidenceUploadSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type AutocompleteInput = z.infer<typeof autocompleteSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type AdminReportsInput = z.infer<typeof adminReportsSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type AffiliateClickInput = z.infer<typeof affiliateClickSchema>;
export type QueueInput = z.infer<typeof queueSchema>;
export type AssignQueueInput = z.infer<typeof assignQueueSchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;
