/**
 * Admin evidence routes for PFAS-Free Kitchen Platform API
 * Endpoint: POST /api/v1/admin/evidence/upload
 */

import { Router } from 'express';
import { EvidenceService } from '../../services/evidence.service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { adminRateLimit } from '../../middleware/rateLimit.js';
import { evidenceUploadSchema } from '../../utils/validation.js';
import { ValidationError } from '../../errors/AppError.js';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/admin/evidence/upload
 * Upload new evidence artifact
 * 
 * Note: This is a stub - actual file upload handling would use multer
 * or similar middleware in production
 */
router.post(
  '/evidence/upload',
  adminRateLimit,
  requireRole('super_admin', 'reviewer', 'editor'),
  asyncHandler(async (req, res) => {
    // STUB: In production, use multer for multipart/form-data
    // For now, expect JSON with base64 encoded file
    const { file, ...rest } = req.body;
    
    if (!file) {
      throw new ValidationError('File is required', 'file');
    }

    const data = evidenceUploadSchema.parse(rest);
    const uploadedBy = req.user!.id;

    // Convert base64 to buffer (stub)
    const fileBuffer = Buffer.from(file, 'base64');
    const mimeType = req.headers['content-type'] || 'application/pdf';
    const filename = req.headers['x-filename'] as string || 'upload.pdf';

    // STUB: Implement in w4-evidence-service
    const result = await EvidenceService.upload({
      file: fileBuffer,
      filename,
      mimeType,
      type: data.type,
      productId: data.product_id,
      source: data.source,
      metadata: data.metadata,
      uploadedBy,
    });

    res.status(201).json(result);
  })
);

export default router;
