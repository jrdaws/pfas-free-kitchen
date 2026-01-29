/**
 * Queue Service
 * Manages the product review queue
 */

import type { QueueStats, QueueListParams } from '../state-machines/types.js';
import type { QueueResponse, QueueItem } from '../types/api.types.js';
import { WorkflowService } from './workflow.service.js';
import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { calculatePagination } from '../utils/pagination.js';

// ============================================================
// QUEUE SERVICE
// ============================================================

export class QueueService {
  /**
   * Add product to review queue
   */
  static async addToReviewQueue(
    productId: string,
    options: { lane: 'standard' | 'high_risk' }
  ): Promise<void> {
    await db.query(
      `UPDATE products SET 
        status = 'pending_review',
        review_lane = $1,
        updated_at = NOW()
       WHERE id = $2`,
      [options.lane, productId]
    );

    await db.query(
      `UPDATE verification_status SET review_lane = $1, updated_at = NOW() WHERE product_id = $2`,
      [options.lane, productId]
    );

    await this.publishEvent('product.queued', { productId, lane: options.lane });

    logger.info({ productId, lane: options.lane }, 'Product added to review queue');
  }

  /**
   * Get queue items with filtering
   */
  static async getQueue(params: QueueListParams): Promise<QueueResponse> {
    const { lane, assignedTo, unassignedOnly, page, limit } = params;

    // Build WHERE conditions
    const conditions: string[] = [`p.status IN ('pending_review', 'under_review')`];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (lane) {
      conditions.push(`COALESCE(p.review_lane, 'standard') = $${paramIndex++}`);
      values.push(lane);
    }

    if (assignedTo) {
      conditions.push(`p.reviewer_id = $${paramIndex++}`);
      values.push(assignedTo);
    } else if (unassignedOnly) {
      conditions.push(`p.reviewer_id IS NULL`);
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM products p 
       JOIN brands b ON p.brand_id = b.id
       JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult?.count || '0', 10);

    // Get queue items with pagination
    const offset = (page - 1) * limit;
    const items = await db.query<{
      id: string;
      name: string;
      slug: string;
      brand_name: string;
      category_name: string;
      status: string;
      pfas_risk_flagged: boolean;
      requires_elevated_review: boolean;
      tier: string;
      review_lane: string;
      review_started_at: Date | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT 
        p.id, p.name, p.slug, b.name as brand_name, c.name as category_name,
        p.status, p.pfas_risk_flagged, p.requires_elevated_review,
        vs.tier, COALESCE(p.review_lane, 'standard') as review_lane,
        vs.review_started_at, p.created_at, p.updated_at
       FROM products p
       JOIN brands b ON p.brand_id = b.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN verification_status vs ON p.id = vs.product_id
       WHERE ${whereClause}
       ORDER BY 
         p.requires_elevated_review DESC,
         p.pfas_risk_flagged DESC,
         p.created_at ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    const queueItems: QueueItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      brandName: item.brand_name,
      categoryName: item.category_name,
      status: item.status,
      pfasRiskFlagged: item.pfas_risk_flagged,
      requiresElevatedReview: item.requires_elevated_review,
      tier: parseInt(item.tier || '0', 10) as 0 | 1 | 2 | 3 | 4,
      reviewLane: item.review_lane,
      reviewStartedAt: item.review_started_at?.toISOString(),
      createdAt: item.created_at.toISOString(),
      updatedAt: item.updated_at.toISOString(),
    }));

    return {
      data: {
        items: queueItems,
        pagination: calculatePagination(page, limit, totalCount),
      },
    };
  }

  /**
   * Assign product to reviewer
   */
  static async assignToReviewer(
    productId: string,
    reviewerId: string,
    actorId: string
  ): Promise<void> {
    await WorkflowService.transitionProduct(
      productId,
      { type: 'ASSIGN_REVIEWER', reviewerId },
      actorId
    );

    // Update review started time
    await db.query(
      `UPDATE verification_status SET review_started_at = NOW() WHERE product_id = $1`,
      [productId]
    );

    logger.info({ productId, reviewerId, actorId }, 'Product assigned to reviewer');
  }

  /**
   * Return product to queue (unassign)
   */
  static async returnToQueue(
    productId: string,
    actorId: string,
    reason?: string
  ): Promise<void> {
    await WorkflowService.transitionProduct(
      productId,
      { type: 'RETURN_TO_QUEUE', reason },
      actorId
    );

    logger.info({ productId, actorId, reason }, 'Product returned to queue');
  }

  /**
   * Escalate product to high-risk lane
   */
  static async escalate(
    productId: string,
    actorId: string,
    reason?: string
  ): Promise<void> {
    await WorkflowService.transitionProduct(
      productId,
      { type: 'ESCALATE', reason },
      actorId
    );

    logger.info({ productId, actorId, reason }, 'Product escalated to high-risk lane');
  }

  /**
   * Get queue statistics
   */
  static async getStats(): Promise<QueueStats> {
    const [pending, underReview, byLane, avgAge] = await Promise.all([
      this.countByStatus('pending_review'),
      this.countByStatus('under_review'),
      this.countByReviewLane(),
      this.getAverageQueueAge(),
    ]);

    return {
      pending,
      underReview,
      byLane,
      avgAgeHours: avgAge,
    };
  }

  /**
   * Count products by status
   */
  private static async countByStatus(status: string): Promise<number> {
    const result = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM products WHERE status = $1`,
      [status]
    );
    return parseInt(result?.count || '0', 10);
  }

  /**
   * Count products by review lane
   */
  private static async countByReviewLane(): Promise<{ standard: number; highRisk: number }> {
    const results = await db.query<{ review_lane: string; count: string }>(
      `SELECT COALESCE(review_lane, 'standard') as review_lane, COUNT(*) as count
       FROM products 
       WHERE status IN ('pending_review', 'under_review')
       GROUP BY COALESCE(review_lane, 'standard')`
    );

    const counts = { standard: 0, highRisk: 0 };
    for (const row of results) {
      if (row.review_lane === 'high_risk') {
        counts.highRisk = parseInt(row.count, 10);
      } else {
        counts.standard = parseInt(row.count, 10);
      }
    }

    return counts;
  }

  /**
   * Get average age of items in queue (hours)
   */
  private static async getAverageQueueAge(): Promise<number> {
    const result = await db.queryOne<{ avg_hours: number }>(
      `SELECT AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600) as avg_hours
       FROM products 
       WHERE status IN ('pending_review', 'under_review')`
    );
    return result?.avg_hours || 0;
  }

  /**
   * Get my assigned items (for reviewer dashboard)
   */
  static async getMyAssignments(
    reviewerId: string,
    page: number = 1,
    limit: number = 24
  ): Promise<QueueResponse> {
    return this.getQueue({
      assignedTo: reviewerId,
      page,
      limit,
    });
  }

  /**
   * Get next item for review (auto-assignment)
   */
  static async getNextForReview(
    reviewerId: string,
    preferLane?: 'standard' | 'high_risk'
  ): Promise<QueueItem | null> {
    // Get the oldest unassigned item, preferring the specified lane
    const orderByLane = preferLane === 'high_risk'
      ? `CASE WHEN review_lane = 'high_risk' THEN 0 ELSE 1 END,`
      : '';

    const item = await db.queryOne<{
      id: string;
      name: string;
      slug: string;
      brand_name: string;
      category_name: string;
      status: string;
      pfas_risk_flagged: boolean;
      requires_elevated_review: boolean;
      tier: string;
      review_lane: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT 
        p.id, p.name, p.slug, b.name as brand_name, c.name as category_name,
        p.status, p.pfas_risk_flagged, p.requires_elevated_review,
        vs.tier, COALESCE(p.review_lane, 'standard') as review_lane,
        p.created_at, p.updated_at
       FROM products p
       JOIN brands b ON p.brand_id = b.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN verification_status vs ON p.id = vs.product_id
       WHERE p.status = 'pending_review' AND p.reviewer_id IS NULL
       ORDER BY 
         ${orderByLane}
         p.requires_elevated_review DESC,
         p.pfas_risk_flagged DESC,
         p.created_at ASC
       LIMIT 1`
    );

    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      brandName: item.brand_name,
      categoryName: item.category_name,
      status: item.status,
      pfasRiskFlagged: item.pfas_risk_flagged,
      requiresElevatedReview: item.requires_elevated_review,
      tier: parseInt(item.tier || '0', 10) as 0 | 1 | 2 | 3 | 4,
      reviewLane: item.review_lane,
      createdAt: item.created_at.toISOString(),
      updatedAt: item.updated_at.toISOString(),
    };
  }

  /**
   * Publish event (stub for queue integration)
   */
  private static async publishEvent(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    logger.info({ eventType, data }, 'Queue event published');
    // TODO: Publish to actual queue (SQS/SNS)
  }
}
