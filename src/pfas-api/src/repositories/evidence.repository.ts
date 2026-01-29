/**
 * Evidence repository for PFAS-Free Kitchen Platform API
 * STUB: Implement database queries in production
 */

import type { EvidenceObjectRow, ProductEvidenceRow } from '../types/database.types.js';
import type { EvidenceType, EvidenceSource } from '../types/domain.types.js';
import { NotImplementedError } from '../errors/AppError.js';

export interface CreateEvidenceInput {
  type: EvidenceType;
  source: EvidenceSource;
  storageUri: string;
  sha256Hash: string;
  fileSizeBytes: number;
  mimeType: string;
  originalFilename?: string;
  expiresAt?: Date;
  metadata: Record<string, unknown>;
}

export interface EvidenceWithProduct extends EvidenceObjectRow {
  productIds: string[];
  componentIds: string[];
}

export class EvidenceRepository {
  /**
   * Find evidence by ID
   * TODO: Implement in w4-evidence-service
   */
  static async findById(evidenceId: string): Promise<EvidenceObjectRow | null> {
    throw new NotImplementedError('EvidenceRepository.findById');
  }

  /**
   * Find evidence for product
   * TODO: Implement in w4-evidence-service
   */
  static async findByProductId(productId: string): Promise<EvidenceWithProduct[]> {
    throw new NotImplementedError('EvidenceRepository.findByProductId');
  }

  /**
   * Find evidence by hash (for deduplication)
   * TODO: Implement in w4-evidence-service
   */
  static async findByHash(sha256Hash: string): Promise<EvidenceObjectRow | null> {
    throw new NotImplementedError('EvidenceRepository.findByHash');
  }

  /**
   * Create evidence record
   * TODO: Implement in w4-evidence-service
   */
  static async create(input: CreateEvidenceInput): Promise<EvidenceObjectRow> {
    throw new NotImplementedError('EvidenceRepository.create');
  }

  /**
   * Link evidence to product
   * TODO: Implement in w4-evidence-service
   */
  static async linkToProduct(
    evidenceId: string,
    productId: string,
    componentId?: string,
    addedBy?: string
  ): Promise<ProductEvidenceRow> {
    throw new NotImplementedError('EvidenceRepository.linkToProduct');
  }

  /**
   * Find expiring evidence
   * TODO: Implement in w4-evidence-service
   */
  static async findExpiring(beforeDate: Date): Promise<EvidenceObjectRow[]> {
    throw new NotImplementedError('EvidenceRepository.findExpiring');
  }

  /**
   * Soft delete evidence
   * TODO: Implement in w4-evidence-service
   */
  static async softDelete(evidenceId: string, reason: string): Promise<EvidenceObjectRow> {
    throw new NotImplementedError('EvidenceRepository.softDelete');
  }
}
