/**
 * Deduplication Service
 * Finds existing product matches to prevent duplicates
 */

import type {
  CanonicalProduct,
  DedupMatch,
  MergeResult,
  MatchType,
} from '../types/canonical-product.types.js';
import { db } from '../config/database.js';
import { logger } from '../config/logger.js';

// ============================================================
// FUZZY MATCH CONFIGURATION
// ============================================================

const FUZZY_MATCH_THRESHOLD = 0.85;

// ============================================================
// SERVICE IMPLEMENTATION
// ============================================================

export class DedupService {
  /**
   * Find existing product match
   * Priority: GTIN > ASIN > (brand + MPN) > fuzzy name match
   */
  static async findMatch(product: CanonicalProduct): Promise<DedupMatch> {
    // Try GTIN match (highest confidence)
    if (product.gtin) {
      const gtinMatch = await this.findByGtin(product.gtin);
      if (gtinMatch) {
        logger.debug({ gtin: product.gtin, matchedId: gtinMatch }, 'GTIN match found');
        return {
          matched: true,
          matchType: 'gtin',
          existingProductId: gtinMatch,
          confidence: 1.0,
          reason: 'Exact GTIN match',
        };
      }
    }

    // Try ASIN match
    if (product.asin) {
      const asinMatch = await this.findByAsin(product.asin);
      if (asinMatch) {
        logger.debug({ asin: product.asin, matchedId: asinMatch }, 'ASIN match found');
        return {
          matched: true,
          matchType: 'asin',
          existingProductId: asinMatch,
          confidence: 1.0,
          reason: 'Exact ASIN match',
        };
      }
    }

    // Try brand + MPN match
    if (product.mpn) {
      const mpnMatch = await this.findByBrandMpn(product.brandName, product.mpn);
      if (mpnMatch) {
        logger.debug({ brand: product.brandName, mpn: product.mpn, matchedId: mpnMatch }, 'Brand+MPN match found');
        return {
          matched: true,
          matchType: 'brand_mpn',
          existingProductId: mpnMatch,
          confidence: 0.95,
          reason: 'Brand + MPN match',
        };
      }
    }

    // Try fuzzy name match (lowest confidence, requires manual review)
    const fuzzyMatch = await this.findByFuzzyName(product.brandName, product.name);
    if (fuzzyMatch) {
      logger.debug({ name: product.name, matchedId: fuzzyMatch.id, similarity: fuzzyMatch.similarity }, 'Fuzzy match found');
      return {
        matched: true,
        matchType: 'fuzzy',
        existingProductId: fuzzyMatch.id,
        confidence: fuzzyMatch.similarity,
        reason: `Fuzzy name match (${Math.round(fuzzyMatch.similarity * 100)}% similar)`,
      };
    }

    return {
      matched: false,
      confidence: 0,
    };
  }

  /**
   * Find product by GTIN
   */
  private static async findByGtin(gtin: string): Promise<string | null> {
    try {
      // Normalize GTIN to 14 digits
      const normalizedGtin = gtin.padStart(14, '0');
      
      const result = await db.queryOne<{ id: string }>(
        `SELECT id FROM products WHERE gtin = $1 AND status != 'archived' LIMIT 1`,
        [normalizedGtin]
      );
      
      return result?.id || null;
    } catch (err) {
      logger.error({ err, gtin }, 'Error finding product by GTIN');
      return null;
    }
  }

  /**
   * Find product by ASIN (via variants table)
   */
  private static async findByAsin(asin: string): Promise<string | null> {
    try {
      const result = await db.queryOne<{ product_id: string }>(
        `SELECT product_id FROM product_variants WHERE asin = $1 LIMIT 1`,
        [asin.toUpperCase()]
      );
      
      return result?.product_id || null;
    } catch (err) {
      logger.error({ err, asin }, 'Error finding product by ASIN');
      return null;
    }
  }

  /**
   * Find product by brand + MPN combination
   */
  private static async findByBrandMpn(brandName: string, mpn: string): Promise<string | null> {
    try {
      const result = await db.queryOne<{ id: string }>(
        `SELECT p.id 
         FROM products p
         JOIN brands b ON p.brand_id = b.id
         WHERE LOWER(b.name) = LOWER($1) 
           AND LOWER(p.mpn) = LOWER($2)
           AND p.status != 'archived'
         LIMIT 1`,
        [brandName, mpn]
      );
      
      return result?.id || null;
    } catch (err) {
      logger.error({ err, brandName, mpn }, 'Error finding product by brand+MPN');
      return null;
    }
  }

  /**
   * Find product by fuzzy name match
   */
  private static async findByFuzzyName(
    brandName: string, 
    productName: string
  ): Promise<{ id: string; similarity: number } | null> {
    try {
      // Use PostgreSQL trigram similarity for fuzzy matching
      // Requires pg_trgm extension
      const result = await db.queryOne<{ id: string; similarity: number }>(
        `SELECT p.id, similarity(p.name, $2) as similarity
         FROM products p
         JOIN brands b ON p.brand_id = b.id
         WHERE LOWER(b.name) = LOWER($1)
           AND p.status != 'archived'
           AND similarity(p.name, $2) > $3
         ORDER BY similarity DESC
         LIMIT 1`,
        [brandName, productName, FUZZY_MATCH_THRESHOLD]
      );
      
      return result || null;
    } catch (err) {
      // pg_trgm might not be installed, fall back to simple search
      logger.warn({ err }, 'Fuzzy search failed (pg_trgm may not be installed)');
      return null;
    }
  }

  /**
   * Merge new data into existing product (only if new data is more complete)
   */
  static async mergeIfBetter(
    existingId: string,
    newProduct: CanonicalProduct
  ): Promise<MergeResult> {
    try {
      // Fetch existing product
      const existing = await db.queryOne<{
        id: string;
        name: string;
        description: string | null;
        primary_image_url: string | null;
        gtin: string | null;
        mpn: string | null;
      }>(
        `SELECT id, name, description, primary_image_url, gtin, mpn 
         FROM products WHERE id = $1`,
        [existingId]
      );

      if (!existing) {
        return {
          merged: false,
          productId: existingId,
          fieldsUpdated: [],
          reason: 'Existing product not found',
        };
      }

      // Determine what fields can be improved
      const updates: Record<string, unknown> = {};
      const fieldsUpdated: string[] = [];

      // Only update if new value exists and old value is empty
      if (!existing.description && newProduct.description) {
        updates.description = newProduct.description;
        fieldsUpdated.push('description');
      }

      if (!existing.primary_image_url && newProduct.imageUrl) {
        updates.primary_image_url = newProduct.imageUrl;
        fieldsUpdated.push('primary_image_url');
      }

      if (!existing.gtin && newProduct.gtin) {
        updates.gtin = newProduct.gtin;
        fieldsUpdated.push('gtin');
      }

      if (!existing.mpn && newProduct.mpn) {
        updates.mpn = newProduct.mpn;
        fieldsUpdated.push('mpn');
      }

      // Apply updates if any
      if (fieldsUpdated.length > 0) {
        const setClauses = Object.keys(updates)
          .map((key, i) => `${key} = $${i + 2}`)
          .join(', ');
        
        await db.query(
          `UPDATE products SET ${setClauses}, updated_at = NOW() WHERE id = $1`,
          [existingId, ...Object.values(updates)]
        );

        logger.info({
          productId: existingId,
          fieldsUpdated,
          source: newProduct.source,
        }, 'Product merged with new data');
      }

      // Add retailer link if not exists
      await this.addRetailerLinkIfNew(existingId, newProduct);

      return {
        merged: true,
        productId: existingId,
        fieldsUpdated,
        reason: fieldsUpdated.length > 0 
          ? `Updated ${fieldsUpdated.length} fields`
          : 'No updates needed',
      };
    } catch (err) {
      logger.error({ err, existingId }, 'Error merging product data');
      return {
        merged: false,
        productId: existingId,
        fieldsUpdated: [],
        reason: `Merge failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Add retailer link if not already present
   */
  private static async addRetailerLinkIfNew(
    productId: string,
    product: CanonicalProduct
  ): Promise<void> {
    if (!product.retailerId || !product.retailerUrl) return;

    try {
      // Check if link already exists
      const existing = await db.queryOne<{ id: string }>(
        `SELECT id FROM product_retailer_links 
         WHERE product_id = $1 AND retailer_id = $2`,
        [productId, product.retailerId]
      );

      if (!existing) {
        await db.query(
          `INSERT INTO product_retailer_links (product_id, retailer_id, external_url, external_id)
           VALUES ($1, $2, $3, $4)`,
          [productId, product.retailerId, product.retailerUrl, product.sourceId]
        );

        logger.debug({
          productId,
          retailerId: product.retailerId,
        }, 'Added new retailer link');
      }
    } catch (err) {
      logger.warn({ err, productId }, 'Failed to add retailer link');
    }
  }

  /**
   * Calculate similarity score between two strings (simple Jaccard)
   */
  static calculateSimilarity(str1: string, str2: string): number {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
    
    const words1 = new Set(normalize(str1));
    const words2 = new Set(normalize(str2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}
