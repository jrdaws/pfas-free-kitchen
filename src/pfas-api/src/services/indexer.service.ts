/**
 * Indexer Service
 * Manages the OpenSearch product index
 */

import { Client } from '@opensearch-project/opensearch';
import type { ProductIndexDocument } from '../types/search.types.js';
import { getSearchClient, INDICES } from '../config/search.js';
import { db } from '../config/database.js';
import { logger } from '../config/logger.js';

// ============================================================
// INDEXER SERVICE
// ============================================================

export class IndexerService {
  private client: Client;
  private indexName: string;

  constructor() {
    this.client = getSearchClient();
    this.indexName = INDICES.products;
  }

  /**
   * Index a single product
   */
  async indexProduct(productId: string): Promise<void> {
    const document = await this.buildIndexDocument(productId);
    
    if (!document) {
      logger.warn({ productId }, 'Product not found or not publishable, skipping index');
      return;
    }

    await this.client.index({
      index: this.indexName,
      id: productId,
      body: document,
      refresh: true,
    });

    logger.info({ productId }, 'Product indexed');
  }

  /**
   * Remove product from index
   */
  async deindexProduct(productId: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.indexName,
        id: productId,
        refresh: true,
      });
      logger.info({ productId }, 'Product deindexed');
    } catch (error) {
      // Ignore 404 errors (document not found)
      if ((error as { statusCode?: number }).statusCode === 404) {
        logger.debug({ productId }, 'Product not in index, nothing to delete');
        return;
      }
      throw error;
    }
  }

  /**
   * Update product in index (reindex)
   */
  async updateProduct(productId: string): Promise<void> {
    await this.indexProduct(productId);
  }

  /**
   * Bulk index multiple products
   */
  async bulkIndex(productIds: string[]): Promise<{ indexed: number; errors: number }> {
    const documents: Array<{ id: string; doc: ProductIndexDocument }> = [];

    // Build documents
    for (const productId of productIds) {
      const doc = await this.buildIndexDocument(productId);
      if (doc) {
        documents.push({ id: productId, doc });
      }
    }

    if (documents.length === 0) {
      return { indexed: 0, errors: 0 };
    }

    // Build bulk operations
    const operations: object[] = [];
    for (const { id, doc } of documents) {
      operations.push({ index: { _index: this.indexName, _id: id } });
      operations.push(doc);
    }

    const result = await this.client.bulk({
      body: operations,
      refresh: true,
    });

    const errors = result.body.items.filter(
      (item: { index?: { error?: object } }) => item.index?.error
    ).length;

    logger.info({
      requested: productIds.length,
      indexed: documents.length - errors,
      errors,
    }, 'Bulk index completed');

    return {
      indexed: documents.length - errors,
      errors,
    };
  }

  /**
   * Reindex all published products
   */
  async reindexAll(options: { batchSize?: number } = {}): Promise<{
    total: number;
    indexed: number;
    errors: number;
  }> {
    const batchSize = options.batchSize || 100;

    // Get all published product IDs
    const products = await db.query<{ id: string }>(
      `SELECT id FROM products WHERE status = 'published'`
    );

    logger.info({ total: products.length }, 'Starting full reindex');

    let indexed = 0;
    let errors = 0;

    // Process in batches
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const productIds = batch.map(p => p.id);
      
      const result = await this.bulkIndex(productIds);
      indexed += result.indexed;
      errors += result.errors;

      logger.debug({
        progress: `${i + batch.length}/${products.length}`,
        batchIndexed: result.indexed,
        batchErrors: result.errors,
      }, 'Reindex batch completed');
    }

    logger.info({ total: products.length, indexed, errors }, 'Full reindex completed');

    return { total: products.length, indexed, errors };
  }

  /**
   * Build index document from database
   */
  private async buildIndexDocument(productId: string): Promise<ProductIndexDocument | null> {
    // Fetch product with brand and category
    const product = await db.queryOne<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      brand_id: string;
      brand_name: string;
      category_id: string;
      category_path: string;
      material_summary: string | null;
      coating_summary: string | null;
      status: string;
      published_at: Date | null;
      updated_at: Date;
    }>(
      `SELECT 
        p.id, p.name, p.slug, p.description,
        p.brand_id, b.name as brand_name,
        p.category_id, c.path as category_path,
        p.material_summary, p.coating_summary,
        p.status, p.published_at, p.updated_at
       FROM products p
       JOIN brands b ON p.brand_id = b.id
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [productId]
    );

    if (!product || product.status !== 'published') {
      return null;
    }

    // Fetch verification status
    const verification = await db.queryOne<{
      tier: string;
      claim_type: string | null;
      evidence_ids: string[];
      decision_date: Date | null;
    }>(
      `SELECT tier, claim_type, evidence_ids, decision_date
       FROM verification_status WHERE product_id = $1`,
      [productId]
    );

    // Fetch components for materials facet
    const components = await db.query<{
      material_slug: string | null;
      coating_slug: string | null;
      role: string;
    }>(
      `SELECT material_slug, coating_slug, role FROM product_components WHERE product_id = $1`,
      [productId]
    );

    // Fetch retailers
    const retailers = await db.query<{ retailer_id: string }>(
      `SELECT retailer_id FROM retailer_product_links WHERE product_id = $1`,
      [productId]
    );

    // Fetch features
    const features = await db.queryOne<{
      induction_compatible: boolean | null;
      oven_safe_temp_f: number | null;
      dishwasher_safe: boolean | null;
    }>(
      `SELECT induction_compatible, oven_safe_temp_f, dishwasher_safe
       FROM product_features WHERE product_id = $1`,
      [productId]
    );

    // Extract unique materials and coatings
    const materials = [...new Set(
      components.map(c => c.material_slug).filter((m): m is string => !!m)
    )];

    const coatingType = this.determineCoatingType(components);
    const foodContactSurface = this.determineFoodContactSurface(components);

    const tier = verification ? parseInt(verification.tier, 10) : 0;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || undefined,
      brand_id: product.brand_id,
      brand_name: product.brand_name,
      category_id: product.category_id,
      category_path: product.category_path,
      material_summary: product.material_summary || undefined,
      coating_summary: product.coating_summary || undefined,

      // Verification
      tier,
      claim_type: verification?.claim_type || undefined,
      has_evidence: (verification?.evidence_ids?.length || 0) > 0,
      evidence_count: verification?.evidence_ids?.length || 0,

      // Facets
      materials,
      coating_type: coatingType,
      food_contact_surface: foodContactSurface,
      retailer_ids: retailers.map(r => r.retailer_id),

      // Features
      induction_compatible: features?.induction_compatible ?? undefined,
      oven_safe_temp_f: features?.oven_safe_temp_f ?? undefined,
      dishwasher_safe: features?.dishwasher_safe ?? undefined,

      // Ranking signals
      tier_boost: this.calculateTierBoost(tier),
      freshness_score: this.calculateFreshnessScore(verification?.decision_date),

      // Timestamps
      published_at: product.published_at?.toISOString() || new Date().toISOString(),
      updated_at: product.updated_at.toISOString(),
    };
  }

  /**
   * Determine coating type from components
   */
  private determineCoatingType(
    components: Array<{ coating_slug: string | null; role: string }>
  ): string | undefined {
    // Find coating on food-contact surface first
    const foodContactCoating = components.find(
      c => c.role === 'cooking_surface' && c.coating_slug
    );
    if (foodContactCoating?.coating_slug) {
      return foodContactCoating.coating_slug;
    }

    // Otherwise, any coating
    const anyCoating = components.find(c => c.coating_slug);
    return anyCoating?.coating_slug || undefined;
  }

  /**
   * Determine food contact surface material
   */
  private determineFoodContactSurface(
    components: Array<{ material_slug: string | null; role: string }>
  ): string | undefined {
    const surface = components.find(c => c.role === 'cooking_surface');
    return surface?.material_slug || undefined;
  }

  /**
   * Calculate tier boost factor
   */
  private calculateTierBoost(tier: number): number {
    const boosts: Record<number, number> = {
      4: 2.0,
      3: 1.8,
      2: 1.4,
      1: 1.2,
      0: 0.8,
    };
    return boosts[tier] || 1.0;
  }

  /**
   * Calculate freshness score based on decision date
   */
  private calculateFreshnessScore(decisionDate: Date | null | undefined): number {
    if (!decisionDate) return 0.5;

    const daysSinceDecision = (Date.now() - new Date(decisionDate).getTime()) / (1000 * 60 * 60 * 24);
    
    // Decay function: fresher decisions get higher scores
    // Full score within 30 days, decays to 0.5 at 180 days
    if (daysSinceDecision <= 30) return 1.0;
    if (daysSinceDecision >= 180) return 0.5;
    
    return 1.0 - ((daysSinceDecision - 30) / 150) * 0.5;
  }

  /**
   * Check if index exists
   */
  async indexExists(): Promise<boolean> {
    const result = await this.client.indices.exists({ index: this.indexName });
    return result.body;
  }

  /**
   * Get index stats
   */
  async getStats(): Promise<{
    documentCount: number;
    sizeBytes: number;
    healthy: boolean;
  }> {
    try {
      const stats = await this.client.indices.stats({ index: this.indexName });
      return {
        documentCount: stats.body._all.primaries.docs.count,
        sizeBytes: stats.body._all.primaries.store.size_in_bytes,
        healthy: true,
      };
    } catch {
      return {
        documentCount: 0,
        sizeBytes: 0,
        healthy: false,
      };
    }
  }
}

// Export singleton instance
export const indexerService = new IndexerService();
