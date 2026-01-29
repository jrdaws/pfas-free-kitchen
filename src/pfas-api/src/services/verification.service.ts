/**
 * Verification service for PFAS-Free Kitchen Platform API
 * STUB: Implement business logic in production
 */

import type {
  VerificationResponse,
  VerificationDecisionRequest,
  VerificationDecisionResponse,
} from '../types/api.types.js';
import { NotImplementedError } from '../errors/AppError.js';

export class VerificationService {
  /**
   * Get verification details for a product
   * TODO: Implement in w5-verification-service
   */
  static async getVerification(productId: string): Promise<VerificationResponse> {
    throw new NotImplementedError('VerificationService.getVerification');
  }

  /**
   * Submit verification decision (admin only)
   * TODO: Implement in w5-verification-service
   */
  static async decide(
    request: VerificationDecisionRequest,
    reviewerId: string
  ): Promise<VerificationDecisionResponse> {
    throw new NotImplementedError('VerificationService.decide');
  }

  /**
   * Validate tier requirements
   * TODO: Implement in w5-verification-service
   */
  static async validateTierRequirements(
    productId: string,
    proposedTier: number,
    evidenceIds: string[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    throw new NotImplementedError('VerificationService.validateTierRequirements');
  }

  /**
   * Calculate confidence score
   * TODO: Implement in w5-verification-service
   */
  static async calculateConfidence(
    productId: string,
    tier: number,
    evidenceIds: string[]
  ): Promise<number> {
    throw new NotImplementedError('VerificationService.calculateConfidence');
  }
}
