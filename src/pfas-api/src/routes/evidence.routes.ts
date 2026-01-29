/**
 * Evidence routes for PFAS-Free Kitchen Platform API
 * Endpoints: /api/v1/evidence/:evidence_id, /api/v1/evidence/:evidence_id/artifact
 */

import { Router } from 'express';
import { EvidenceService } from '../services/evidence.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicRateLimit } from '../middleware/rateLimit.js';
import { evidenceIdSchema } from '../utils/validation.js';

const router = Router();

/**
 * GET /api/v1/evidence/:evidence_id
 * Get evidence object metadata
 */
router.get(
  '/evidence/:evidence_id',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const { evidence_id } = evidenceIdSchema.parse(req.params);

    // STUB: Implement in w4-evidence-service
    const result = await EvidenceService.getEvidence(evidence_id);

    res.json(result);
  })
);

/**
 * GET /api/v1/evidence/:evidence_id/artifact
 * Stream evidence artifact (PDF/image)
 */
router.get(
  '/evidence/:evidence_id/artifact',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const { evidence_id } = evidenceIdSchema.parse(req.params);

    // STUB: Implement in w4-evidence-service
    const { stream, mimeType, filename, hash } = await EvidenceService.getArtifactStream(evidence_id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Evidence-Hash', hash);

    stream.pipe(res);
  })
);

export default router;
