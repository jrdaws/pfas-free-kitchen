/**
 * Search Event Handlers
 * Subscribes to product/verification events and updates the search index
 */

import { indexerService } from '../services/indexer.service.js';
import { logger } from '../config/logger.js';

// ============================================================
// EVENT TYPES
// ============================================================

export interface ProductEvent {
  productId: string;
  timestamp?: string;
}

export interface VerificationEvent {
  productId: string;
  tier?: number;
  timestamp?: string;
}

// ============================================================
// EVENT HANDLERS
// ============================================================

export class SearchEventHandlers {
  /**
   * Handle product.published event
   * Add or update product in search index
   */
  static async onProductPublished(event: ProductEvent): Promise<void> {
    logger.info({ productId: event.productId }, 'Handling product.published event');
    
    try {
      await indexerService.indexProduct(event.productId);
    } catch (error) {
      logger.error({
        productId: event.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to index product on publish');
    }
  }

  /**
   * Handle product.suspended event
   * Remove product from search index
   */
  static async onProductSuspended(event: ProductEvent): Promise<void> {
    logger.info({ productId: event.productId }, 'Handling product.suspended event');
    
    try {
      await indexerService.deindexProduct(event.productId);
    } catch (error) {
      logger.error({
        productId: event.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to deindex product on suspend');
    }
  }

  /**
   * Handle product.archived event
   * Remove product from search index
   */
  static async onProductArchived(event: ProductEvent): Promise<void> {
    logger.info({ productId: event.productId }, 'Handling product.archived event');
    
    try {
      await indexerService.deindexProduct(event.productId);
    } catch (error) {
      logger.error({
        productId: event.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to deindex product on archive');
    }
  }

  /**
   * Handle product.updated event
   * Reindex product with updated data
   */
  static async onProductUpdated(event: ProductEvent): Promise<void> {
    logger.info({ productId: event.productId }, 'Handling product.updated event');
    
    try {
      await indexerService.updateProduct(event.productId);
    } catch (error) {
      logger.error({
        productId: event.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to update product in index');
    }
  }

  /**
   * Handle verification.completed event
   * Reindex product with new verification data
   */
  static async onVerificationCompleted(event: VerificationEvent): Promise<void> {
    logger.info({
      productId: event.productId,
      tier: event.tier,
    }, 'Handling verification.completed event');
    
    try {
      await indexerService.indexProduct(event.productId);
    } catch (error) {
      logger.error({
        productId: event.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to reindex product on verification');
    }
  }

  /**
   * Handle verification.changed event
   * Reindex product when verification tier changes
   */
  static async onVerificationChanged(event: VerificationEvent): Promise<void> {
    logger.info({
      productId: event.productId,
      tier: event.tier,
    }, 'Handling verification.changed event');
    
    try {
      await indexerService.indexProduct(event.productId);
    } catch (error) {
      logger.error({
        productId: event.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to reindex product on verification change');
    }
  }

  /**
   * Handle evidence.added event
   * Reindex product when new evidence is attached
   */
  static async onEvidenceAdded(event: ProductEvent): Promise<void> {
    logger.info({ productId: event.productId }, 'Handling evidence.added event');
    
    try {
      await indexerService.indexProduct(event.productId);
    } catch (error) {
      logger.error({
        productId: event.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to reindex product on evidence add');
    }
  }
}

// ============================================================
// EVENT ROUTER
// ============================================================

/**
 * Route events to appropriate handlers
 */
export async function handleSearchEvent(
  eventType: string,
  payload: ProductEvent | VerificationEvent
): Promise<void> {
  const handlers: Record<string, (event: ProductEvent | VerificationEvent) => Promise<void>> = {
    'product.published': SearchEventHandlers.onProductPublished,
    'product.suspended': SearchEventHandlers.onProductSuspended,
    'product.archived': SearchEventHandlers.onProductArchived,
    'product.updated': SearchEventHandlers.onProductUpdated,
    'verification.completed': SearchEventHandlers.onVerificationCompleted,
    'verification.changed': SearchEventHandlers.onVerificationChanged,
    'evidence.added': SearchEventHandlers.onEvidenceAdded,
  };

  const handler = handlers[eventType];
  if (handler) {
    await handler(payload);
  } else {
    logger.debug({ eventType }, 'No search handler for event type');
  }
}

// ============================================================
// SUBSCRIPTION SETUP (for queue workers)
// ============================================================

/**
 * Subscribe to product events
 * Call this in your queue worker or event bus setup
 */
export function subscribeToSearchEvents(
  subscribe: (eventType: string, handler: (payload: object) => Promise<void>) => void
): void {
  const eventTypes = [
    'product.published',
    'product.suspended',
    'product.archived',
    'product.updated',
    'verification.completed',
    'verification.changed',
    'evidence.added',
  ];

  for (const eventType of eventTypes) {
    subscribe(eventType, async (payload) => {
      await handleSearchEvent(eventType, payload as ProductEvent | VerificationEvent);
    });
  }

  logger.info({ eventTypes }, 'Subscribed to search events');
}
