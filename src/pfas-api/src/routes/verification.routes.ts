/**
 * Verification routes for PFAS-Free Kitchen Platform API
 * Endpoint: /api/v1/products/:product_id/verification
 */

import { Router } from 'express';
import { VerificationService } from '../services/verification.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicRateLimit } from '../middleware/rateLimit.js';
import { productIdSchema } from '../utils/validation.js';

const router = Router();

/**
 * GET /api/v1/products/:product_id/verification
 * Get verification details for a product
 */
router.get(
  '/products/:product_id/verification',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const { product_id } = productIdSchema.parse(req.params);

    // STUB: Implement in w5-verification-service
    const result = await VerificationService.getVerification(product_id);

    res.json(result);
  })
);

export default router;
