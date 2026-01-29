/**
 * PFAS-Free Kitchen Platform - Evidence Service
 * 
 * Manages evidence artifacts with immutable storage and hash verification.
 * @see docs/pfas-platform/02-TECHNICAL-DESIGN.md "2.3 Evidence Service"
 */

import type { Readable } from 'stream';
import { StorageAdapter } from '../adapters/storage.adapter';
import { EvidenceRepository, type EvidenceRow } from '../repositories/evidence.repository';
import { sha256, streamToBuffer, verifyHash } from '../utils/hash';
import { logAdminAction } from '../utils/audit';
import {
  type EvidenceType,
  type EvidenceSource,
  type EvidenceMetadata,
  validateMetadata,
  validateFileConstraints,
  calculateExpiryDate,
  MAX_FILE_SIZE_BYTES,
} from '../schemas/evidence-metadata.schema';

/**
 * Evidence upload response.
 */
export interface EvidenceUploadResponse {
  evidenceId: string;
  artifactUrl: string;
  sha256Hash: string;
  status: 'pending_review';
  createdAt: Date;
}

/**
 * Evidence response with full metadata.
 */
export interface EvidenceResponse {
  id: string;
  type: EvidenceType;
  typeLabel: string;
  source: EvidenceSource;
  metadata: EvidenceMetadata;
  artifactUrl: string;
  sha256Hash: string;
  fileSizeBytes: number;
  mimeType: string;
  originalFilename: string | null;
  receivedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Expiry status for evidence.
 */
export interface ExpiryStatus {
  evidenceId: string;
  status: 'active' | 'expiring_soon' | 'expired';
  expiresAt: Date | null;
  daysUntilExpiry: number | null;
}

/**
 * Integrity check result.
 */
export interface IntegrityCheckResult {
  evidenceId: string;
  valid: boolean;
  storedHash: string;
  computedHash: string;
  checkedAt: Date;
  error?: string;
}

/**
 * Custom error for integrity failures.
 */
export class IntegrityError extends Error {
  constructor(
    message: string,
    public readonly evidenceId: string,
    public readonly storedHash: string,
    public readonly computedHash: string
  ) {
    super(message);
    this.name = 'IntegrityError';
  }
}

/**
 * Map evidence type to human-readable label.
 */
const TYPE_LABELS: Record<EvidenceType, string> = {
  lab_report: 'Lab Report',
  brand_statement: 'Brand Statement',
  policy_document: 'Policy Document',
  screenshot: 'Screenshot',
  correspondence: 'Correspondence',
};

/**
 * Evidence Service - Manages evidence artifacts with integrity guarantees.
 * 
 * Critical requirements:
 * - SHA-256 hash calculated BEFORE upload, stored in DB
 * - Hash verified on EVERY download
 * - S3 Object Lock enabled (WORM)
 * - Soft delete only
 * - All uploads logged to audit
 */
export class EvidenceService {
  /**
   * Upload new evidence artifact.
   * 
   * Flow:
   * 1. Validate file type and size
   * 2. Validate type-specific metadata
   * 3. Calculate SHA-256 hash
   * 4. Upload to S3 with WORM config
   * 5. Create database record
   * 6. Log to audit
   * 
   * @param params - Upload parameters
   * @returns Upload response with evidence ID and artifact URL
   */
  static async upload(params: {
    file: Buffer;
    filename: string;
    mimeType: string;
    type: EvidenceType;
    source: EvidenceSource;
    metadata: EvidenceMetadata;
    productId?: string;
    componentIds?: string[];
    uploadedBy: string;
  }): Promise<EvidenceUploadResponse> {
    // 1. Validate file constraints
    const fileValidation = validateFileConstraints(params.file.length, params.mimeType);
    if (!fileValidation.valid) {
      throw new Error(fileValidation.error);
    }

    // 2. Validate metadata for the evidence type
    const validatedMetadata = validateMetadata(params.type, params.metadata);

    // 3. Calculate SHA-256 hash BEFORE upload
    const hash = sha256(params.file);

    // Check for duplicate
    const existing = await EvidenceRepository.findByHash(hash);
    if (existing) {
      throw new Error(`Duplicate evidence detected. Existing ID: ${existing.id}`);
    }

    // Generate evidence ID early for storage key
    const evidenceId = `ev_${Date.now()}_${hash.slice(0, 8)}`;

    // 4. Upload to S3 with WORM configuration
    const storageKey = StorageAdapter.generateKey(evidenceId, params.filename);
    const uploadResult = await StorageAdapter.upload({
      key: storageKey,
      body: params.file,
      contentType: params.mimeType,
      metadata: {
        'x-evidence-id': evidenceId,
        'x-evidence-type': params.type,
        'x-sha256-hash': hash,
      },
    });

    // 5. Calculate expiry date
    const expiresAt = calculateExpiryDate(params.type);

    // 6. Create database record
    await EvidenceRepository.create({
      type: params.type,
      source: params.source,
      storage_uri: uploadResult.uri,
      sha256_hash: hash,
      file_size_bytes: params.file.length,
      mime_type: params.mimeType,
      original_filename: params.filename,
      expires_at: expiresAt,
      metadata: validatedMetadata,
    });

    // 7. Link to product if provided
    if (params.productId) {
      await EvidenceRepository.linkToProduct({
        evidenceId,
        productId: params.productId,
        addedBy: params.uploadedBy,
      });
    }

    // 8. Log to audit
    await logAdminAction(
      { id: params.uploadedBy, email: '', name: '', role: 'editor' },
      'evidence.uploaded',
      'evidence',
      evidenceId,
      null,
      {
        type: params.type,
        source: params.source,
        sha256_hash: hash,
        file_size_bytes: params.file.length,
        mime_type: params.mimeType,
        expires_at: expiresAt.toISOString(),
      }
    );

    return {
      evidenceId,
      artifactUrl: `/api/v1/evidence/${evidenceId}/artifact`,
      sha256Hash: hash,
      status: 'pending_review',
      createdAt: new Date(),
    };
  }

  /**
   * Get evidence metadata.
   * 
   * @param id - Evidence ID
   * @returns Evidence response
   */
  static async getEvidence(id: string): Promise<EvidenceResponse> {
    const row = await EvidenceRepository.findById(id);
    
    if (!row) {
      throw new Error(`Evidence not found: ${id}`);
    }

    return this.rowToResponse(row);
  }

  /**
   * Stream evidence artifact.
   * 
   * CRITICAL: Verifies hash on every download.
   * 
   * Flow:
   * 1. Fetch from S3
   * 2. Verify hash matches stored hash
   * 3. Return stream if valid
   * 4. Throw IntegrityError if hash mismatch
   * 
   * @param id - Evidence ID
   * @returns Artifact stream with metadata
   */
  static async getArtifact(id: string): Promise<{
    stream: Readable;
    buffer: Buffer;
    mimeType: string;
    filename: string;
    hash: string;
  }> {
    const evidence = await EvidenceRepository.findById(id);
    
    if (!evidence) {
      throw new Error(`Evidence not found: ${id}`);
    }

    // Fetch from storage
    const stream = await StorageAdapter.getStream(evidence.storage_uri);
    
    // Convert to buffer for hash verification
    const downloadedBuffer = await streamToBuffer(stream, MAX_FILE_SIZE_BYTES);
    
    // CRITICAL: Verify hash integrity
    const isValid = verifyHash(downloadedBuffer, evidence.sha256_hash);
    
    if (!isValid) {
      const computedHash = sha256(downloadedBuffer);
      
      // Log integrity failure
      await logAdminAction(
        null,
        'evidence.uploaded', // Using closest action type
        'evidence',
        id,
        { expected_hash: evidence.sha256_hash },
        { computed_hash: computedHash, integrity_failure: true }
      );
      
      throw new IntegrityError(
        'Evidence artifact integrity check failed',
        id,
        evidence.sha256_hash,
        computedHash
      );
    }

    // Create a new readable stream from buffer for response
    const { Readable } = await import('stream');
    const responseStream = Readable.from(downloadedBuffer);

    return {
      stream: responseStream,
      buffer: downloadedBuffer,
      mimeType: evidence.mime_type,
      filename: evidence.original_filename || `evidence_${id}`,
      hash: evidence.sha256_hash,
    };
  }

  /**
   * Link evidence to product/components.
   * 
   * @param params - Link parameters
   */
  static async linkToProduct(params: {
    evidenceId: string;
    productId: string;
    componentIds?: string[];
    linkedBy: string;
    notes?: string;
  }): Promise<void> {
    // Verify evidence exists
    const evidence = await EvidenceRepository.findById(params.evidenceId);
    if (!evidence) {
      throw new Error(`Evidence not found: ${params.evidenceId}`);
    }

    // Create link
    await EvidenceRepository.linkToProduct({
      evidenceId: params.evidenceId,
      productId: params.productId,
      addedBy: params.linkedBy,
      notes: params.notes,
    });

    // Log to audit
    await logAdminAction(
      { id: params.linkedBy, email: '', name: '', role: 'editor' },
      'evidence.linked',
      'evidence',
      params.evidenceId,
      null,
      {
        product_id: params.productId,
        component_ids: params.componentIds,
        notes: params.notes,
      }
    );
  }

  /**
   * Get all evidence for a product.
   * 
   * @param productId - Product ID
   * @returns Array of evidence responses
   */
  static async getByProductId(productId: string): Promise<EvidenceResponse[]> {
    const rows = await EvidenceRepository.findByProductId(productId);
    return rows.map(row => this.rowToResponse(row));
  }

  /**
   * Check evidence expiry status.
   * 
   * @param evidenceId - Evidence ID
   * @returns Expiry status
   */
  static async checkExpiry(evidenceId: string): Promise<ExpiryStatus> {
    const evidence = await EvidenceRepository.findById(evidenceId);
    
    if (!evidence) {
      throw new Error(`Evidence not found: ${evidenceId}`);
    }

    const now = new Date();
    let status: ExpiryStatus['status'] = 'active';
    let daysUntilExpiry: number | null = null;

    if (evidence.expires_at) {
      const msUntilExpiry = evidence.expires_at.getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= 30) {
        status = 'expiring_soon';
      }
    }

    return {
      evidenceId,
      status,
      expiresAt: evidence.expires_at,
      daysUntilExpiry,
    };
  }

  /**
   * Verify hash integrity without returning artifact.
   * 
   * @param evidenceId - Evidence ID
   * @returns Integrity check result
   */
  static async verifyIntegrity(evidenceId: string): Promise<IntegrityCheckResult> {
    const evidence = await EvidenceRepository.findById(evidenceId);
    
    if (!evidence) {
      throw new Error(`Evidence not found: ${evidenceId}`);
    }

    try {
      const stream = await StorageAdapter.getStream(evidence.storage_uri);
      const downloadedBuffer = await streamToBuffer(stream, MAX_FILE_SIZE_BYTES);
      const computedHash = sha256(downloadedBuffer);
      const valid = computedHash === evidence.sha256_hash;

      return {
        evidenceId,
        valid,
        storedHash: evidence.sha256_hash,
        computedHash,
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        evidenceId,
        valid: false,
        storedHash: evidence.sha256_hash,
        computedHash: '',
        checkedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get evidence expiring soon.
   * 
   * @param withinDays - Days threshold (default: 30)
   * @returns Array of expiring evidence
   */
  static async getExpiringSoon(withinDays: number = 30): Promise<EvidenceResponse[]> {
    const rows = await EvidenceRepository.findExpiringSoon(withinDays);
    return rows.map(row => this.rowToResponse(row));
  }

  /**
   * Get all expired evidence.
   * 
   * @returns Array of expired evidence
   */
  static async getExpired(): Promise<EvidenceResponse[]> {
    const rows = await EvidenceRepository.findExpired();
    return rows.map(row => this.rowToResponse(row));
  }

  /**
   * Soft delete evidence (for super_admin only).
   * 
   * @param evidenceId - Evidence ID
   * @param reason - Deletion reason (required)
   * @param deletedBy - Admin user ID
   */
  static async softDelete(
    evidenceId: string,
    reason: string,
    deletedBy: string
  ): Promise<void> {
    const evidence = await EvidenceRepository.findById(evidenceId);
    
    if (!evidence) {
      throw new Error(`Evidence not found: ${evidenceId}`);
    }

    await EvidenceRepository.softDelete(evidenceId, reason);

    await logAdminAction(
      { id: deletedBy, email: '', name: '', role: 'super_admin' },
      'evidence.archived',
      'evidence',
      evidenceId,
      { status: 'active' },
      { status: 'archived', reason }
    );
  }

  /**
   * Convert database row to API response.
   */
  private static rowToResponse(row: EvidenceRow): EvidenceResponse {
    return {
      id: row.id,
      type: row.type,
      typeLabel: TYPE_LABELS[row.type],
      source: row.source,
      metadata: row.metadata,
      artifactUrl: `/api/v1/evidence/${row.id}/artifact`,
      sha256Hash: row.sha256_hash,
      fileSizeBytes: row.file_size_bytes,
      mimeType: row.mime_type,
      originalFilename: row.original_filename,
      receivedAt: row.received_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    };
  }
}
