/**
 * Admin audit log routes for PFAS-Free Kitchen Platform API
 * Endpoint: GET /api/v1/admin/audit-log
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { adminRateLimit } from '../../middleware/rateLimit.js';
import { auditLogSchema } from '../../utils/validation.js';
import { NotImplementedError } from '../../errors/AppError.js';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/admin/audit-log
 * Get audit log entries
 */
router.get(
  '/audit-log',
  adminRateLimit,
  requireRole('super_admin', 'reviewer'),
  asyncHandler(async (req, _res) => {
    const _params = auditLogSchema.parse(req.query);

    // STUB: Implement in w6-audit-service
    // TODO: Implement AuditService.getLog
    throw new NotImplementedError('AuditService.getLog');
  })
);

export default router;
