/**
 * Product State Machine
 * Manages the lifecycle of products from draft to publication/archive
 */

import type {
  ProductState,
  ProductEventType,
  ProductContext,
  ProductEvent,
} from './types.js';
import { logger } from '../config/logger.js';

// ============================================================
// STATE MACHINE DEFINITION
// ============================================================

interface StateTransition {
  target: ProductState;
  guard?: (context: ProductContext, event: ProductEvent) => boolean;
  guardName?: string;
}

interface StateDefinition {
  on: Partial<Record<ProductEventType, StateTransition>>;
  final?: boolean;
}

const PRODUCT_STATES: Record<ProductState, StateDefinition> = {
  draft: {
    on: {
      SUBMIT_FOR_REVIEW: {
        target: 'pending_review',
        guard: hasMinimumData,
        guardName: 'hasMinimumData',
      },
    },
  },

  pending_review: {
    on: {
      ASSIGN_REVIEWER: {
        target: 'under_review',
      },
      ESCALATE: {
        target: 'pending_review', // Same state, just updates lane
      },
    },
  },

  under_review: {
    on: {
      APPROVE: {
        target: 'published',
        guard: hasVerificationDecision,
        guardName: 'hasVerificationDecision',
      },
      REJECT: {
        target: 'archived',
      },
      RETURN_TO_QUEUE: {
        target: 'pending_review',
      },
      REQUEST_CHANGES: {
        target: 'needs_info',
      },
    },
  },

  needs_info: {
    on: {
      PROVIDE_INFO: {
        target: 'under_review',
      },
      TIMEOUT: {
        target: 'archived',
      },
    },
  },

  published: {
    on: {
      SUSPEND: {
        target: 'suspended',
      },
      UPDATE: {
        target: 'published', // Same state, just triggers update actions
      },
      FLAG_FOR_REVALIDATION: {
        target: 'under_review',
      },
    },
  },

  suspended: {
    on: {
      REINSTATE: {
        target: 'published',
        guard: suspensionResolved,
        guardName: 'suspensionResolved',
      },
      ARCHIVE: {
        target: 'archived',
      },
    },
  },

  archived: {
    on: {},
    final: true,
  },
};

// ============================================================
// GUARDS
// ============================================================

function hasMinimumData(context: ProductContext, _event: ProductEvent): boolean {
  const product = context.product;
  if (!product) return false;
  return !!(product.name && product.brandId && product.categoryId);
}

function hasVerificationDecision(context: ProductContext, event: ProductEvent): boolean {
  const decision = event.decision || context.decision;
  if (!decision) return false;
  return (
    decision.tier !== undefined &&
    !!decision.rationale &&
    Array.isArray(decision.evidenceIds) &&
    decision.evidenceIds.length > 0
  );
}

function suspensionResolved(context: ProductContext, event: ProductEvent): boolean {
  return event.suspensionResolved === true || context.suspensionResolved === true;
}

// ============================================================
// STATE MACHINE CLASS
// ============================================================

export class ProductStateMachine {
  private state: ProductState;
  private context: ProductContext;

  constructor(initialState: ProductState, context: Partial<ProductContext> = {}) {
    this.state = initialState;
    this.context = {
      productId: '',
      reviewLane: 'standard',
      reviewerId: null,
      rejectionReason: null,
      suspensionReason: null,
      suspensionResolved: false,
      ...context,
    };
  }

  /**
   * Get current state
   */
  getState(): ProductState {
    return this.state;
  }

  /**
   * Get current context
   */
  getContext(): ProductContext {
    return { ...this.context };
  }

  /**
   * Check if a transition is valid
   */
  canTransition(eventType: ProductEventType, event?: ProductEvent): boolean {
    const stateConfig = PRODUCT_STATES[this.state];
    if (!stateConfig || stateConfig.final) return false;

    const transition = stateConfig.on[eventType];
    if (!transition) return false;

    // Check guard if present
    if (transition.guard) {
      return transition.guard(this.context, event || { type: eventType });
    }

    return true;
  }

  /**
   * Perform a state transition
   */
  transition(event: ProductEvent): { success: boolean; error?: string } {
    const stateConfig = PRODUCT_STATES[this.state];
    
    if (!stateConfig) {
      return { success: false, error: `Invalid state: ${this.state}` };
    }

    if (stateConfig.final) {
      return { success: false, error: `Cannot transition from final state: ${this.state}` };
    }

    const transitionDef = stateConfig.on[event.type];
    
    if (!transitionDef) {
      return {
        success: false,
        error: `Invalid event '${event.type}' for state '${this.state}'`,
      };
    }

    // Check guard
    if (transitionDef.guard && !transitionDef.guard(this.context, event)) {
      return {
        success: false,
        error: `Guard '${transitionDef.guardName || 'unknown'}' failed for transition`,
      };
    }

    const previousState = this.state;
    this.state = transitionDef.target;

    // Update context based on event
    this.updateContext(event);

    logger.debug({
      productId: this.context.productId,
      previousState,
      newState: this.state,
      event: event.type,
    }, 'Product state transition');

    return { success: true };
  }

  /**
   * Update context based on event
   */
  private updateContext(event: ProductEvent): void {
    switch (event.type) {
      case 'ASSIGN_REVIEWER':
        if (event.reviewerId) {
          this.context.reviewerId = event.reviewerId;
        }
        break;

      case 'ESCALATE':
        this.context.reviewLane = 'high_risk';
        break;

      case 'REJECT':
        if (event.reason) {
          this.context.rejectionReason = event.reason;
        }
        this.context.reviewerId = null;
        break;

      case 'RETURN_TO_QUEUE':
        this.context.reviewerId = null;
        break;

      case 'APPROVE':
        if (event.decision) {
          this.context.decision = event.decision;
        }
        break;

      case 'SUSPEND':
        if (event.reason) {
          this.context.suspensionReason = event.reason;
        }
        this.context.suspensionResolved = false;
        break;

      case 'REINSTATE':
        this.context.suspensionReason = null;
        this.context.suspensionResolved = false;
        break;

      case 'FLAG_FOR_REVALIDATION':
        this.context.reviewLane = 'high_risk'; // Revalidation goes to high-risk
        this.context.reviewerId = null;
        break;
    }
  }

  /**
   * Get valid events for current state
   */
  getValidEvents(): ProductEventType[] {
    const stateConfig = PRODUCT_STATES[this.state];
    if (!stateConfig || stateConfig.final) return [];
    return Object.keys(stateConfig.on) as ProductEventType[];
  }

  /**
   * Check if current state is final
   */
  isFinal(): boolean {
    return PRODUCT_STATES[this.state]?.final === true;
  }

  /**
   * Create machine from database product
   */
  static fromProduct(product: {
    id: string;
    status: string;
    review_lane?: string;
    reviewer_id?: string;
    name?: string;
    brand_id?: string;
    category_id?: string;
  }): ProductStateMachine {
    return new ProductStateMachine(product.status as ProductState, {
      productId: product.id,
      reviewLane: (product.review_lane as 'standard' | 'high_risk') || 'standard',
      reviewerId: product.reviewer_id || null,
      product: product.name ? {
        name: product.name,
        brandId: product.brand_id || null,
        categoryId: product.category_id || null,
      } : undefined,
    });
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all valid transitions for a given state
 */
export function getProductTransitions(state: ProductState): ProductEventType[] {
  const stateConfig = PRODUCT_STATES[state];
  if (!stateConfig || stateConfig.final) return [];
  return Object.keys(stateConfig.on) as ProductEventType[];
}

/**
 * Check if a state is terminal
 */
export function isProductStateFinal(state: ProductState): boolean {
  return PRODUCT_STATES[state]?.final === true;
}

/**
 * Get the target state for a transition
 */
export function getProductTargetState(
  currentState: ProductState,
  event: ProductEventType
): ProductState | null {
  const stateConfig = PRODUCT_STATES[currentState];
  if (!stateConfig) return null;
  const transition = stateConfig.on[event];
  return transition?.target || null;
}
