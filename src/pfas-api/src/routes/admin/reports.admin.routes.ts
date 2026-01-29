/**
 * Admin reports routes for PFAS-Free Kitchen Platform API
 * Endpoints: GET /api/v1/admin/reports, PATCH /api/v1/admin/reports/:report_id
 */

import { Router } from 'express';
import { ReportsService } from '../../services/reports.service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { adminRateLimit } from '../../middleware/rateLimit.js';
import { adminReportsSchema, updateReportSchema, reportIdSchema } from '../../utils/validation.js';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/admin/reports
 * List reports for review
 */
router.get(
  '/reports',
  adminRateLimit,
  requireRole('super_admin', 'reviewer', 'editor', 'viewer'),
  asyncHandler(async (req, res) => {
    const params = adminReportsSchema.parse(req.query);

    // STUB: Implement in w6-reports-service
    const result = await ReportsService.listReports({
      status: params.status,
      priority: params.priority,
      page: params.page,
      limit: params.limit,
    });

    res.json(result);
  })
);

/**
 * PATCH /api/v1/admin/reports/:report_id
 * Update report status/priority
 */
router.patch(
  '/reports/:report_id',
  adminRateLimit,
  requireRole('super_admin', 'reviewer', 'editor'),
  asyncHandler(async (req, res) => {
    const { report_id } = reportIdSchema.parse(req.params);
    const updates = updateReportSchema.parse(req.body);
    const actorId = req.user!.id;

    // STUB: Implement in w6-reports-service
    const result = await ReportsService.updateReport(report_id, updates, actorId);

    res.json(result);
  })
);

export default router;
