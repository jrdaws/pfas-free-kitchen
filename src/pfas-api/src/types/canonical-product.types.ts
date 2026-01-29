/**
 * Canonical Product Types for Ingestion Pipeline
 * All feed sources normalize to this format before enrichment
 */

import type { ProductFeatures } from './domain.types.js';

// ============================================================
// SOURCE TYPES
// ============================================================

export type ProductSource = 'impact' | 'cj' | 'awin' | 'amazon' | 'brand_portal' | 'manual';

// ============================================================
// RAW PRODUCT (Pre-mapping)
// ============================================================

/**
 * Raw product data as received from a feed source
 * Each adapter transforms this to CanonicalProduct
 */
export interface RawProduct {
  source: ProductSource;
  sourceId: string;
  rawData: Record<string, unknown>;
  fetchedAt: Date;
}

// ============================================================
// CANONICAL PRODUCT (Post-mapping, Pre-enrichment)
// ============================================================

/**
 * Normalized product data ready for enrichment
 */
export interface CanonicalProduct {
  // Source tracking
  source: ProductSource;
  sourceId: string;
  
  // External identifiers (used for deduplication)
  gtin?: string;          // UPC/EAN
  asin?: string;          // Amazon ASIN
  mpn?: string;           // Manufacturer part number
  
  // Basic info
  name: string;
  brandName: string;
  description?: string;
  categoryHint?: string;  // Source category (pre-mapping)
  imageUrl?: string;
  
  // Raw attributes (for enrichment to process)
  rawAttributes: Record<string, string>;
  
  // Retailer info
  retailerId: string;
  retailerUrl: string;
  
  // Metadata
  fetchedAt: Date;
}

// ============================================================
// RISK DETECTION
// ============================================================

export type RiskLevel = 'low' | 'moderate_risk' | 'high_risk' | 'auto_reject';

export interface RiskTerm {
  term: string;           // Pattern source
  level: RiskLevel;
  reason: string;         // Human-readable explanation
  matched: string;        // Actual text that matched
  position?: number;      // Position in text
}

export interface RiskDetectionResult {
  terms: RiskTerm[];
  highestRisk: RiskLevel;
  requiresElevatedReview: boolean;
  autoReject: boolean;
  autoRejectReason?: string;
}

// ============================================================
// ENRICHED PRODUCT (Post-enrichment)
// ============================================================

export interface ExtractedMaterial {
  slug: string;           // e.g., 'stainless_steel'
  name: string;           // e.g., 'Stainless Steel'
  confidence: number;     // 0.0 - 1.0
  extractedFrom: string;  // Source text
}

export interface ExtractedCoating {
  slug: string;           // e.g., 'ceramic_sol_gel'
  name: string;           // e.g., 'Ceramic Sol-Gel'
  confidence: number;
  extractedFrom: string;
  isFluoropolymer: boolean;
}

export interface ExtractedComponent {
  name: string;           // e.g., 'Pan body', 'Handle'
  foodContact: boolean;
  material?: ExtractedMaterial;
  coating?: ExtractedCoating;
  pfasRiskFlag: boolean;
}

/**
 * Enriched product ready for database insertion
 */
export interface EnrichedProduct extends CanonicalProduct {
  // Extracted structured data
  materials: ExtractedMaterial[];
  coatings: ExtractedCoating[];
  components: ExtractedComponent[];
  
  // Extracted features
  features: ProductFeatures;
  
  // Risk assessment
  riskTerms: RiskTerm[];
  riskDetection: RiskDetectionResult;
  pfasRiskFlagged: boolean;
  requiresElevatedReview: boolean;
  
  // Category mapping
  categoryId?: string;
  
  // Summaries for display
  materialSummary?: string;
  coatingSummary?: string;
  
  // Enrichment metadata
  enrichedAt: Date;
  enrichmentVersion: string;
}

// ============================================================
// DEDUPLICATION
// ============================================================

export type MatchType = 'gtin' | 'asin' | 'mpn' | 'brand_mpn' | 'fuzzy';

export interface DedupMatch {
  matched: boolean;
  matchType?: MatchType;
  existingProductId?: string;
  confidence: number;     // 0.0 - 1.0
  reason?: string;
}

export interface MergeResult {
  merged: boolean;
  productId: string;
  fieldsUpdated: string[];
  reason?: string;
}

// ============================================================
// INGESTION WORKFLOW
// ============================================================

export type IngestionStatus = 
  | 'received'
  | 'dedup_checked'
  | 'enriched'
  | 'validated'
  | 'created'
  | 'queued'
  | 'merged'
  | 'rejected';

export interface IngestionResult {
  status: IngestionStatus;
  productId?: string;
  reason?: string;
  riskTerms?: RiskTerm[];
  enrichedAt?: Date;
}

export interface IngestionEvent {
  eventType: 'product.ingested' | 'product.enriched' | 'product.rejected' | 'product.queued' | 'product.merged';
  productId?: string;
  source: ProductSource;
  sourceId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ============================================================
// FEED ADAPTER INTERFACE
// ============================================================

export interface FeedAdapter {
  name: string;
  source: ProductSource;
  
  /**
   * Fetch products from the feed source
   * Returns an async generator for memory-efficient processing
   */
  fetchProducts(): AsyncGenerator<RawProduct, void, unknown>;
  
  /**
   * Map raw product to canonical format
   */
  mapToCanonical(raw: RawProduct): CanonicalProduct;
  
  /**
   * Validate feed credentials/connection
   */
  validateConnection(): Promise<boolean>;
}

// ============================================================
// FEED CONFIGURATIONS
// ============================================================

export interface ImpactFeedConfig {
  accountSid: string;
  authToken: string;
  catalogId: string;
  baseUrl?: string;
}

export interface AmazonPAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string;
}

export interface ManualEntryConfig {
  allowedUsers: string[];
  requireApproval: boolean;
}

export type FeedConfig = ImpactFeedConfig | AmazonPAAPIConfig | ManualEntryConfig;
