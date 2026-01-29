/**
 * PFAS-Free Kitchen Platform - Evidence Repository
 * 
 * Database operations for evidence objects with immutability guarantees.
 * Note: NO hard delete, NO update of core fields (storage_uri, sha256_hash).
 * 
 * @see docs/pfas-platform/02-TECHNICAL-DESIGN.md "evidence_objects" schema
 */

import crypto from 'crypto';
import type { EvidenceType, EvidenceSource, EvidenceMetadata } from '../schemas/evidence-metadata.schema';

/**
 * Evidence row as stored in database.
 */
export interface EvidenceRow {
  id: string;
  type: EvidenceType;
  source: EvidenceSource;
  
  // Storage (IMMUTABLE after creation)
  storage_uri: string;
  sha256_hash: string;
  file_size_bytes: number;
  mime_type: string;
  original_filename: string | null;
  
  // Timestamps
  received_at: Date;
  expires_at: Date | null;
  
  // Type-specific metadata
  metadata: EvidenceMetadata;
  
  // Soft delete
  deleted_at: Date | null;
  deletion_reason: string | null;
  
  created_at: Date;
}

/**
 * Parameters for creating evidence.
 */
export interface CreateEvidenceParams {
  type: EvidenceType;
  source: EvidenceSource;
  storage_uri: string;
  sha256_hash: string;
  file_size_bytes: number;
  mime_type: string;
  original_filename?: string;
  expires_at?: Date;
  metadata: EvidenceMetadata;
}

/**
 * Product-Evidence link row.
 */
export interface ProductEvidenceRow {
  product_id: string;
  evidence_id: string;
  component_id: string | null;
  added_at: Date;
  added_by: string | null;
  notes: string | null;
}

// In-memory storage (replace with actual database in production)
const evidenceStore = new Map<string, EvidenceRow>();
const productEvidenceStore: ProductEvidenceRow[] = [];

/**
 * Generate a unique evidence ID.
 */
function generateEvidenceId(): string {
  return `ev_${crypto.randomBytes(12).toString('hex')}`;
}

/**
 * Evidence Repository - Database operations for evidence objects.
 * 
 * Critical constraints:
 * - NO hard delete (use soft delete via deleted_at)
 * - NO update of storage_uri or sha256_hash after creation
 * - All queries exclude soft-deleted records by default
 */
export class EvidenceRepository {
  /**
   * Create a new evidence record.
   * 
   * @param evidence - Evidence creation parameters
   * @returns Generated evidence ID
   */
  static async create(evidence: CreateEvidenceParams): Promise<string> {
    const id = generateEvidenceId();
    const now = new Date();
    
    const row: EvidenceRow = {
      id,
      type: evidence.type,
      source: evidence.source,
      storage_uri: evidence.storage_uri,
      sha256_hash: evidence.sha256_hash,
      file_size_bytes: evidence.file_size_bytes,
      mime_type: evidence.mime_type,
      original_filename: evidence.original_filename ?? null,
      received_at: now,
      expires_at: evidence.expires_at ?? null,
      metadata: evidence.metadata,
      deleted_at: null,
      deletion_reason: null,
      created_at: now,
    };
    
    evidenceStore.set(id, row);
    return id;
  }

  /**
   * Find evidence by ID.
   * Returns null for soft-deleted records.
   * 
   * @param id - Evidence ID
   * @returns Evidence row or null
   */
  static async findById(id: string): Promise<EvidenceRow | null> {
    const row = evidenceStore.get(id);
    
    if (!row || row.deleted_at !== null) {
      return null;
    }
    
    return { ...row };
  }

  /**
   * Find evidence by ID including soft-deleted.
   * Use for audit purposes only.
   * 
   * @param id - Evidence ID
   * @returns Evidence row or null
   */
  static async findByIdIncludeDeleted(id: string): Promise<EvidenceRow | null> {
    const row = evidenceStore.get(id);
    return row ? { ...row } : null;
  }

  /**
   * Find all evidence linked to a product.
   * 
   * @param productId - Product ID
   * @returns Array of evidence rows
   */
  static async findByProductId(productId: string): Promise<EvidenceRow[]> {
    const links = productEvidenceStore.filter(link => link.product_id === productId);
    const results: EvidenceRow[] = [];
    
    for (const link of links) {
      const row = await this.findById(link.evidence_id);
      if (row) {
        results.push(row);
      }
    }
    
    return results;
  }

  /**
   * Find evidence expiring within specified days.
   * 
   * @param withinDays - Days until expiry
   * @returns Array of evidence rows expiring soon
   */
  static async findExpiringSoon(withinDays: number): Promise<EvidenceRow[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + withinDays);
    
    const results: EvidenceRow[] = [];
    
    for (const row of evidenceStore.values()) {
      if (
        row.deleted_at === null &&
        row.expires_at !== null &&
        row.expires_at <= threshold &&
        row.expires_at > new Date()
      ) {
        results.push({ ...row });
      }
    }
    
    return results;
  }

  /**
   * Find all expired evidence.
   * 
   * @returns Array of expired evidence rows
   */
  static async findExpired(): Promise<EvidenceRow[]> {
    const now = new Date();
    const results: EvidenceRow[] = [];
    
    for (const row of evidenceStore.values()) {
      if (
        row.deleted_at === null &&
        row.expires_at !== null &&
        row.expires_at <= now
      ) {
        results.push({ ...row });
      }
    }
    
    return results;
  }

  /**
   * Find evidence by hash.
   * Useful for detecting duplicate uploads.
   * 
   * @param hash - SHA-256 hash
   * @returns Evidence row or null
   */
  static async findByHash(hash: string): Promise<EvidenceRow | null> {
    for (const row of evidenceStore.values()) {
      if (row.sha256_hash === hash && row.deleted_at === null) {
        return { ...row };
      }
    }
    return null;
  }

  /**
   * Soft delete evidence.
   * Evidence is never hard deleted for legal defensibility.
   * 
   * @param id - Evidence ID
   * @param reason - Reason for deletion (required for audit)
   */
  static async softDelete(id: string, reason: string): Promise<void> {
    const row = evidenceStore.get(id);
    
    if (!row) {
      throw new Error(`Evidence not found: ${id}`);
    }
    
    if (row.deleted_at !== null) {
      throw new Error(`Evidence already deleted: ${id}`);
    }
    
    row.deleted_at = new Date();
    row.deletion_reason = reason;
    
    evidenceStore.set(id, row);
  }

  /**
   * Link evidence to a product.
   * 
   * @param params - Link parameters
   */
  static async linkToProduct(params: {
    evidenceId: string;
    productId: string;
    componentId?: string;
    addedBy?: string;
    notes?: string;
  }): Promise<void> {
    // Check for existing link
    const existing = productEvidenceStore.find(
      link => 
        link.product_id === params.productId && 
        link.evidence_id === params.evidenceId
    );
    
    if (existing) {
      throw new Error(`Evidence ${params.evidenceId} already linked to product ${params.productId}`);
    }
    
    productEvidenceStore.push({
      product_id: params.productId,
      evidence_id: params.evidenceId,
      component_id: params.componentId ?? null,
      added_at: new Date(),
      added_by: params.addedBy ?? null,
      notes: params.notes ?? null,
    });
  }

  /**
   * Unlink evidence from a product.
   * 
   * @param evidenceId - Evidence ID
   * @param productId - Product ID
   */
  static async unlinkFromProduct(evidenceId: string, productId: string): Promise<void> {
    const index = productEvidenceStore.findIndex(
      link => 
        link.product_id === productId && 
        link.evidence_id === evidenceId
    );
    
    if (index === -1) {
      throw new Error(`Evidence ${evidenceId} not linked to product ${productId}`);
    }
    
    productEvidenceStore.splice(index, 1);
  }

  /**
   * Get product-evidence link details.
   * 
   * @param evidenceId - Evidence ID
   * @param productId - Product ID
   * @returns Link details or null
   */
  static async getProductLink(
    evidenceId: string, 
    productId: string
  ): Promise<ProductEvidenceRow | null> {
    const link = productEvidenceStore.find(
      l => l.product_id === productId && l.evidence_id === evidenceId
    );
    return link ? { ...link } : null;
  }

  /**
   * Get all links for an evidence object.
   * 
   * @param evidenceId - Evidence ID
   * @returns Array of product links
   */
  static async getLinksForEvidence(evidenceId: string): Promise<ProductEvidenceRow[]> {
    return productEvidenceStore
      .filter(link => link.evidence_id === evidenceId)
      .map(link => ({ ...link }));
  }

  /**
   * Count total evidence by type.
   * 
   * @returns Record of type to count
   */
  static async countByType(): Promise<Record<EvidenceType, number>> {
    const counts: Record<string, number> = {
      lab_report: 0,
      brand_statement: 0,
      policy_document: 0,
      screenshot: 0,
      correspondence: 0,
    };
    
    for (const row of evidenceStore.values()) {
      if (row.deleted_at === null) {
        counts[row.type]++;
      }
    }
    
    return counts as Record<EvidenceType, number>;
  }

  /**
   * List all evidence with pagination.
   * 
   * @param params - Pagination parameters
   * @returns Paginated evidence list
   */
  static async list(params: {
    limit?: number;
    offset?: number;
    type?: EvidenceType;
    source?: EvidenceSource;
    includeExpired?: boolean;
  }): Promise<{ data: EvidenceRow[]; total: number }> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const now = new Date();
    
    let results: EvidenceRow[] = [];
    
    for (const row of evidenceStore.values()) {
      if (row.deleted_at !== null) continue;
      if (params.type && row.type !== params.type) continue;
      if (params.source && row.source !== params.source) continue;
      if (!params.includeExpired && row.expires_at && row.expires_at <= now) continue;
      
      results.push({ ...row });
    }
    
    // Sort by received_at descending
    results.sort((a, b) => b.received_at.getTime() - a.received_at.getTime());
    
    const total = results.length;
    results = results.slice(offset, offset + limit);
    
    return { data: results, total };
  }
}
