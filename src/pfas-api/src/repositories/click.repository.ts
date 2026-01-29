/**
 * Click Repository for PFAS-Free Kitchen Platform
 * Handles affiliate click tracking data
 */

import { logger } from '../config/logger.js';
import type {
  Click,
  CreateClickParams,
  ClickParams,
  AggregateParams,
  ClickAnalytics,
} from '../types/affiliate.types.js';

// In-memory store for development (replace with PostgreSQL in production)
const clickStore: Click[] = [];
let clickIdCounter = 1;

export class ClickRepository {
  /**
   * Create a new click record
   */
  static async create(params: CreateClickParams): Promise<string> {
    const id = `click_${clickIdCounter++}`;
    
    const click: Click = {
      id,
      productId: params.productId,
      variantId: params.variantId,
      retailerId: params.retailerId,
      sessionId: params.sessionId,
      referrerPage: params.referrerPage,
      userAgentHash: params.userAgentHash,
      isBot: params.isBot,
      botDetectionReason: params.botDetectionReason,
      createdAt: new Date(),
    };

    clickStore.push(click);
    
    logger.debug({ clickId: id, isBot: params.isBot }, 'Click recorded');
    
    return id;

    /* PostgreSQL implementation:
    const result = await db.query(`
      INSERT INTO affiliate_clicks (
        product_id, variant_id, retailer_id, session_id,
        referrer_page, user_agent_hash, is_bot, bot_detection_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      params.productId,
      params.variantId,
      params.retailerId,
      params.sessionId,
      params.referrerPage,
      params.userAgentHash,
      params.isBot,
      params.botDetectionReason,
    ]);
    return result.rows[0].id;
    */
  }

  /**
   * Count recent clicks by session
   */
  static async countRecentBySession(
    sessionId: string | undefined,
    { withinMinutes }: { withinMinutes: number }
  ): Promise<number> {
    if (!sessionId) return 0;

    const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);
    
    const count = clickStore.filter(
      (c) =>
        c.sessionId === sessionId &&
        c.createdAt > cutoff &&
        !c.isBot
    ).length;

    return count;

    /* PostgreSQL implementation:
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM affiliate_clicks
      WHERE session_id = $1
        AND created_at > NOW() - INTERVAL '${withinMinutes} minutes'
        AND is_bot = false
    `, [sessionId]);
    return parseInt(result.rows[0].count);
    */
  }

  /**
   * Find recent click (for duplicate detection)
   */
  static async findRecent(params: {
    sessionId?: string;
    productId: string;
    retailerId: string;
    withinMinutes: number;
  }): Promise<Click | null> {
    const cutoff = new Date(Date.now() - params.withinMinutes * 60 * 1000);

    const found = clickStore.find(
      (c) =>
        (!params.sessionId || c.sessionId === params.sessionId) &&
        c.productId === params.productId &&
        c.retailerId === params.retailerId &&
        c.createdAt > cutoff &&
        !c.isBot
    );

    return found || null;

    /* PostgreSQL implementation:
    const result = await db.query(`
      SELECT *
      FROM affiliate_clicks
      WHERE session_id = $1
        AND product_id = $2
        AND retailer_id = $3
        AND created_at > NOW() - INTERVAL '${params.withinMinutes} minutes'
        AND is_bot = false
      LIMIT 1
    `, [params.sessionId, params.productId, params.retailerId]);
    return result.rows[0] || null;
    */
  }

  /**
   * Aggregate click analytics
   */
  static async aggregate(params: AggregateParams): Promise<ClickAnalytics> {
    const { dateRange, groupBy, excludeBots = true } = params;

    // Filter clicks in date range
    let clicks = clickStore.filter(
      (c) => c.createdAt >= dateRange.start && c.createdAt <= dateRange.end
    );

    if (excludeBots) {
      clicks = clicks.filter((c) => !c.isBot);
    }

    const botClicks = clickStore.filter(
      (c) =>
        c.createdAt >= dateRange.start &&
        c.createdAt <= dateRange.end &&
        c.isBot
    ).length;

    // Unique sessions
    const uniqueSessions = new Set(clicks.map((c) => c.sessionId).filter(Boolean)).size;

    // Top products
    const productCounts = new Map<string, number>();
    clicks.forEach((c) => {
      productCounts.set(c.productId, (productCounts.get(c.productId) || 0) + 1);
    });
    const topProducts = Array.from(productCounts.entries())
      .map(([productId, count]) => ({ productId, productName: productId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top retailers
    const retailerCounts = new Map<string, number>();
    clicks.forEach((c) => {
      retailerCounts.set(c.retailerId, (retailerCounts.get(c.retailerId) || 0) + 1);
    });
    const topRetailers = Array.from(retailerCounts.entries())
      .map(([retailerId, count]) => ({ retailerId, retailerName: retailerId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Time series (daily)
    const dayCounts = new Map<string, number>();
    clicks.forEach((c) => {
      const day = c.createdAt.toISOString().split('T')[0];
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    const timeSeries = Array.from(dayCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalClicks: clicks.length,
      uniqueSessions,
      botClicks,
      topProducts,
      topRetailers,
      timeSeries,
    };
  }

  /**
   * Get click by ID
   */
  static async findById(id: string): Promise<Click | null> {
    return clickStore.find((c) => c.id === id) || null;
  }
}
