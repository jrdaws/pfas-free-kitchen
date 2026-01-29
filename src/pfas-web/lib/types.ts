/**
 * Shared Types for PFAS-Free Kitchen Frontend
 */

// ============================================================
// VERIFICATION TIERS
// ============================================================

export type VerificationTier = 0 | 1 | 2 | 3 | 4;

export type ClaimType = 
  | 'intentionally_pfas_free'
  | 'inherently_pfas_free'
  | 'pfas_free_unknown_method';

export interface TierConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export const TIER_CONFIG: Record<VerificationTier, TierConfig> = {
  0: {
    label: 'Unknown',
    shortLabel: 'Unknown',
    color: 'var(--tier-unknown)',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    icon: '?',
    description: 'PFAS status has not been verified',
  },
  1: {
    label: 'Brand Statement',
    shortLabel: 'Stated',
    color: 'var(--tier-bronze)',
    bgColor: 'rgba(180, 83, 9, 0.1)',
    icon: '✓',
    description: 'Brand claims PFAS-free but no third-party verification',
  },
  2: {
    label: 'Policy Reviewed',
    shortLabel: 'Reviewed',
    color: 'var(--tier-silver)',
    bgColor: 'rgba(100, 116, 139, 0.1)',
    icon: '✓✓',
    description: 'Brand policy and documentation reviewed',
  },
  3: {
    label: 'Lab Tested',
    shortLabel: 'Tested',
    color: 'var(--tier-gold)',
    bgColor: 'rgba(202, 138, 4, 0.1)',
    icon: '🔬',
    description: 'Third-party lab testing confirms PFAS-free',
  },
  4: {
    label: 'Monitored',
    shortLabel: 'Monitored',
    color: 'var(--tier-platinum)',
    bgColor: 'rgba(8, 145, 178, 0.1)',
    icon: '🔬+',
    description: 'Ongoing monitoring and regular re-verification',
  },
};

// ============================================================
// PRODUCT TYPES
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  images: ProductImage[];
  brand: Brand;
  category: Category;
  materialSummary?: string;
  coatingSummary?: string;
  verification: VerificationStatus;
  components: ProductComponent[];
  retailers: RetailerLink[];
  features?: ProductFeatures;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  path: CategoryPath[];
}

export interface CategoryPath {
  id: string;
  name: string;
  slug: string;
}

export interface VerificationStatus {
  tier: VerificationTier;
  claimType?: ClaimType;
  scopeText?: string;
  rationale?: string;
  unknowns: string[];
  hasEvidence: boolean;
  evidenceCount: number;
  decisionDate?: string;
}

export interface ProductComponent {
  id: string;
  role: ComponentRole;
  roleLabel: string;
  material?: Material;
  coating?: Coating;
  pfasStatus: 'verified_free' | 'claimed_free' | 'unknown' | 'contains_pfas';
}

export type ComponentRole = 
  | 'cooking_surface'
  | 'body'
  | 'lid'
  | 'handle'
  | 'rim'
  | 'coating'
  | 'other';

export interface Material {
  id: string;
  name: string;
  slug: string;
}

export interface Coating {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFeatures {
  inductionCompatible?: boolean;
  ovenSafeTempF?: number;
  dishwasherSafe?: boolean;
  weight?: string;
  dimensions?: string;
}

export interface RetailerLink {
  id: string;
  retailer: Retailer;
  url: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
}

export interface Retailer {
  id: string;
  name: string;
  logoUrl?: string;
}

// ============================================================
// EVIDENCE TYPES
// ============================================================

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  sourceUrl?: string;
  capturedAt: string;
  artifactUrl?: string;
}

export type EvidenceType =
  | 'lab_report'
  | 'brand_statement'
  | 'policy_document'
  | 'product_page'
  | 'manufacturer_spec'
  | 'certification'
  | 'other';

// ============================================================
// SEARCH & FILTER TYPES
// ============================================================

export interface SearchParams {
  q?: string;
  category?: string;
  tiers?: VerificationTier[];
  materials?: string[];
  coatingTypes?: string[];
  retailer?: string;
  induction?: boolean;
  ovenSafeMin?: number;
  dishwasherSafe?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption =
  | 'relevance'
  | 'tier_desc'
  | 'tier_asc'
  | 'name_asc'
  | 'name_desc'
  | 'newest';

export interface SearchFacets {
  tiers: FacetBucket[];
  materials: FacetBucket[];
  coatingTypes: FacetBucket[];
  retailers: FacetBucket[];
  categories: FacetBucket[];
  induction: FacetBucket[];
  ovenTempRanges: FacetBucket[];
}

export interface FacetBucket {
  key: string;
  count: number;
  label?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// ============================================================
// EDUCATION BANNER
// ============================================================

export interface EducationBanner {
  type: 'pfoa_clarification' | 'pfas_education' | 'tier_explanation';
  title: string;
  message: string;
  link: string;
  linkText: string;
}

// ============================================================
// COMPARE
// ============================================================

export interface CompareItem {
  productId: string;
  addedAt: string;
}
