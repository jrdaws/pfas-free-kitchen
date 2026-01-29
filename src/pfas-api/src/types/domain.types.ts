/**
 * Domain Types - Core business entities for PFAS-Free Kitchen Platform
 */

// ============================================================
// ENUMS
// ============================================================

export type VerificationTier = 0 | 1 | 2 | 3 | 4;

export type ClaimType = 'A' | 'B' | 'C';

export type EvidenceType = 
  | 'lab_report'
  | 'brand_statement'
  | 'policy_document'
  | 'screenshot'
  | 'correspondence';

export type EvidenceSource = 
  | 'brand_submission'
  | 'retailer'
  | 'user_report'
  | 'internal';

export type ProductStatus = 
  | 'draft'
  | 'pending_review'
  | 'under_review'
  | 'published'
  | 'suspended'
  | 'archived';

export type ReportStatus = 
  | 'submitted'
  | 'under_review'
  | 'resolved'
  | 'dismissed';

export type ReportPriority = 'low' | 'normal' | 'high' | 'critical';

export type ReportIssueType = 
  | 'suspected_pfas'
  | 'materials_changed'
  | 'listing_mismatch'
  | 'counterfeit_risk'
  | 'other';

// ============================================================
// TIER LABELS
// ============================================================

export const TIER_LABELS: Record<VerificationTier, string> = {
  0: 'Unknown',
  1: 'Brand Statement',
  2: 'Policy Reviewed',
  3: 'Lab Tested',
  4: 'Monitored',
};

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  A: 'No intentional addition',
  B: 'Below detection limit',
  C: 'Certified PFAS-free',
};

// ============================================================
// BRAND
// ============================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  country?: string;
  logoUrl?: string;
  pfasPolicyUrl?: string;
  pfasPolicySummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// CATEGORY
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  pathSlugs: string[];
  description?: string;
  sortOrder: number;
  active: boolean;
  productCount?: number;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// MATERIAL & COATING
// ============================================================

export interface Material {
  id: string;
  name: string;
  slug: string;
  family?: string;
  pfasRiskDefault: boolean;
  notes?: string;
}

export interface Coating {
  id: string;
  name: string;
  slug: string;
  type?: string;
  isFluoropolymer: boolean;
  pfasRiskDefault: boolean;
  marketingTerms?: string[];
  notes?: string;
}

// ============================================================
// PRODUCT
// ============================================================

export interface Product {
  id: string;
  brandId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  primaryImageUrl?: string;
  status: ProductStatus;
  materialSummary?: string;
  coatingSummary?: string;
  features: ProductFeatures;
  gtin?: string;
  mpn?: string;
  pfasRiskFlagged: boolean;
  requiresElevatedReview: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ProductFeatures {
  inductionCompatible?: boolean;
  ovenSafeTempF?: number;
  ovenSafeTempC?: number;
  dishwasherSafe?: boolean;
  metalUtensilSafe?: boolean;
  microwaveSafe?: boolean;
  freezerSafe?: boolean;
  sizesAvailable?: string[];
  weightLbs?: number;
}

export interface ProductComponent {
  id: string;
  productId: string;
  name: string;
  foodContact: boolean;
  materialId?: string;
  coatingId?: string;
  pfasRiskFlag: boolean;
  notes?: string;
  sortOrder: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  primary: boolean;
}

// ============================================================
// RETAILER & AFFILIATE
// ============================================================

export interface Retailer {
  id: string;
  name: string;
  slug: string;
  domain: string;
  affiliateProgramId?: string;
  iconName?: string;
  priority: number;
  active: boolean;
}

export interface AffiliateProgram {
  id: string;
  name: string;
  network?: string;
  termsUrl?: string;
  priceDisplayAllowed: boolean;
  priceCacheMaxHours?: number;
  requiresApi: boolean;
  apiName?: string;
  active: boolean;
}

// ============================================================
// EVIDENCE
// ============================================================

export interface Evidence {
  id: string;
  type: EvidenceType;
  source: EvidenceSource;
  storageUri: string;
  sha256Hash: string;
  fileSizeBytes: number;
  mimeType: string;
  originalFilename?: string;
  receivedAt: Date;
  expiresAt?: Date;
  metadata: EvidenceMetadata;
  deletedAt?: Date;
  deletionReason?: string;
  createdAt: Date;
}

export type EvidenceMetadata = 
  | LabReportMetadata 
  | BrandStatementMetadata 
  | ScreenshotMetadata
  | Record<string, unknown>;

export interface LabReportMetadata {
  labName: string;
  accreditation?: string;
  method: string;
  methodReference?: string;
  analyteListRef?: string;
  analyteCount: number;
  lodNgG?: number;
  loqNgG?: number;
  sampleScope: {
    units: number;
    lots: number;
    componentIds?: string[];
  };
  collectionDate: string;
  reportDate: string;
  resultSummary?: string;
}

export interface BrandStatementMetadata {
  statementText: string;
  statementDate: string;
  signatory?: string;
}

export interface ScreenshotMetadata {
  sourceUrl: string;
  capturedAt: string;
  description?: string;
}

// ============================================================
// VERIFICATION
// ============================================================

export interface Verification {
  id: string;
  productId: string;
  tier: VerificationTier;
  claimType?: ClaimType;
  scopeText?: string;
  scopeComponentIds?: string[];
  confidenceScore?: number;
  unknowns?: string[];
  decisionDate?: Date;
  reviewerId?: string;
  rationale?: string;
  evidenceIds?: string[];
  nextReviewDue?: Date;
  reviewStartedAt?: Date;
  reviewLane?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationHistory {
  id: string;
  productId: string;
  fromTier?: VerificationTier;
  toTier: VerificationTier;
  fromClaimType?: ClaimType;
  toClaimType?: ClaimType;
  reason: string;
  evidenceIds?: string[];
  reviewerId?: string;
  createdAt: Date;
}

// ============================================================
// REPORTS
// ============================================================

export interface UserReport {
  id: string;
  productId: string;
  issueType: ReportIssueType;
  description: string;
  evidenceUrls?: string[];
  contactEmail?: string;
  status: ReportStatus;
  priority: ReportPriority;
  sessionId?: string;
  ipHash?: string;
  userAgentHash?: string;
  slaDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// AFFILIATE CLICKS
// ============================================================

export interface AffiliateClick {
  id: string;
  productId: string;
  variantId?: string;
  retailerId: string;
  sessionId?: string;
  referrerPage?: string;
  userAgentHash?: string;
  isBot: boolean;
  botDetectionReason?: string;
  createdAt: Date;
}

// ============================================================
// AUDIT LOG
// ============================================================

export interface AuditLogEntry {
  id: number;
  actorType: 'system' | 'admin' | 'api' | 'scheduler';
  actorId?: string;
  actorIpHash?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  requestId?: string;
  createdAt: Date;
}
