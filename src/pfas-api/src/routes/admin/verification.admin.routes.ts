/**
 * Admin verification routes for PFAS-Free Kitchen Platform API
 * Endpoint: POST /api/v1/admin/verification/decide
 */

import { Router } from 'express';
import { VerificationService } from '../../services/verification.service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { adminRateLimit } from '../../middleware/rateLimit.js';
import { verificationDecisionSchema } from '../../utils/validation.js';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/admin/verification/decide
 * Submit verification decision
 */
router.post(
  '/verification/decide',
  adminRateLimit,
  requireRole('super_admin', 'reviewer'),
  asyncHandler(async (req, res) => {
    const data = verificationDecisionSchema.parse(req.body);
    const reviewerId = req.user!.id;

    // STUB: Implement in w5-verification-service
    const result = await VerificationService.decide(
      {
        productId: data.product_id,
        tier: data.tier as 0 | 1 | 2 | 3 | 4,
        claimType: data.claim_type as 'A' | 'B' | 'C' | undefined,
        scopeText: data.scope_text,
        scopeComponentIds: data.scope_component_ids,
        confidenceScore: data.confidence_score,
        rationale: data.rationale,
        evidenceIds: data.evidence_ids,
        unknowns: data.unknowns,
      },
      reviewerId
    );

    res.status(201).json(result);
  })
);

export default router;
