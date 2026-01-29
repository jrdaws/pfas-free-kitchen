/**
 * API Types - Request/Response shapes for PFAS-Free Kitchen Platform API
 */

import type {
  VerificationTier,
  ClaimType,
  ReportIssueType,
  ReportStatus,
  ReportPriority,
  ProductFeatures,
  EvidenceType,
  EvidenceSource,
} from './domain.types.js';

// ============================================================
// COMMON
// ============================================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FacetItem {
  value: string | number;
  label: string;
  count: number;
}

export interface FacetGroup {
  [key: string]: FacetItem[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// ============================================================
// CATALOG - Products
// ============================================================

export interface ListProductsParams extends PaginationParams {
  categoryId?: string;
  brandId?: string;
  tier?: number[];
  material?: string[];
  coatingType?: string[];
  foodContactSurface?: string[];
  inductionCompatible?: boolean;
  ovenSafeMinTemp?: number;
  retailerId?: string;
  sort?: 'tier_desc' | 'tier_asc' | 'name_asc' | 'name_desc' | 'newest';
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    path: string[];
  };
  primaryImageUrl?: string;
  materialSummary?: string;
  coatingSummary?: string;
  verification: {
    tier: VerificationTier;
    tierLabel: string;
    claimType?: ClaimType;
    claimLabel?: string;
    hasEvidence: boolean;
    evidenceCount: number;
  };
  retailers: {
    id: string;
    name: string;
    icon?: string;
  }[];
  features: ProductFeatures;
}

export interface ProductListResponse {
  data: ProductListItem[];
  pagination: PaginationMeta;
  facets: FacetGroup;
}

export interface ProductDetailBrand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  country?: string;
}

export interface ProductDetailCategory {
  id: string;
  name: string;
  path: string[];
  slug: string;
}

export interface ProductDetailComponent {
  id: string;
  name: string;
  foodContact: boolean;
  material?: {
    id: string;
    name: string;
    family?: string;
  };
  coating?: {
    id: string;
    name: string;
    type?: string;
  } | null;
  pfasRiskFlag: boolean;
}

export interface ProductDetailVerification {
  id: string;
  tier: VerificationTier;
  tierLabel: string;
  claimType?: ClaimType;
  claimTypeLabel?: string;
  claimTypeDescription?: string;
  scopeText?: string;
  scopeComponentIds?: string[];
  confidenceScore?: number;
  decisionDate?: string;
  evidenceIds?: string[];
  unknowns?: string[];
}

export interface ProductDetailEvidence {
  id: string;
  type: EvidenceType;
  typeLabel: string;
  source: string;
  labName?: string;
  methodSummary?: string;
  analyteCount?: number;
  lodLoq?: {
    lodNgG: number;
    loqNgG: number;
    explanation?: string;
  };
  sampleScope?: {
    units: number;
    lots: number;
    components: string[];
  };
  statementText?: string;
  statementDate?: string;
  collectionDate?: string;
  receivedDate?: string;
  artifactUrl: string;
  expiresAt?: string;
}

export interface ProductDetailRetailer {
  id: string;
  name: string;
  icon?: string;
  productUrlMasked: boolean;
}

export interface ProductDetailImage {
  url: string;
  alt: string;
  primary: boolean;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand: ProductDetailBrand;
  category: ProductDetailCategory;
  images: ProductDetailImage[];
  components: ProductDetailComponent[];
  verification?: ProductDetailVerification;
  evidence: ProductDetailEvidence[];
  retailers: ProductDetailRetailer[];
  features: ProductFeatures;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailResponse {
  data: ProductDetail;
}

// ============================================================
// CATALOG - Compare
// ============================================================

export interface CompareProductItem {
  id: string;
  name: string;
  brandName: string;
  verificationTier: VerificationTier;
  claimType?: ClaimType;
  materialSummary?: string;
  coatingSummary?: string;
  foodContactSurface?: string;
  evidenceCount: number;
  features: ProductFeatures;
}

export interface CompareResponse {
  data: {
    products: CompareProductItem[];
    differences: string[];
  };
}

// ============================================================
// CATALOG - Categories
// ============================================================

export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  productCount: number;
  children: CategoryListItem[];
}

export interface CategoriesResponse {
  data: CategoryListItem[];
}

// ============================================================
// VERIFICATION
// ============================================================

export interface VerificationHistoryItem {
  id: string;
  tier: VerificationTier;
  decisionDate: string;
  reason: string;
}

export interface VerificationResponse {
  data: {
    current: {
      id: string;
      tier: VerificationTier;
      tierLabel: string;
      claimType?: ClaimType;
      scopeText?: string;
      confidenceScore?: number;
      decisionDate?: string;
      reviewerId?: string;
      rationale?: string;
      evidenceIds?: string[];
    };
    history: VerificationHistoryItem[];
    nextReviewDue?: string;
    unknowns?: string[];
  };
}

export interface VerificationDecisionRequest {
  productId: string;
  tier: VerificationTier;
  claimType?: ClaimType;
  scopeText?: string;
  scopeComponentIds?: string[];
  confidenceScore?: number;
  rationale: string;
  evidenceIds?: string[];
  unknowns?: string[];
}

export interface VerificationDecisionResponse {
  data: {
    verificationId: string;
    productId: string;
    tier: VerificationTier;
    status: string;
    createdAt: string;
  };
}

// ============================================================
// EVIDENCE
// ============================================================

export interface EvidenceResponse {
  data: {
    id: string;
    type: EvidenceType;
    source: EvidenceSource;
    labName?: string;
    accreditation?: string;
    method?: string;
    methodReference?: string;
    analyteListRef?: string;
    analyteCount?: number;
    lodLoq?: {
      lodNgG: number;
      loqNgG: number;
    };
    sampleScope?: {
      unitsTested: number;
      lotsTested: number;
      componentIds?: string[];
      componentNames?: string[];
    };
    resultSummary?: string;
    statementText?: string;
    statementDate?: string;
    collectionDate?: string;
    reportDate?: string;
    receivedDate?: string;
    artifactUrl: string;
    sha256Hash: string;
    expiresAt?: string;
    createdAt: string;
  };
}

export interface EvidenceUploadMetadata {
  labName?: string;
  accreditation?: string;
  method?: string;
  methodReference?: string;
  analyteListRef?: string;
  lodNgG?: number;
  loqNgG?: number;
  sampleScope?: {
    units: number;
    lots: number;
    componentIds?: string[];
  };
  collectionDate?: string;
  reportDate?: string;
  statementText?: string;
  statementDate?: string;
  signatory?: string;
  sourceUrl?: string;
  capturedAt?: string;
  description?: string;
}

export interface EvidenceUploadResponse {
  data: {
    evidenceId: string;
    artifactUrl: string;
    sha256Hash: string;
    status: string;
    createdAt: string;
  };
}

// ============================================================
// AFFILIATE LINKS
// ============================================================

export interface AffiliateLink {
  retailerId: string;
  retailerName: string;
  retailerIcon?: string;
  affiliateUrl: string;
  disclosureRequired: boolean;
  disclosureText?: string;
}

export interface AffiliateLinksResponse {
  data: {
    productId: string;
    links: AffiliateLink[];
    gridDisclosure?: string;
  };
}

export interface AffiliateClickRequest {
  productId: string;
  retailerId: string;
  sessionId?: string;
  referrerPage?: string;
  userAgentHash?: string;
}

export interface AffiliateClickResponse {
  data: {
    clickId: string;
    tracked: boolean;
  };
}

// ============================================================
// SEARCH
// ============================================================

export interface SearchParams extends PaginationParams {
  q: string;
  categoryId?: string;
  filters?: string;
  sort?: 'relevance' | 'tier_desc' | 'name_asc';
}

export interface SearchResultItem {
  id: string;
  name: string;
  brandName: string;
  score: number;
  highlights: {
    name?: string[];
    description?: string[];
  };
  verificationTier: VerificationTier;
}

export interface EducationBanner {
  type: string;
  title: string;
  message: string;
  link: string;
  linkText: string;
}

export interface SearchResponse {
  data: {
    query: string;
    totalCount: number;
    results: SearchResultItem[];
    facets: FacetGroup;
    suggestions?: {
      didYouMean?: string;
      relatedTerms?: string[];
    };
    educationBanner?: EducationBanner;
  };
}

export interface AutocompleteParams {
  q: string;
  limit?: number;
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'product' | 'brand' | 'category';
}

export interface AutocompleteResponse {
  data: {
    suggestions: AutocompleteSuggestion[];
  };
}

// ============================================================
// REPORTS
// ============================================================

export interface ReportRequest {
  productId: string;
  issueType: ReportIssueType;
  description: string;
  evidenceUrls?: string[];
  contactEmail?: string;
}

export interface ReportResponse {
  data: {
    reportId: string;
    status: ReportStatus;
    priority: ReportPriority;
    slaHours: number;
    message: string;
  };
}

export interface AdminReportListParams extends PaginationParams {
  status?: ReportStatus;
  priority?: ReportPriority;
}

export interface AdminReportItem {
  id: string;
  productId: string;
  productName: string;
  issueType: ReportIssueType;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
  slaDeadline?: string;
}

export interface AdminReportsResponse {
  data: {
    reports: AdminReportItem[];
    pagination: PaginationMeta;
  };
}

export interface UpdateReportRequest {
  status?: ReportStatus;
  priority?: ReportPriority;
  notes?: string;
}

export interface UpdateReportResponse {
  data: {
    reportId: string;
    status: ReportStatus;
    updatedAt: string;
  };
}

// ============================================================
// ADMIN - QUEUE
// ============================================================

export interface QueueItem {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  categoryName: string;
  status: string;
  pfasRiskFlagged: boolean;
  requiresElevatedReview: boolean;
  tier: VerificationTier;
  reviewLane?: string;
  reviewStartedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueResponse {
  data: {
    items: QueueItem[];
    pagination: PaginationMeta;
  };
}

export interface AssignQueueRequest {
  reviewerId: string;
}

export interface AssignQueueResponse {
  data: {
    productId: string;
    assignedTo: string;
    status: string;
    reviewStartedAt: string;
  };
}

// ============================================================
// ADMIN - AUDIT LOG
// ============================================================

export interface AuditLogParams extends PaginationParams {
  entityType?: string;
  entityId?: string;
  action?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogItem {
  id: number;
  actorType: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  requestId?: string;
  createdAt: string;
}

export interface AuditLogResponse {
  data: {
    entries: AuditLogItem[];
    pagination: PaginationMeta;
  };
}
