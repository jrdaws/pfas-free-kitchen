/**
 * Reports routes for PFAS-Free Kitchen Platform API
 * Endpoint: POST /api/v1/reports
 */

import { Router } from 'express';
import { ReportsService } from '../services/reports.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { reportRateLimit } from '../middleware/rateLimit.js';
import { reportSchema } from '../utils/validation.js';
import { hashUserAgent, hashIp } from '../utils/hash.js';

const router = Router();

/**
 * POST /api/v1/reports
 * Submit product issue report
 */
router.post(
  '/reports',
  reportRateLimit,
  asyncHandler(async (req, res) => {
    const data = reportSchema.parse(req.body);

    // Hash user agent and IP for privacy-preserving abuse detection
    const userAgentHash = req.headers['user-agent']
      ? hashUserAgent(req.headers['user-agent'])
      : undefined;
    const ipHash = req.ip ? hashIp(req.ip) : undefined;

    // Get session ID from header or body
    const sessionId = req.headers['x-session-id'] as string || undefined;

    // STUB: Implement in w6-reports-service
    const result = await ReportsService.submit(
      {
        productId: data.product_id,
        issueType: data.issue_type,
        description: data.description,
        evidenceUrls: data.evidence_urls,
        contactEmail: data.contact_email,
      },
      sessionId,
      ipHash,
      userAgentHash
    );

    res.status(201).json(result);
  })
);

export default router;
