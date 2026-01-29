/**
 * Admin queue routes for PFAS-Free Kitchen Platform API
 * Endpoints: GET /api/v1/admin/queue, POST /api/v1/admin/queue/:queue_id/assign
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { adminRateLimit } from '../../middleware/rateLimit.js';
import { queueSchema, queueIdSchema, assignQueueSchema } from '../../utils/validation.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import type { QueueResponse, AssignQueueResponse, VerificationTier } from '../../types/api.types.js';
import { NotFoundError } from '../../errors/AppError.js';
import { db } from '../../config/database.js';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/admin/queue
 * Get review queue
 */
router.get(
  '/queue',
  adminRateLimit,
  requireRole('super_admin', 'reviewer', 'editor', 'viewer'),
  asyncHandler(async (req, res) => {
    const params = queueSchema.parse(req.query);

    const { products, total } = await ProductRepository.findReviewQueue({
      status: params.status as string | undefined,
      reviewLane: params.review_lane as string | undefined,
      page: params.page || 1,
      limit: params.limit || 24,
    });

    const totalPages = Math.ceil(total / (params.limit || 24));

    const response: QueueResponse = {
      data: {
        items: products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          brandName: p.brand.name,
          categoryName: p.category.name,
          status: p.status,
          pfasRiskFlagged: p.pfas_risk_flagged,
          requiresElevatedReview: p.requires_elevated_review,
          tier: (p.verification?.tier ? parseInt(p.verification.tier, 10) : 0) as VerificationTier,
          reviewLane: p.verification?.review_lane || undefined,
          reviewStartedAt: p.verification?.review_started_at?.toISOString(),
          createdAt: p.created_at.toISOString(),
          updatedAt: p.updated_at.toISOString(),
        })),
        pagination: {
          page: params.page || 1,
          limit: params.limit || 24,
          totalCount: total,
          totalPages,
          hasNext: (params.page || 1) < totalPages,
          hasPrev: (params.page || 1) > 1,
        },
      },
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/admin/queue/:queue_id/assign
 * Assign product to reviewer
 */
router.post(
  '/queue/:queue_id/assign',
  adminRateLimit,
  requireRole('super_admin', 'reviewer'),
  asyncHandler(async (req, res) => {
    const { queue_id: productId } = queueIdSchema.parse(req.params);
    const { reviewerId } = assignQueueSchema.parse(req.body);

    // Verify product exists and is in review queue
    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    if (!['pending_review', 'under_review'].includes(product.status)) {
      throw new NotFoundError('Queue item', productId);
    }

    // Update product status and create/update verification_status
    await db.transaction(async (client) => {
      // Update product status
      await db.queryWithClient(client,
        `UPDATE products SET status = 'under_review' WHERE id = $1`,
        [productId]
      );

      // Upsert verification_status with reviewer assignment
      await db.queryWithClient(client, `
        INSERT INTO verification_status (product_id, reviewer_id, review_started_at, review_lane)
        VALUES ($1, $2, NOW(), 'standard')
        ON CONFLICT (product_id) 
        DO UPDATE SET reviewer_id = $2, review_started_at = NOW()
      `, [productId, reviewerId]);
    });

    const response: AssignQueueResponse = {
      data: {
        productId,
        assignedTo: reviewerId,
        status: 'under_review',
        reviewStartedAt: new Date().toISOString(),
      },
    };

    res.json(response);
  })
);

export default router;
