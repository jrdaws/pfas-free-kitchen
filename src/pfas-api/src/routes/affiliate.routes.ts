/**
 * Affiliate routes for PFAS-Free Kitchen Platform API
 * Endpoints: /api/v1/products/:product_id/affiliate-links, /api/v1/affiliate-clicks
 */

import { Router } from 'express';
import { AffiliateService } from '../services/affiliate.service.js';
import { ClickTrackingService } from '../services/click-tracking.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicRateLimit, clickRateLimit } from '../middleware/rateLimit.js';
import { productIdSchema, affiliateClickSchema } from '../utils/validation.js';
import { hashUserAgent } from '../utils/hash.js';
import { logger } from '../config/logger.js';

const router = Router();

/**
 * GET /api/v1/products/:product_id/affiliate-links
 * Get affiliate links for a product
 * 
 * Response includes:
 * - Array of retailer links with affiliate URLs
 * - FTC disclosure text for grid/list views
 * - Each link has its own disclosure text
 */
router.get(
  '/products/:product_id/affiliate-links',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const { product_id } = productIdSchema.parse(req.params);

    const result = await AffiliateService.getLinks(product_id);

    // Log link generation (for audit, not clicks)
    logger.info({
      event: 'affiliate_links_generated',
      productId: product_id,
      linkCount: result.data.links.length,
      requestId: req.id,
    }, 'Affiliate links generated');

    res.json(result);
  })
);

/**
 * POST /api/v1/affiliate-clicks
 * Track affiliate link click
 * 
 * Request body:
 * - product_id: string (required)
 * - retailer_id: string (required)
 * - session_id: string (optional, for dedup)
 * - referrer_page: string (optional, for analytics)
 * - user_agent_hash: string (optional, client-side hash)
 * 
 * Features:
 * - Bot detection (high velocity, known bots)
 * - Duplicate filtering (same session/product/retailer within 5 min)
 * - No PII stored (user agent hashed, no IP logged)
 */
router.post(
  '/affiliate-clicks',
  clickRateLimit,
  asyncHandler(async (req, res) => {
    const data = affiliateClickSchema.parse(req.body);

    // Hash user agent server-side if not provided by client
    // This allows bot detection without storing raw user agent
    let userAgentHash = data.user_agent_hash;
    const rawUserAgent = req.headers['user-agent'];
    
    if (!userAgentHash && rawUserAgent) {
      userAgentHash = hashUserAgent(rawUserAgent);
      
      // Also check for bots using raw UA before hashing
      const botCheck = await ClickTrackingService.detectBotFromUserAgent(rawUserAgent, data.session_id);
      if (botCheck.isBot) {
        logger.info({
          event: 'bot_click_blocked',
          reason: botCheck.reason,
          productId: data.product_id,
          retailerId: data.retailer_id,
        }, 'Bot click detected from user agent');
        
        return res.status(201).json({
          data: {
            clickId: '',
            tracked: false,
          },
        });
      }
    }

    const result = await ClickTrackingService.trackClick({
      productId: data.product_id,
      retailerId: data.retailer_id,
      sessionId: data.session_id,
      referrerPage: data.referrer_page,
      userAgentHash,
    });

    res.status(201).json({ data: result });
  })
);

/**
 * GET /api/v1/admin/affiliate-analytics
 * Get click analytics (admin only)
 * 
 * Query params:
 * - start_date: ISO date string
 * - end_date: ISO date string
 * - group_by: 'day' | 'retailer' | 'product' | 'category'
 */
router.get(
  '/admin/affiliate-analytics',
  asyncHandler(async (req, res) => {
    // TODO: Add admin auth middleware
    const { start_date, end_date, group_by = 'day' } = req.query;

    const startDate = start_date 
      ? new Date(start_date as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    
    const endDate = end_date 
      ? new Date(end_date as string) 
      : new Date();

    const analytics = await ClickTrackingService.getAnalytics({
      dateRange: { start: startDate, end: endDate },
      groupBy: (group_by as 'day' | 'retailer' | 'product' | 'category'),
      excludeBots: true,
    });

    res.json({ data: analytics });
  })
);

export default router;
