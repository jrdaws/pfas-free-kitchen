/**
 * Verification repository for PFAS-Free Kitchen Platform API
 * STUB: Implement database queries in production
 */

import type { VerificationStatusRow, VerificationHistoryRow } from '../types/database.types.js';
import type { VerificationTier, ClaimType } from '../types/domain.types.js';
import { NotImplementedError } from '../errors/AppError.js';

export interface CreateVerificationInput {
  productId: string;
  tier: VerificationTier;
  claimType?: ClaimType;
  scopeText?: string;
  scopeComponentIds?: string[];
  confidenceScore?: number;
  unknowns?: string[];
  rationale: string;
  evidenceIds?: string[];
  reviewerId?: string;
}

export class VerificationRepository {
  /**
   * Find verification status for product
   * TODO: Implement in w5-verification-service
   */
  static async findByProductId(productId: string): Promise<VerificationStatusRow | null> {
    throw new NotImplementedError('VerificationRepository.findByProductId');
  }

  /**
   * Find verification history for product
   * TODO: Implement in w5-verification-service
   */
  static async findHistory(productId: string): Promise<VerificationHistoryRow[]> {
    throw new NotImplementedError('VerificationRepository.findHistory');
  }

  /**
   * Create or update verification status
   * TODO: Implement in w5-verification-service
   */
  static async upsert(input: CreateVerificationInput): Promise<VerificationStatusRow> {
    throw new NotImplementedError('VerificationRepository.upsert');
  }

  /**
   * Add history entry
   * TODO: Implement in w5-verification-service
   */
  static async addHistory(
    productId: string,
    fromTier: VerificationTier | null,
    toTier: VerificationTier,
    reason: string,
    reviewerId?: string,
    evidenceIds?: string[]
  ): Promise<VerificationHistoryRow> {
    throw new NotImplementedError('VerificationRepository.addHistory');
  }

  /**
   * Find products due for review
   * TODO: Implement in w5-verification-service
   */
  static async findDueForReview(beforeDate: Date): Promise<VerificationStatusRow[]> {
    throw new NotImplementedError('VerificationRepository.findDueForReview');
  }

  /**
   * Update next review date
   * TODO: Implement in w5-verification-service
   */
  static async setNextReview(productId: string, nextReviewDue: Date): Promise<VerificationStatusRow> {
    throw new NotImplementedError('VerificationRepository.setNextReview');
  }
}
