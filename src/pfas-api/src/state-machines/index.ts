/**
 * State Machines Module
 * Exports all state machine types, definitions, and helpers
 */

// Types
export type {
  ProductState,
  ProductEventType,
  ProductContext,
  ProductEvent,
  ProductMinimalData,
  VerificationDecision,
  ReportState,
  ReportEventType,
  ReportContext,
  ReportEvent,
  ProductAction,
  TransitionResult,
  InvalidTransitionError,
  SLAStatus,
  SLAStatusType,
  QueueStats,
  QueueListParams,
} from './types.js';

export { SLA_HOURS } from './types.js';

// Product State Machine
export {
  ProductStateMachine,
  getProductTransitions,
  isProductStateFinal,
  getProductTargetState,
} from './product.machine.js';

// Report State Machine
export {
  ReportStateMachine,
  getPriorityForIssueType,
  getSLAHours,
  calculateSLA,
  getReportTransitions,
  isReportStateFinal,
} from './report.machine.js';
