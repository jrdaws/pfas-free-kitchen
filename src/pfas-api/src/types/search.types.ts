/**
 * Search Types
 * Type definitions for search service requests, responses, and index documents
 */

import type { VerificationTier, ClaimType } from './domain.types.js';

// ============================================================
// SEARCH REQUEST TYPES
// ============================================================

export interface SearchParams {
  q?: string;
  category_id?: string;
  tiers?: number[];
  materials?: string[];
  coating_types?: string[];
  retailer_id?: string;
  induction?: boolean;
  oven_safe_min?: number;
  dishwasher_safe?: boolean;
  sort?: SearchSortOption;
  page: number;
  limit: number;
}

export type SearchSortOption =
  | 'relevance'
  | 'tier_desc'
  | 'tier_asc'
  | 'name_asc'
  | 'name_desc'
  | 'newest';

// ============================================================
// SEARCH RESPONSE TYPES
// ============================================================

export interface SearchResponse {
  query?: string;
  totalCount: number;
  results: SearchResult[];
  facets: SearchFacets;
  suggestions?: string[];
  educationBanner?: EducationBanner | null;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryPath: string;
  materialSummary?: string;
  coatingSummary?: string;
  tier: VerificationTier;
  claimType?: ClaimType;
  hasEvidence: boolean;
  evidenceCount: number;
  materials: string[];
  coatingType?: string;
  foodContactSurface?: string;
  inductionCompatible?: boolean;
  ovenSafeTempF?: number;
  dishwasherSafe?: boolean;
  highlight?: {
    name?: string[];
    description?: string[];
  };
  score: number;
}

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

export interface EducationBanner {
  type: 'pfoa_clarification' | 'pfas_education' | 'tier_explanation';
  title: string;
  message: string;
  link: string;
  linkText: string;
}

// ============================================================
// AUTOCOMPLETE TYPES
// ============================================================

export interface AutocompleteParams {
  q: string;
  limit?: number;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'product' | 'brand' | 'category';
  id?: string;
  slug?: string;
}

// ============================================================
// INDEX DOCUMENT TYPES
// ============================================================

export interface ProductIndexDocument {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand_id: string;
  brand_name: string;
  category_id: string;
  category_path: string;
  material_summary?: string;
  coating_summary?: string;

  // Verification
  tier: number;
  claim_type?: string;
  has_evidence: boolean;
  evidence_count: number;

  // Facets
  materials: string[];
  coating_type?: string;
  food_contact_surface?: string;
  retailer_ids: string[];

  // Features
  induction_compatible?: boolean;
  oven_safe_temp_f?: number;
  dishwasher_safe?: boolean;

  // Ranking
  tier_boost: number;
  freshness_score: number;

  // Timestamps
  published_at: string;
  updated_at: string;
}

// ============================================================
// INDEX SETTINGS TYPES
// ============================================================

export interface IndexSettings {
  settings: {
    number_of_shards: number;
    number_of_replicas: number;
    analysis: {
      analyzer: Record<string, AnalyzerConfig>;
      filter: Record<string, FilterConfig>;
    };
  };
  mappings: {
    properties: Record<string, MappingProperty>;
  };
}

export interface AnalyzerConfig {
  type: string;
  tokenizer?: string;
  filter?: string[];
}

export interface FilterConfig {
  type: string;
  synonyms?: string[];
  language?: string;
  min_gram?: number;
  max_gram?: number;
}

export interface MappingProperty {
  type: string;
  analyzer?: string;
  fields?: Record<string, MappingProperty>;
}
