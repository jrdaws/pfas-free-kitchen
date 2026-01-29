/**
 * Evidence service for PFAS-Free Kitchen Platform API
 * STUB: Implement business logic in production
 */

import type { Readable } from 'stream';
import type {
  EvidenceResponse,
  EvidenceUploadResponse,
  EvidenceUploadMetadata,
} from '../types/api.types.js';
import type { EvidenceType, EvidenceSource } from '../types/domain.types.js';
import { NotImplementedError } from '../errors/AppError.js';

export interface UploadEvidenceInput {
  file: Buffer;
  filename: string;
  mimeType: string;
  type: EvidenceType;
  productId: string;
  source: EvidenceSource;
  metadata?: EvidenceUploadMetadata;
  uploadedBy: string;
}

export interface ArtifactStreamResult {
  stream: Readable;
  mimeType: string;
  filename: string;
  hash: string;
}

export class EvidenceService {
  /**
   * Get evidence metadata
   * TODO: Implement in w4-evidence-service
   */
  static async getEvidence(evidenceId: string): Promise<EvidenceResponse> {
    throw new NotImplementedError('EvidenceService.getEvidence');
  }

  /**
   * Stream evidence artifact (PDF/image)
   * TODO: Implement in w4-evidence-service
   */
  static async getArtifactStream(evidenceId: string): Promise<ArtifactStreamResult> {
    throw new NotImplementedError('EvidenceService.getArtifactStream');
  }

  /**
   * Upload new evidence artifact (admin only)
   * TODO: Implement in w4-evidence-service
   */
  static async upload(input: UploadEvidenceInput): Promise<EvidenceUploadResponse> {
    throw new NotImplementedError('EvidenceService.upload');
  }

  /**
   * Validate evidence file
   * TODO: Implement in w4-evidence-service
   */
  static async validateFile(
    file: Buffer,
    mimeType: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    throw new NotImplementedError('EvidenceService.validateFile');
  }

  /**
   * Get evidence for product
   * TODO: Implement in w4-evidence-service
   */
  static async getProductEvidence(productId: string): Promise<EvidenceResponse[]> {
    throw new NotImplementedError('EvidenceService.getProductEvidence');
  }
}
