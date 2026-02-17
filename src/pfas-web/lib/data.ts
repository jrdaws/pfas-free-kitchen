/**
 * PFAS-Free Kitchen - Data Fetching Functions
 *
 * Server-side data fetching for Next.js pages.
 * Uses local product data when API is unavailable (no backend deployed).
 */

import { APIClient, APIError, isAPIError } from './api';
import {
  getLocalProducts,
  getLocalProduct,
  getLocalCategories,
  getLocalRelatedProducts,
  getLocalSearchResults,
} from './localData';
import type {
  Product,
  Category,
  SearchFacets,
  Pagination,
  VerificationTier,
  RetailerLink,
  EducationBanner,
} from './types';

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
  facets: SearchFacets;
}

export interface ProductDetailResponse extends Product {
  // Full product with all details
}

export interface CategoryTreeResponse {
  data: CategoryNode[];
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
  productCount: number;
}

export interface SearchResponse {
  query: string;
  totalCount: number;
  results: SearchResult[];
  facets: SearchFacets;
  suggestions?: SearchSuggestions;
  educationBanner?: EducationBanner | null;
}

export interface SearchResult {
  id: string;
  name: string;
  brandName: string;
  score: number;
  highlights: {
    name?: string[];
    description?: string[];
  };
  verificationTier: VerificationTier;
  imageUrl?: string;
  slug: string;
}

export interface SearchSuggestions {
  didYouMean: string | null;
  relatedTerms: string[];
}

// EducationBanner is defined in types.ts

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'product' | 'brand' | 'category';
}

export interface AffiliateLinksResponse {
  productId: string;
  links: AffiliateLink[];
  gridDisclosure: string;
}

export interface AffiliateLink {
  retailerId: string;
  retailerName: string;
  retailerIcon: string;
  affiliateUrl: string;
  disclosureRequired: boolean;
  disclosureText: string;
}

export interface ReportSubmissionResponse {
  reportId: string;
  status: string;
  priority: string;
  slaHours: number;
  message: string;
}

export interface ClickTrackResponse {
  clickId: string;
  tracked: boolean;
}

// ============================================================
// DATA FETCHING FUNCTIONS
// ============================================================

/**
 * Fetch products with filters and pagination.
 * Falls back to local product data when API is unavailable.
 */
export async function fetchProducts(params: {
  category?: string;
  tier?: number[];
  material?: string[];
  coating?: string[];
  retailer?: string;
  induction?: boolean;
  ovenSafeMin?: number;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<ProductListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category_id', params.category);
    if (params.tier?.length) {
      params.tier.forEach(t => searchParams.append('tier', t.toString()));
    }
    if (params.material?.length) {
      params.material.forEach(m => searchParams.append('material', m));
    }
    if (params.coating?.length) {
      params.coating.forEach(c => searchParams.append('coating_type', c));
    }
    if (params.retailer) searchParams.set('retailer_id', params.retailer);
    if (params.induction !== undefined) searchParams.set('induction_compatible', String(params.induction));
    if (params.ovenSafeMin) searchParams.set('oven_safe_min_temp', params.ovenSafeMin.toString());
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sort) searchParams.set('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return await APIClient.get<ProductListResponse>(endpoint);
  } catch (error) {
    return getLocalProducts({
      category: params.category,
      tier: params.tier,
      material: params.material,
      coating: params.coating,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
    });
  }
}

/**
 * Fetch a single product by slug or ID.
 * Returns null if not found.
 * Falls back to local product data when API is unavailable.
 */
export async function fetchProduct(slugOrId: string): Promise<ProductDetailResponse | null> {
  try {
    return await APIClient.get<ProductDetailResponse>(`/products/${slugOrId}`);
  } catch (error) {
    if (isAPIError(error) && error.isNotFound) {
      return null;
    }
    const local = getLocalProduct(slugOrId);
    return local ?? null;
  }
}

/**
 * Fetch comparison data for multiple products.
 * Falls back to local product data when API is unavailable.
 */
export async function fetchProductComparison(productIds: string[]): Promise<{
  products: Product[];
  differences: string[];
}> {
  try {
    const ids = productIds.join(',');
    return await APIClient.get(`/products/compare?ids=${ids}`);
  } catch {
    const products = productIds
      .map(id => getLocalProduct(id))
      .filter((p): p is Product => p !== null);
    return { products, differences: [] };
  }
}

/**
 * Fetch verification details for a product.
 */
export async function fetchVerification(productId: string): Promise<{
  current: {
    id: string;
    tier: VerificationTier;
    tierLabel: string;
    claimType: string | null;
    scopeText: string | null;
    confidenceScore: number | null;
    decisionDate: string | null;
    rationale: string | null;
    evidenceIds: string[];
  };
  history: Array<{
    id: string;
    tier: VerificationTier;
    decisionDate: string;
    reason: string;
  }>;
  nextReviewDue: string | null;
  unknowns: string[];
}> {
  return APIClient.get(`/products/${productId}/verification`);
}

/**
 * Fetch all categories with hierarchy.
 * Falls back to local categories when API is unavailable.
 */
export async function fetchCategories(): Promise<CategoryNode[]> {
  try {
    const response = await APIClient.get<CategoryTreeResponse | CategoryNode[]>('/categories');
    return Array.isArray(response) ? response : (response.data ?? []);
  } catch {
    return getLocalCategories();
  }
}

/**
 * Search products.
 * Falls back to local search when API is unavailable.
 */
export async function searchProducts(
  query: string,
  filters?: {
    categoryId?: string;
    tier?: number[];
    material?: string[];
    sort?: string;
    page?: number;
    limit?: number;
  }
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      if (filters.categoryId) params.set('category_id', filters.categoryId);
      if (filters.tier?.length) {
        filters.tier.forEach(t => params.append('tier', t.toString()));
      }
      if (filters.material?.length) {
        filters.material.forEach(m => params.append('material', m));
      }
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
    }
    return await APIClient.get(`/search?${params.toString()}`);
  } catch {
    return getLocalSearchResults(query, {
      categoryId: filters?.categoryId,
      tier: filters?.tier,
      page: filters?.page,
      limit: filters?.limit,
    });
  }
}

/**
 * Get search autocomplete suggestions.
 */
export async function fetchAutocomplete(query: string, limit?: number): Promise<AutocompleteSuggestion[]> {
  const params = new URLSearchParams({ q: query });
  if (limit) params.set('limit', limit.toString());

  const response = await APIClient.get<AutocompleteResponse>(`/search/autocomplete?${params.toString()}`);
  return response.suggestions;
}

/**
 * Fetch affiliate links for a product.
 * Falls back to building links from product retailers when API is unavailable.
 */
export async function fetchAffiliateLinks(productId: string): Promise<AffiliateLinksResponse> {
  try {
    return await APIClient.get(`/products/${productId}/affiliate-links`);
  } catch {
    const product = getLocalProduct(productId);
    if (!product?.retailers?.length) {
      return {
        productId,
        links: [],
        gridDisclosure: 'As an Amazon Associate and affiliate partner, we earn from qualifying purchases.',
      };
    }
    const links: AffiliateLink[] = product.retailers.map(r => ({
      retailerId: r.retailer.id,
      retailerName: r.retailer.name,
      retailerIcon: r.retailer.logoUrl || '',
      affiliateUrl: r.url,
      disclosureRequired: true,
      disclosureText: 'We earn a commission when you purchase through our links.',
    }));
    return {
      productId,
      links,
      gridDisclosure: 'As an Amazon Associate and affiliate partner, we earn from qualifying purchases.',
    };
  }
}

/**
 * Track an affiliate link click via API.
 * @deprecated Use trackClick from tracking.ts instead - it includes deduplication and GA.
 */
export async function trackClickAPI(data: {
  productId: string;
  retailerId: string;
  sessionId?: string;
  referrerPage?: string;
}): Promise<ClickTrackResponse> {
  return APIClient.post('/affiliate-clicks', {
    product_id: data.productId,
    retailer_id: data.retailerId,
    session_id: data.sessionId,
    referrer_page: data.referrerPage,
    user_agent_hash: typeof window !== 'undefined' 
      ? btoa(navigator.userAgent).slice(0, 32) 
      : undefined,
  });
}

/**
 * Submit a product issue report.
 */
export async function submitReport(data: {
  productId: string;
  issueType: 'suspected_pfas' | 'materials_changed' | 'listing_mismatch' | 'counterfeit_risk' | 'other';
  description: string;
  evidenceUrls?: string[];
  contactEmail?: string;
}): Promise<ReportSubmissionResponse> {
  return APIClient.post('/reports', {
    product_id: data.productId,
    issue_type: data.issueType,
    description: data.description,
    evidence_urls: data.evidenceUrls,
    contact_email: data.contactEmail,
  });
}

/**
 * Fetch evidence metadata by ID.
 */
export async function fetchEvidence(evidenceId: string): Promise<{
  id: string;
  type: string;
  typeLabel: string;
  source: string;
  metadata: Record<string, unknown>;
  artifactUrl: string;
  sha256Hash: string;
  receivedDate: string;
  expiresAt: string | null;
}> {
  return APIClient.get(`/evidence/${evidenceId}`);
}

/**
 * Fetch related products for a category.
 * Falls back to local products when API is unavailable.
 */
export async function fetchRelatedProducts(
  categoryId?: string,
  excludeProductId?: string,
  limit: number = 8
): Promise<Product[]> {
  if (!categoryId) return [];

  try {
    const params = new URLSearchParams({
      category_id: categoryId,
      limit: limit.toString(),
    });
    if (excludeProductId) {
      params.set('exclude', excludeProductId);
    }
    const response = await APIClient.get<ProductListResponse>(`/products?${params.toString()}`);
    return response.data.filter(p => p.id !== excludeProductId).slice(0, limit);
  } catch {
    return getLocalRelatedProducts(categoryId, excludeProductId, limit);
  }
}

/**
 * Get the artifact download URL for evidence.
 */
export function getEvidenceArtifactUrl(evidenceId: string): string {
  return `${APIClient.getBaseUrl()}/evidence/${evidenceId}/artifact`;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Handle API errors gracefully.
 * Returns a default value if the error is expected (404, etc.)
 */
export async function withFallback<T>(
  promise: Promise<T>,
  fallback: T,
  options?: { handle404?: boolean; handleServerError?: boolean }
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (isAPIError(error)) {
      if (options?.handle404 && error.isNotFound) {
        return fallback;
      }
      if (options?.handleServerError && error.isServerError) {
        console.error('API server error:', error.message);
        return fallback;
      }
    }
    throw error;
  }
}

/**
 * Retry a request with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; baseDelay?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelay = options?.baseDelay ?? 1000;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors (4xx)
      if (isAPIError(error) && !error.isServerError && !error.isRateLimited) {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
