/**
 * Database Types - PostgreSQL row types for PFAS-Free Kitchen Platform
 */

// ============================================================
// BRANDS
// ============================================================

export interface BrandRow {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  country: string | null;
  logo_url: string | null;
  pfas_policy_url: string | null;
  pfas_policy_summary: string | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// CATEGORIES
// ============================================================

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  path_slugs: string[];
  description: string | null;
  sort_order: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// MATERIALS & COATINGS
// ============================================================

export interface MaterialRow {
  id: string;
  name: string;
  slug: string;
  family: string | null;
  pfas_risk_default: boolean;
  notes: string | null;
  created_at: Date;
}

export interface CoatingRow {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  is_fluoropolymer: boolean;
  pfas_risk_default: boolean;
  marketing_terms: string[] | null;
  notes: string | null;
  created_at: Date;
}

// ============================================================
// PRODUCTS
// ============================================================

export interface ProductRow {
  id: string;
  brand_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  primary_image_url: string | null;
  status: string;
  material_summary: string | null;
  coating_summary: string | null;
  features: Record<string, unknown>;
  gtin: string | null;
  mpn: string | null;
  pfas_risk_flagged: boolean;
  requires_elevated_review: boolean;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export interface ProductComponentRow {
  id: string;
  product_id: string;
  name: string;
  food_contact: boolean;
  material_id: string | null;
  coating_id: string | null;
  pfas_risk_flag: boolean;
  notes: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  gtin: string | null;
  asin: string | null;
  size_value: number | null;
  size_unit: string | null;
  pack_count: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductRetailerLinkRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  retailer_id: string;
  external_id: string | null;
  external_url: string | null;
  active: boolean;
  last_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// RETAILERS
// ============================================================

export interface RetailerRow {
  id: string;
  name: string;
  slug: string;
  domain: string;
  affiliate_program_id: string | null;
  icon_name: string | null;
  priority: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AffiliateProgramRow {
  id: string;
  name: string;
  network: string | null;
  terms_url: string | null;
  price_display_allowed: boolean;
  price_cache_max_hours: number | null;
  requires_api: boolean;
  api_name: string | null;
  active: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AffiliateLinkTemplateRow {
  id: string;
  retailer_id: string;
  template: string;
  param_rules: Record<string, unknown>;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// EVIDENCE
// ============================================================

export interface EvidenceObjectRow {
  id: string;
  type: string;
  source: string;
  storage_uri: string;
  sha256_hash: string;
  file_size_bytes: number;
  mime_type: string;
  original_filename: string | null;
  received_at: Date;
  expires_at: Date | null;
  metadata: Record<string, unknown>;
  deleted_at: Date | null;
  deletion_reason: string | null;
  created_at: Date;
}

export interface ProductEvidenceRow {
  product_id: string;
  evidence_id: string;
  component_id: string | null;
  added_at: Date;
  added_by: string | null;
  notes: string | null;
}

// ============================================================
// CLAIMS
// ============================================================

export interface ClaimRow {
  id: string;
  product_id: string;
  component_id: string | null;
  claim_type: string;
  claim_text: string;
  source_url: string | null;
  source_type: string | null;
  captured_at: Date;
  captured_by: string | null;
  verified: boolean;
  evidence_id: string | null;
  notes: string | null;
  created_at: Date;
}

// ============================================================
// VERIFICATION
// ============================================================

export interface VerificationStatusRow {
  id: string;
  product_id: string;
  tier: string;
  claim_type: string | null;
  scope_text: string | null;
  scope_component_ids: string[] | null;
  confidence_score: number | null;
  unknowns: string[] | null;
  decision_date: Date | null;
  reviewer_id: string | null;
  rationale: string | null;
  evidence_ids: string[] | null;
  next_review_due: Date | null;
  review_started_at: Date | null;
  review_lane: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface VerificationHistoryRow {
  id: string;
  product_id: string;
  from_tier: string | null;
  to_tier: string;
  from_claim_type: string | null;
  to_claim_type: string | null;
  reason: string;
  evidence_ids: string[] | null;
  reviewer_id: string | null;
  created_at: Date;
}

// ============================================================
// REPORTS
// ============================================================

export interface UserReportRow {
  id: string;
  product_id: string;
  issue_type: string;
  description: string;
  evidence_urls: string[] | null;
  contact_email: string | null;
  status: string;
  priority: string;
  session_id: string | null;
  ip_hash: string | null;
  user_agent_hash: string | null;
  sla_deadline: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ModerationActionRow {
  id: string;
  report_id: string | null;
  product_id: string | null;
  action: string;
  actor_id: string;
  notes: string | null;
  old_status: string | null;
  new_status: string | null;
  old_tier: string | null;
  new_tier: string | null;
  created_at: Date;
}

// ============================================================
// AFFILIATE CLICKS
// ============================================================

export interface AffiliateClickRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  retailer_id: string;
  session_id: string | null;
  referrer_page: string | null;
  user_agent_hash: string | null;
  is_bot: boolean;
  bot_detection_reason: string | null;
  created_at: Date;
}

// ============================================================
// AUDIT LOG
// ============================================================

export interface AuditLogRow {
  id: number;
  actor_type: string;
  actor_id: string | null;
  actor_ip_hash: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  request_id: string | null;
  created_at: Date;
}

// ============================================================
// ADMIN USERS
// ============================================================

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// VIEWS
// ============================================================

export interface PublishedProductView {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primary_image_url: string | null;
  material_summary: string | null;
  coating_summary: string | null;
  features: Record<string, unknown>;
  published_at: Date | null;
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  category_id: string;
  category_name: string;
  category_path: string[];
  tier: string | null;
  claim_type: string | null;
  scope_text: string | null;
  confidence_score: number | null;
  unknowns: string[] | null;
  decision_date: Date | null;
  evidence_count: number;
}

export interface ReviewQueueView {
  id: string;
  name: string;
  slug: string;
  brand_name: string;
  category_name: string;
  status: string;
  pfas_risk_flagged: boolean;
  requires_elevated_review: boolean;
  tier: string | null;
  review_lane: string | null;
  review_started_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
