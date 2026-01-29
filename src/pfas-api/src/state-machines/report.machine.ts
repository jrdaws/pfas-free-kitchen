/**
 * Report State Machine
 * Manages the lifecycle of user reports from submission to resolution
 */

import type {
  ReportState,
  ReportEventType,
  ReportContext,
  ReportEvent,
  SLA_HOURS,
} from './types.js';
import type { ReportPriority, ReportIssueType } from '../types/domain.types.js';
import { logger } from '../config/logger.js';

// ============================================================
// SLA CONFIGURATION
// ============================================================

const SLA_HOURS_CONFIG: Record<ReportPriority, number> = {
  critical: 24,
  high: 72,
  normal: 168,  // 7 days
  low: 336,     // 14 days
};

const ISSUE_PRIORITY_MAP: Record<ReportIssueType, ReportPriority> = {
  suspected_pfas: 'high',
  materials_changed: 'high',
  counterfeit_risk: 'high',
  listing_mismatch: 'normal',
  other: 'normal',
};

// ============================================================
// STATE MACHINE DEFINITION
// ============================================================

interface StateTransition {
  target: ReportState;
  guard?: (context: ReportContext, event: ReportEvent) => boolean;
  guardName?: string;
}

interface StateDefinition {
  on: Partial<Record<ReportEventType, StateTransition>>;
  final?: boolean;
  entry?: (context: ReportContext) => void;
}

const REPORT_STATES: Record<ReportState, StateDefinition> = {
  submitted: {
    entry: (context) => {
      // Calculate SLA and set priority on entry
      context.priority = ISSUE_PRIORITY_MAP[context.issueType] || 'normal';
      context.slaDeadline = calculateSLADeadline(context.priority);
    },
    on: {
      ASSIGN: {
        target: 'under_review',
      },
      AUTO_DISMISS: {
        target: 'dismissed',
        guard: isDuplicateReport,
        guardName: 'isDuplicateReport',
      },
    },
  },

  under_review: {
    on: {
      RESOLVE_DISMISS: {
        target: 'dismissed',
      },
      RESOLVE_ACTION: {
        target: 'resolved',
      },
      REQUEST_MORE_INFO: {
        target: 'awaiting_info',
      },
      ESCALATE: {
        target: 'under_review', // Same state, increases priority
      },
    },
  },

  awaiting_info: {
    on: {
      INFO_PROVIDED: {
        target: 'under_review',
      },
      TIMEOUT: {
        target: 'dismissed',
      },
    },
  },

  resolved: {
    on: {},
    final: true,
  },

  dismissed: {
    on: {},
    final: true,
  },
};

// ============================================================
// GUARDS
// ============================================================

function isDuplicateReport(context: ReportContext, _event: ReportEvent): boolean {
  return context.duplicateReportId !== null;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateSLADeadline(priority: ReportPriority): Date {
  const hours = SLA_HOURS_CONFIG[priority];
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

// ============================================================
// STATE MACHINE CLASS
// ============================================================

export class ReportStateMachine {
  private state: ReportState;
  private context: ReportContext;

  constructor(initialState: ReportState, context: Partial<ReportContext> = {}) {
    this.state = initialState;
    this.context = {
      reportId: '',
      productId: '',
      priority: 'normal',
      issueType: 'other',
      assigneeId: null,
      resolution: null,
      slaDeadline: null,
      duplicateReportId: null,
      ...context,
    };

    // Run entry action for initial state
    const stateConfig = REPORT_STATES[this.state];
    if (stateConfig?.entry) {
      stateConfig.entry(this.context);
    }
  }

  /**
   * Get current state
   */
  getState(): ReportState {
    return this.state;
  }

  /**
   * Get current context
   */
  getContext(): ReportContext {
    return { ...this.context };
  }

  /**
   * Check if a transition is valid
   */
  canTransition(eventType: ReportEventType, event?: ReportEvent): boolean {
    const stateConfig = REPORT_STATES[this.state];
    if (!stateConfig || stateConfig.final) return false;

    const transition = stateConfig.on[eventType];
    if (!transition) return false;

    if (transition.guard) {
      return transition.guard(this.context, event || { type: eventType });
    }

    return true;
  }

  /**
   * Perform a state transition
   */
  transition(event: ReportEvent): { success: boolean; error?: string } {
    const stateConfig = REPORT_STATES[this.state];

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

    // Run entry action for new state
    const newStateConfig = REPORT_STATES[this.state];
    if (newStateConfig?.entry) {
      newStateConfig.entry(this.context);
    }

    logger.debug({
      reportId: this.context.reportId,
      previousState,
      newState: this.state,
      event: event.type,
    }, 'Report state transition');

    return { success: true };
  }

  /**
   * Update context based on event
   */
  private updateContext(event: ReportEvent): void {
    switch (event.type) {
      case 'ASSIGN':
        if (event.assigneeId) {
          this.context.assigneeId = event.assigneeId;
        }
        break;

      case 'RESOLVE_DISMISS':
      case 'RESOLVE_ACTION':
        if (event.resolution) {
          this.context.resolution = event.resolution;
        }
        if (event.productAction) {
          this.context.productAction = event.productAction;
        }
        break;

      case 'ESCALATE':
        this.escalatePriority();
        break;

      case 'AUTO_DISMISS':
        this.context.resolution = 'Automatically dismissed as duplicate';
        break;

      case 'TIMEOUT':
        this.context.resolution = 'Timed out awaiting information';
        break;
    }
  }

  /**
   * Escalate report priority
   */
  private escalatePriority(): void {
    const priorityOrder: ReportPriority[] = ['low', 'normal', 'high', 'critical'];
    const currentIndex = priorityOrder.indexOf(this.context.priority);
    
    if (currentIndex < priorityOrder.length - 1) {
      this.context.priority = priorityOrder[currentIndex + 1];
      // Recalculate SLA with new priority
      this.context.slaDeadline = calculateSLADeadline(this.context.priority);
      
      logger.info({
        reportId: this.context.reportId,
        newPriority: this.context.priority,
        newDeadline: this.context.slaDeadline,
      }, 'Report priority escalated');
    }
  }

  /**
   * Get valid events for current state
   */
  getValidEvents(): ReportEventType[] {
    const stateConfig = REPORT_STATES[this.state];
    if (!stateConfig || stateConfig.final) return [];
    return Object.keys(stateConfig.on) as ReportEventType[];
  }

  /**
   * Check if current state is final
   */
  isFinal(): boolean {
    return REPORT_STATES[this.state]?.final === true;
  }

  /**
   * Get SLA status
   */
  getSLAStatus(): {
    status: 'on_track' | 'at_risk' | 'breached' | 'met' | 'unknown';
    hoursRemaining?: number;
    hoursOverdue?: number;
  } {
    if (!this.context.slaDeadline) {
      return { status: 'unknown' };
    }

    const now = new Date();
    const deadline = new Date(this.context.slaDeadline);
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If already resolved
    if (this.isFinal()) {
      return { status: hoursRemaining >= 0 ? 'met' : 'breached' };
    }

    if (hoursRemaining < 0) {
      return { status: 'breached', hoursOverdue: Math.abs(hoursRemaining) };
    }
    if (hoursRemaining < 24) {
      return { status: 'at_risk', hoursRemaining };
    }
    return { status: 'on_track', hoursRemaining };
  }

  /**
   * Create machine from database report
   */
  static fromReport(report: {
    id: string;
    product_id: string;
    status: string;
    priority: string;
    issue_type: string;
    assignee_id?: string;
    resolution?: string;
    sla_deadline?: Date;
  }): ReportStateMachine {
    return new ReportStateMachine(report.status as ReportState, {
      reportId: report.id,
      productId: report.product_id,
      priority: report.priority as ReportPriority,
      issueType: report.issue_type as ReportIssueType,
      assigneeId: report.assignee_id || null,
      resolution: report.resolution || null,
      slaDeadline: report.sla_deadline || null,
      duplicateReportId: null,
    });
  }
}

// ============================================================
// EXPORT HELPERS
// ============================================================

/**
 * Get priority for issue type
 */
export function getPriorityForIssueType(issueType: ReportIssueType): ReportPriority {
  return ISSUE_PRIORITY_MAP[issueType] || 'normal';
}

/**
 * Get SLA hours for priority
 */
export function getSLAHours(priority: ReportPriority): number {
  return SLA_HOURS_CONFIG[priority];
}

/**
 * Calculate SLA deadline from creation time
 */
export function calculateSLA(createdAt: Date, priority: ReportPriority): Date {
  const hours = SLA_HOURS_CONFIG[priority];
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

/**
 * Get all valid transitions for a given state
 */
export function getReportTransitions(state: ReportState): ReportEventType[] {
  const stateConfig = REPORT_STATES[state];
  if (!stateConfig || stateConfig.final) return [];
  return Object.keys(stateConfig.on) as ReportEventType[];
}

/**
 * Check if a state is terminal
 */
export function isReportStateFinal(state: ReportState): boolean {
  return REPORT_STATES[state]?.final === true;
}
