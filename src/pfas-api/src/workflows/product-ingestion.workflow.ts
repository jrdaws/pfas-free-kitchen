/**
 * Product Ingestion Workflow
 * Orchestrates the complete product ingestion pipeline
 */

import type {
  CanonicalProduct,
  EnrichedProduct,
  IngestionResult,
  IngestionEvent,
} from '../types/canonical-product.types.js';
import { EnrichmentService } from '../services/enrichment.service.js';
import { DedupService } from '../services/dedup.service.js';
import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// EVENT PUBLISHER (Interface for queue integration)
// ============================================================

export interface EventPublisher {
  publish(event: IngestionEvent): Promise<void>;
}

// Default no-op publisher (replace with SQS/SNS in production)
let eventPublisher: EventPublisher = {
  async publish(event: IngestionEvent) {
    logger.info({ event }, 'Event published (no-op)');
  },
};

export function setEventPublisher(publisher: EventPublisher): void {
  eventPublisher = publisher;
}

// ============================================================
// WORKFLOW IMPLEMENTATION
// ============================================================

export async function productIngestionWorkflow(
  product: CanonicalProduct
): Promise<IngestionResult> {
  const workflowId = uuidv4();
  
  logger.info({
    workflowId,
    source: product.source,
    sourceId: product.sourceId,
    name: product.name.substring(0, 80),
  }, 'Starting product ingestion workflow');

  try {
    // Publish: product.ingested
    await eventPublisher.publish({
      eventType: 'product.ingested',
      source: product.source,
      sourceId: product.sourceId,
      timestamp: new Date(),
      metadata: { workflowId },
    });

    // Step 1: Check for duplicates
    const dedupResult = await DedupService.findMatch(product);
    
    if (dedupResult.matched) {
      // If exact match (not fuzzy), merge and return
      if (dedupResult.matchType !== 'fuzzy') {
        const mergeResult = await DedupService.mergeIfBetter(
          dedupResult.existingProductId!,
          product
        );

        await eventPublisher.publish({
          eventType: 'product.merged',
          productId: dedupResult.existingProductId,
          source: product.source,
          sourceId: product.sourceId,
          timestamp: new Date(),
          metadata: { 
            workflowId, 
            matchType: dedupResult.matchType,
            fieldsUpdated: mergeResult.fieldsUpdated,
          },
        });

        logger.info({
          workflowId,
          status: 'merged',
          existingProductId: dedupResult.existingProductId,
          matchType: dedupResult.matchType,
        }, 'Product merged with existing record');

        return {
          status: 'merged',
          productId: dedupResult.existingProductId,
          reason: `Merged with existing product (${dedupResult.matchType} match)`,
        };
      }
      
      // Fuzzy match - log but continue with new product creation
      logger.info({
        workflowId,
        potentialMatch: dedupResult.existingProductId,
        confidence: dedupResult.confidence,
      }, 'Fuzzy match found - creating as new (may need manual dedup)');
    }

    // Step 2: Enrich product
    const enriched = await EnrichmentService.enrich(product);

    await eventPublisher.publish({
      eventType: 'product.enriched',
      source: product.source,
      sourceId: product.sourceId,
      timestamp: new Date(),
      metadata: {
        workflowId,
        riskLevel: enriched.riskDetection.highestRisk,
        materialsFound: enriched.materials.length,
        coatingsFound: enriched.coatings.length,
      },
    });

    // Step 3: Auto-reject check
    if (enriched.riskDetection.autoReject) {
      await eventPublisher.publish({
        eventType: 'product.rejected',
        source: product.source,
        sourceId: product.sourceId,
        timestamp: new Date(),
        metadata: {
          workflowId,
          reason: enriched.riskDetection.autoRejectReason,
          terms: enriched.riskTerms,
        },
      });

      await logRejection(product, enriched);

      logger.info({
        workflowId,
        status: 'rejected',
        reason: enriched.riskDetection.autoRejectReason,
      }, 'Product auto-rejected');

      return {
        status: 'rejected',
        reason: enriched.riskDetection.autoRejectReason,
        riskTerms: enriched.riskTerms,
      };
    }

    // Step 4: Create product record
    const productId = await createProductRecord(enriched);

    // Step 5: Create components
    await createComponentRecords(productId, enriched);

    // Step 6: Create retailer link
    await createRetailerLink(productId, enriched);

    // Step 7: Create initial verification status (tier 0)
    await createVerificationStatus(productId, enriched);

    // Step 8: Queue for review
    const reviewLane = enriched.requiresElevatedReview ? 'high_risk' : 'standard';
    
    await eventPublisher.publish({
      eventType: 'product.queued',
      productId,
      source: product.source,
      sourceId: product.sourceId,
      timestamp: new Date(),
      metadata: {
        workflowId,
        reviewLane,
        pfasRiskFlagged: enriched.pfasRiskFlagged,
      },
    });

    // Step 9: Audit log
    await logProductCreated(productId, product);

    logger.info({
      workflowId,
      status: 'queued',
      productId,
      reviewLane,
    }, 'Product created and queued for review');

    return {
      status: 'queued',
      productId,
      enrichedAt: enriched.enrichedAt,
    };

  } catch (err) {
    logger.error({
      workflowId,
      err,
      source: product.source,
      sourceId: product.sourceId,
    }, 'Product ingestion workflow failed');

    throw err;
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function createProductRecord(enriched: EnrichedProduct): Promise<string> {
  const productId = uuidv4();
  
  // Find or create brand
  const brandId = await findOrCreateBrand(enriched.brandName);

  await db.query(
    `INSERT INTO products (
      id, brand_id, category_id, name, slug, description,
      primary_image_url, status, material_summary, coating_summary,
      features, gtin, mpn, pfas_risk_flagged, requires_elevated_review
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
    )`,
    [
      productId,
      brandId,
      enriched.categoryId || null,
      enriched.name,
      generateSlug(enriched.brandName, enriched.name),
      enriched.description || null,
      enriched.imageUrl || null,
      'pending_review',
      enriched.materialSummary || null,
      enriched.coatingSummary || null,
      JSON.stringify(enriched.features),
      enriched.gtin || null,
      enriched.mpn || null,
      enriched.pfasRiskFlagged,
      enriched.requiresElevatedReview,
    ]
  );

  return productId;
}

async function findOrCreateBrand(brandName: string): Promise<string> {
  const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  // Try to find existing brand
  const existing = await db.queryOne<{ id: string }>(
    `SELECT id FROM brands WHERE LOWER(name) = LOWER($1) OR slug = $2`,
    [brandName, slug]
  );

  if (existing) {
    return existing.id;
  }

  // Create new brand
  const brandId = uuidv4();
  await db.query(
    `INSERT INTO brands (id, name, slug) VALUES ($1, $2, $3)`,
    [brandId, brandName, slug]
  );

  return brandId;
}

async function createComponentRecords(
  productId: string,
  enriched: EnrichedProduct
): Promise<void> {
  for (let i = 0; i < enriched.components.length; i++) {
    const component = enriched.components[i];
    
    // Find material and coating IDs
    const materialId = component.material 
      ? await findMaterialBySlug(component.material.slug)
      : null;
    const coatingId = component.coating
      ? await findCoatingBySlug(component.coating.slug)
      : null;

    await db.query(
      `INSERT INTO product_components (
        id, product_id, name, food_contact, material_id, coating_id, pfas_risk_flag, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        productId,
        component.name,
        component.foodContact,
        materialId,
        coatingId,
        component.pfasRiskFlag,
        i,
      ]
    );
  }
}

async function findMaterialBySlug(slug: string): Promise<string | null> {
  const result = await db.queryOne<{ id: string }>(
    `SELECT id FROM materials WHERE slug = $1`,
    [slug]
  );
  return result?.id || null;
}

async function findCoatingBySlug(slug: string): Promise<string | null> {
  const result = await db.queryOne<{ id: string }>(
    `SELECT id FROM coatings WHERE slug = $1`,
    [slug]
  );
  return result?.id || null;
}

async function createRetailerLink(
  productId: string,
  enriched: EnrichedProduct
): Promise<void> {
  if (!enriched.retailerId || enriched.retailerId === 'manual') return;

  // Find retailer
  const retailer = await db.queryOne<{ id: string }>(
    `SELECT id FROM retailers WHERE id = $1 OR slug = $1`,
    [enriched.retailerId]
  );

  if (!retailer) {
    logger.warn({ retailerId: enriched.retailerId }, 'Retailer not found');
    return;
  }

  await db.query(
    `INSERT INTO product_retailer_links (
      id, product_id, retailer_id, external_id, external_url
    ) VALUES ($1, $2, $3, $4, $5)`,
    [uuidv4(), productId, retailer.id, enriched.sourceId, enriched.retailerUrl]
  );
}

async function createVerificationStatus(
  productId: string,
  enriched: EnrichedProduct
): Promise<void> {
  await db.query(
    `INSERT INTO verification_status (
      id, product_id, tier, review_lane, unknowns
    ) VALUES ($1, $2, $3, $4, $5)`,
    [
      uuidv4(),
      productId,
      '0', // Start at tier 0 (Unknown)
      enriched.requiresElevatedReview ? 'high_risk' : 'standard',
      enriched.riskTerms.length > 0 
        ? JSON.stringify(enriched.riskTerms.map(t => t.reason))
        : null,
    ]
  );
}

async function logProductCreated(
  productId: string,
  product: CanonicalProduct
): Promise<void> {
  await db.query(
    `INSERT INTO audit_log (
      actor_type, action, entity_type, entity_id, new_values, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      'system',
      'product.created',
      'product',
      productId,
      JSON.stringify({
        name: product.name,
        source: product.source,
        sourceId: product.sourceId,
      }),
      JSON.stringify({
        ingestionSource: product.source,
        retailerId: product.retailerId,
      }),
    ]
  );
}

async function logRejection(
  product: CanonicalProduct,
  enriched: EnrichedProduct
): Promise<void> {
  await db.query(
    `INSERT INTO audit_log (
      actor_type, action, entity_type, entity_id, new_values, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      'system',
      'product.rejected',
      'ingestion',
      product.sourceId,
      JSON.stringify({
        name: product.name,
        reason: enriched.riskDetection.autoRejectReason,
        riskTerms: enriched.riskTerms,
      }),
      JSON.stringify({
        source: product.source,
        sourceId: product.sourceId,
      }),
    ]
  );
}

function generateSlug(brandName: string, productName: string): string {
  const combined = `${brandName} ${productName}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 500);
}

// ============================================================
// BATCH PROCESSING
// ============================================================

export interface BatchIngestionResult {
  total: number;
  queued: number;
  merged: number;
  rejected: number;
  failed: number;
  results: IngestionResult[];
}

/**
 * Process multiple products in batch
 */
export async function batchIngestionWorkflow(
  products: CanonicalProduct[]
): Promise<BatchIngestionResult> {
  const results: IngestionResult[] = [];
  let queued = 0;
  let merged = 0;
  let rejected = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const result = await productIngestionWorkflow(product);
      results.push(result);

      switch (result.status) {
        case 'queued':
          queued++;
          break;
        case 'merged':
          merged++;
          break;
        case 'rejected':
          rejected++;
          break;
      }
    } catch (err) {
      failed++;
      results.push({
        status: 'rejected',
        reason: err instanceof Error ? err.message : 'Unknown error',
      });
      logger.error({ err, product: product.name }, 'Batch ingestion item failed');
    }
  }

  return {
    total: products.length,
    queued,
    merged,
    rejected,
    failed,
    results,
  };
}
