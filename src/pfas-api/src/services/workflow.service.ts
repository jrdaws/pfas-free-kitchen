/**
 * Workflow Service
 * Handles state transitions for products and reports
 */

import type {
  ProductState,
  ProductEvent,
  ReportState,
  ReportEvent,
  TransitionResult,
} from '../state-machines/types.js';
import { ProductStateMachine, getProductTransitions } from '../state-machines/product.machine.js';
import { ReportStateMachine, getReportTransitions } from '../state-machines/report.machine.js';
import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError.js';

// ============================================================
// CUSTOM ERRORS
// ============================================================

export class InvalidTransitionError extends ConflictError {
  public readonly currentState: string;
  public readonly attemptedEvent: string;
  public readonly validEvents: string[];

  constructor(
    currentState: string,
    attemptedEvent: string,
    validEvents: string[]
  ) {
    super(
      `Cannot transition from '${currentState}' via '${attemptedEvent}'. ` +
      `Valid events: ${validEvents.join(', ') || 'none'}`
    );
    this.name = 'InvalidTransitionError';
    this.currentState = currentState;
    this.attemptedEvent = attemptedEvent;
    this.validEvents = validEvents;
  }
}

// ============================================================
// WORKFLOW SERVICE
// ============================================================

export class WorkflowService {
  /**
   * Transition a product to a new state
   */
  static async transitionProduct(
    productId: string,
    event: ProductEvent,
    actorId: string
  ): Promise<TransitionResult> {
    // Fetch product from database
    const product = await db.queryOne<{
      id: string;
      status: string;
      review_lane: string;
      reviewer_id: string | null;
      name: string;
      brand_id: string;
      category_id: string;
    }>(
      `SELECT id, status, review_lane, reviewer_id, name, brand_id, category_id 
       FROM products WHERE id = $1`,
      [productId]
    );

    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    const previousState = product.status as ProductState;

    // Create state machine from current state
    const machine = ProductStateMachine.fromProduct(product);

    // Validate transition
    if (!machine.canTransition(event.type, event)) {
      const validEvents = machine.getValidEvents();
      throw new InvalidTransitionError(previousState, event.type, validEvents);
    }

    // Execute transition
    const result = machine.transition(event);
    if (!result.success) {
      throw new ValidationError(result.error || 'Transition failed');
    }

    const newState = machine.getState();
    const newContext = machine.getContext();

    // Persist new state to database
    await db.query(
      `UPDATE products SET 
        status = $1,
        review_lane = $2,
        reviewer_id = $3,
        updated_at = NOW()
       WHERE id = $4`,
      [newState, newContext.reviewLane, newContext.reviewerId, productId]
    );

    // Execute side effects
    await this.executeProductSideEffects(productId, previousState, newState, event, actorId);

    // Log to audit
    await this.logProductTransition(actorId, productId, previousState, newState, event);

    logger.info({
      productId,
      previousState,
      newState,
      event: event.type,
      actorId,
    }, 'Product state transitioned');

    return {
      previousState,
      newState,
      entityId: productId,
      entityType: 'product',
      timestamp: new Date(),
      actorId,
    };
  }

  /**
   * Transition a report to a new state
   */
  static async transitionReport(
    reportId: string,
    event: ReportEvent,
    actorId: string
  ): Promise<TransitionResult> {
    // Fetch report from database
    const report = await db.queryOne<{
      id: string;
      product_id: string;
      status: string;
      priority: string;
      issue_type: string;
      assignee_id: string | null;
      resolution: string | null;
      sla_deadline: Date | null;
    }>(
      `SELECT id, product_id, status, priority, issue_type, assignee_id, resolution, sla_deadline
       FROM user_reports WHERE id = $1`,
      [reportId]
    );

    if (!report) {
      throw new NotFoundError('Report', reportId);
    }

    const previousState = report.status as ReportState;

    // Create state machine from current state
    const machine = ReportStateMachine.fromReport({
      ...report,
      assignee_id: report.assignee_id || undefined,
      resolution: report.resolution || undefined,
      sla_deadline: report.sla_deadline || undefined,
    });

    // Validate transition
    if (!machine.canTransition(event.type, event)) {
      const validEvents = machine.getValidEvents();
      throw new InvalidTransitionError(previousState, event.type, validEvents);
    }

    // Execute transition
    const result = machine.transition(event);
    if (!result.success) {
      throw new ValidationError(result.error || 'Transition failed');
    }

    const newState = machine.getState();
    const newContext = machine.getContext();

    // Persist new state to database
    await db.query(
      `UPDATE user_reports SET 
        status = $1,
        priority = $2,
        assignee_id = $3,
        resolution = $4,
        sla_deadline = $5,
        updated_at = NOW()
       WHERE id = $6`,
      [
        newState,
        newContext.priority,
        newContext.assigneeId,
        newContext.resolution,
        newContext.slaDeadline,
        reportId,
      ]
    );

    // Execute side effects
    await this.executeReportSideEffects(
      reportId,
      report.product_id,
      previousState,
      newState,
      event,
      actorId,
      newContext
    );

    // Log to audit
    await this.logReportTransition(actorId, reportId, previousState, newState, event);

    logger.info({
      reportId,
      previousState,
      newState,
      event: event.type,
      actorId,
    }, 'Report state transitioned');

    return {
      previousState,
      newState,
      entityId: reportId,
      entityType: 'report',
      timestamp: new Date(),
      actorId,
    };
  }

  /**
   * Get valid transitions for an entity
   */
  static getValidTransitions(
    entityType: 'product' | 'report',
    currentState: string
  ): string[] {
    if (entityType === 'product') {
      return getProductTransitions(currentState as ProductState);
    }
    return getReportTransitions(currentState as ReportState);
  }

  /**
   * Execute side effects for product transitions
   */
  private static async executeProductSideEffects(
    productId: string,
    previousState: ProductState,
    newState: ProductState,
    event: ProductEvent,
    actorId: string
  ): Promise<void> {
    // Published: Index in search
    if (newState === 'published' && previousState !== 'published') {
      await this.publishEvent('product.published', { productId, actorId });
      // TODO: Trigger search indexing
    }

    // Suspended: Remove from search, notify
    if (newState === 'suspended') {
      await this.publishEvent('product.suspended', {
        productId,
        reason: event.reason,
        actorId,
      });
      // TODO: Trigger search de-indexing
    }

    // Archived: Remove from search
    if (newState === 'archived') {
      await this.publishEvent('product.archived', { productId, actorId });
    }

    // Assigned reviewer
    if (event.type === 'ASSIGN_REVIEWER' && event.reviewerId) {
      await this.publishEvent('product.assigned', {
        productId,
        reviewerId: event.reviewerId,
        actorId,
      });
    }

    // Approval: Create verification record
    if (event.type === 'APPROVE' && event.decision) {
      await this.createVerificationFromDecision(productId, event.decision, actorId);
    }
  }

  /**
   * Execute side effects for report transitions
   */
  private static async executeReportSideEffects(
    reportId: string,
    productId: string,
    previousState: ReportState,
    newState: ReportState,
    event: ReportEvent,
    actorId: string,
    context: { productAction?: string }
  ): Promise<void> {
    // Assigned reviewer
    if (event.type === 'ASSIGN' && event.assigneeId) {
      await this.publishEvent('report.assigned', {
        reportId,
        assigneeId: event.assigneeId,
        actorId,
      });
    }

    // Resolved with action: Apply to product
    if (newState === 'resolved' && context.productAction && context.productAction !== 'none') {
      await this.applyProductAction(productId, context.productAction, actorId, reportId);
    }

    // Resolution: Notify reporter
    if (newState === 'resolved' || newState === 'dismissed') {
      await this.publishEvent('report.resolved', {
        reportId,
        productId,
        resolution: event.resolution,
        outcome: newState,
        actorId,
      });
      // TODO: Send notification email to reporter
    }

    // Priority escalation
    if (event.type === 'ESCALATE') {
      await this.publishEvent('report.escalated', {
        reportId,
        actorId,
      });
    }
  }

  /**
   * Create verification record from approval decision
   */
  private static async createVerificationFromDecision(
    productId: string,
    decision: ProductEvent['decision'],
    actorId: string
  ): Promise<void> {
    if (!decision) return;

    const { v4: uuidv4 } = await import('uuid');

    await db.query(
      `INSERT INTO verification_status (
        id, product_id, tier, claim_type, scope_text, rationale, 
        evidence_ids, unknowns, reviewer_id, decision_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (product_id) DO UPDATE SET
        tier = EXCLUDED.tier,
        claim_type = EXCLUDED.claim_type,
        scope_text = EXCLUDED.scope_text,
        rationale = EXCLUDED.rationale,
        evidence_ids = EXCLUDED.evidence_ids,
        unknowns = EXCLUDED.unknowns,
        reviewer_id = EXCLUDED.reviewer_id,
        decision_date = NOW(),
        updated_at = NOW()`,
      [
        uuidv4(),
        productId,
        String(decision.tier),
        decision.claimType || null,
        decision.scopeText || null,
        decision.rationale,
        decision.evidenceIds,
        decision.unknowns || null,
        actorId,
      ]
    );

    // Also add to verification history
    await db.query(
      `INSERT INTO verification_history (
        id, product_id, to_tier, to_claim_type, reason, evidence_ids, reviewer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        productId,
        String(decision.tier),
        decision.claimType || null,
        decision.rationale,
        decision.evidenceIds,
        actorId,
      ]
    );
  }

  /**
   * Apply action to product based on report resolution
   */
  private static async applyProductAction(
    productId: string,
    action: string,
    actorId: string,
    reportId: string
  ): Promise<void> {
    logger.info({ productId, action, reportId }, 'Applying product action from report');

    switch (action) {
      case 'suspend':
        await this.transitionProduct(
          productId,
          { type: 'SUSPEND', reason: `Suspended due to report ${reportId}` },
          actorId
        );
        break;

      case 'flag_revalidation':
        await this.transitionProduct(
          productId,
          { type: 'FLAG_FOR_REVALIDATION' },
          actorId
        );
        break;

      case 'downgrade_tier':
        // Update verification tier to 0 (Unknown)
        await db.query(
          `UPDATE verification_status SET tier = '0', updated_at = NOW() WHERE product_id = $1`,
          [productId]
        );
        break;

      case 'update_info':
        // Just log, manual update needed
        logger.info({ productId, reportId }, 'Product info update requested');
        break;
    }
  }

  /**
   * Log product transition to audit
   */
  private static async logProductTransition(
    actorId: string,
    productId: string,
    previousState: string,
    newState: string,
    event: ProductEvent
  ): Promise<void> {
    await db.query(
      `INSERT INTO audit_log (
        actor_type, actor_id, action, entity_type, entity_id,
        old_values, new_values, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'admin',
        actorId,
        `product.${event.type.toLowerCase()}`,
        'product',
        productId,
        JSON.stringify({ status: previousState }),
        JSON.stringify({ status: newState }),
        JSON.stringify({
          event: event.type,
          reviewerId: event.reviewerId,
          reason: event.reason,
        }),
      ]
    );
  }

  /**
   * Log report transition to audit
   */
  private static async logReportTransition(
    actorId: string,
    reportId: string,
    previousState: string,
    newState: string,
    event: ReportEvent
  ): Promise<void> {
    await db.query(
      `INSERT INTO audit_log (
        actor_type, actor_id, action, entity_type, entity_id,
        old_values, new_values, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'admin',
        actorId,
        `report.${event.type.toLowerCase()}`,
        'report',
        reportId,
        JSON.stringify({ status: previousState }),
        JSON.stringify({ status: newState }),
        JSON.stringify({
          event: event.type,
          assigneeId: event.assigneeId,
          resolution: event.resolution,
          productAction: event.productAction,
        }),
      ]
    );
  }

  /**
   * Publish event (stub for queue integration)
   */
  private static async publishEvent(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    logger.info({ eventType, data }, 'Event published');
    // TODO: Publish to actual queue (SQS/SNS)
  }
}
