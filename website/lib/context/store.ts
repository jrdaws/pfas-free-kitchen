/**
 * AI Context Memory Store
 * 
 * In-memory storage with optional database persistence.
 * Maintains context across AI generations within a session.
 */

import { nanoid } from "nanoid";
import type {
  SessionContext,
  ProjectUnderstanding,
  AIInteraction,
  Correction,
  UpdateContextRequest,
} from "./types";
import { createDefaultContext, DEFAULT_CONFIDENCE } from "./types";

// In-memory context store
const contextStore = new Map<string, SessionContext>();

// Maximum interactions to keep in memory (prevent unbounded growth)
const MAX_INTERACTIONS = 50;

// Context TTL: 24 hours
const CONTEXT_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Create a new session context
 */
export function createContext(
  projectId?: string,
  userId?: string,
  initialUnderstanding?: Partial<ProjectUnderstanding>
): SessionContext {
  const contextId = nanoid(16);
  const context = createDefaultContext(projectId, userId);
  context.id = contextId;

  if (initialUnderstanding) {
    context.understanding = {
      ...context.understanding,
      ...initialUnderstanding,
      designPreferences: {
        ...context.understanding.designPreferences,
        ...initialUnderstanding.designPreferences,
      },
    };
  }

  contextStore.set(contextId, context);
  return context;
}

/**
 * Get a context by ID
 */
export function getContext(contextId: string): SessionContext | undefined {
  const context = contextStore.get(contextId);
  
  if (!context) return undefined;
  
  // Check TTL
  const age = Date.now() - new Date(context.createdAt).getTime();
  if (age > CONTEXT_TTL_MS) {
    contextStore.delete(contextId);
    return undefined;
  }
  
  return context;
}

/**
 * Get context by project ID
 */
export function getContextByProject(projectId: string): SessionContext | undefined {
  for (const context of contextStore.values()) {
    if (context.projectId === projectId) {
      return context;
    }
  }
  return undefined;
}

/**
 * Update a context
 */
export function updateContext(
  contextId: string,
  updates: UpdateContextRequest
): SessionContext | undefined {
  const context = contextStore.get(contextId);
  if (!context) return undefined;

  const now = new Date().toISOString();
  context.updatedAt = now;

  // Update understanding
  if (updates.understanding) {
    context.understanding = {
      ...context.understanding,
      ...updates.understanding,
      designPreferences: {
        ...context.understanding.designPreferences,
        ...updates.understanding.designPreferences,
      },
    };
    
    // Recalculate confidence
    context.confidence = calculateConfidence(context.understanding);
  }

  // Add interaction
  if (updates.interaction) {
    const interaction: AIInteraction = {
      id: nanoid(8),
      timestamp: now,
      ...updates.interaction,
    };
    context.interactions.push(interaction);
    
    // Trim old interactions
    if (context.interactions.length > MAX_INTERACTIONS) {
      context.interactions = context.interactions.slice(-MAX_INTERACTIONS);
    }
  }

  // Add correction
  if (updates.correction) {
    const correction: Correction = {
      ...updates.correction,
      id: nanoid(8),
      timestamp: now,
      applied: false,
    };
    context.corrections.push(correction);
    
    // Auto-apply correction to understanding
    applyCorrection(context, correction);
  }

  // Add completed step
  if (updates.completedStep && !context.completedSteps.includes(updates.completedStep)) {
    context.completedSteps.push(updates.completedStep);
  }

  // Update state snapshot
  if (updates.stateSnapshot) {
    context.stateSnapshot = updates.stateSnapshot;
  }

  contextStore.set(contextId, context);
  return context;
}

/**
 * Record an AI interaction
 */
export function recordInteraction(
  contextId: string,
  type: AIInteraction["type"],
  input: AIInteraction["input"],
  output: AIInteraction["output"],
  duration?: number,
  model?: string
): AIInteraction | undefined {
  const context = contextStore.get(contextId);
  if (!context) return undefined;

  const interaction: AIInteraction = {
    id: nanoid(8),
    timestamp: new Date().toISOString(),
    type,
    input,
    output,
    duration,
    model,
  };

  context.interactions.push(interaction);
  context.updatedAt = interaction.timestamp;

  // Trim old interactions
  if (context.interactions.length > MAX_INTERACTIONS) {
    context.interactions = context.interactions.slice(-MAX_INTERACTIONS);
  }

  contextStore.set(contextId, context);
  return interaction;
}

/**
 * Record user feedback on an interaction
 */
export function recordFeedback(
  contextId: string,
  interactionId: string,
  feedback: AIInteraction["userFeedback"]
): boolean {
  const context = contextStore.get(contextId);
  if (!context) return false;

  const interaction = context.interactions.find((i) => i.id === interactionId);
  if (!interaction) return false;

  interaction.userFeedback = feedback;
  context.updatedAt = new Date().toISOString();
  contextStore.set(contextId, context);
  return true;
}

/**
 * Learn from a user correction
 */
export function learnCorrection(
  contextId: string,
  field: string,
  original: string,
  corrected: string,
  correctionContext: string
): Correction | undefined {
  const context = contextStore.get(contextId);
  if (!context) return undefined;

  const correction: Correction = {
    id: nanoid(8),
    timestamp: new Date().toISOString(),
    field,
    original,
    corrected,
    context: correctionContext,
    applied: false,
  };

  context.corrections.push(correction);
  
  // Apply correction to understanding
  applyCorrection(context, correction);

  context.updatedAt = correction.timestamp;
  contextStore.set(contextId, context);
  return correction;
}

/**
 * Apply a correction to the context understanding
 */
function applyCorrection(context: SessionContext, correction: Correction): void {
  const { field, corrected } = correction;

  // Map common field names to understanding properties
  switch (field.toLowerCase()) {
    case "projectname":
    case "project_name":
    case "name":
      context.understanding.projectName = corrected;
      break;
    case "projecttype":
    case "project_type":
    case "template":
      context.understanding.projectType = corrected;
      break;
    case "targetaudience":
    case "target_audience":
    case "audience":
      context.understanding.targetAudience = corrected;
      break;
    case "problem":
    case "vision":
      context.understanding.problem = corrected;
      break;
    case "businessmodel":
    case "business_model":
      context.understanding.businessModel = corrected;
      break;
    case "style":
    case "designstyle":
    case "design_style":
      context.understanding.designPreferences.style = corrected;
      break;
    default:
      // For unknown fields, try to apply as feature or technical requirement
      if (field.startsWith("feature:")) {
        const featureName = field.replace("feature:", "");
        const idx = context.understanding.keyFeatures.indexOf(featureName);
        if (idx === -1) {
          context.understanding.keyFeatures.push(corrected);
        } else {
          context.understanding.keyFeatures[idx] = corrected;
        }
      }
  }

  correction.applied = true;
}

/**
 * Calculate confidence scores based on understanding completeness
 */
function calculateConfidence(understanding: ProjectUnderstanding): SessionContext["confidence"] {
  let projectType = 0;
  let targetAudience = 0;
  let designPreferences = 0;
  let features = 0;

  // Project type confidence
  if (understanding.projectType) projectType += 50;
  if (understanding.projectName) projectType += 30;
  if (understanding.problem) projectType += 20;

  // Target audience confidence
  if (understanding.targetAudience) targetAudience += 40;
  if (understanding.audienceType) targetAudience += 30;
  if (understanding.businessModel) targetAudience += 30;

  // Design preferences confidence
  if (understanding.designPreferences.style) designPreferences += 30;
  if (understanding.designPreferences.colors.length > 0) designPreferences += 25;
  if (understanding.designPreferences.inspiration.length > 0) designPreferences += 25;
  if (understanding.designPreferences.typography) designPreferences += 20;

  // Features confidence
  if (understanding.keyFeatures.length > 0) features += 40;
  if (understanding.keyFeatures.length >= 3) features += 30;
  if (understanding.technicalRequirements.length > 0) features += 30;

  const overall = Math.round(
    (projectType + targetAudience + designPreferences + features) / 4
  );

  return {
    projectType: Math.min(projectType, 100),
    targetAudience: Math.min(targetAudience, 100),
    designPreferences: Math.min(designPreferences, 100),
    features: Math.min(features, 100),
    overall: Math.min(overall, 100),
  };
}

/**
 * Extract understanding from configurator state
 */
export function extractUnderstandingFromState(
  state: Record<string, unknown>
): Partial<ProjectUnderstanding> {
  const understanding: Partial<ProjectUnderstanding> = {};

  if (state.projectName) understanding.projectName = state.projectName as string;
  if (state.template) understanding.projectType = state.template as string;
  if (state.vision) understanding.problem = state.vision as string;
  if (state.researchDomain) understanding.targetAudience = state.researchDomain as string;
  
  if (state.colorScheme) {
    understanding.designPreferences = {
      style: (state.designStyle as string) || "minimal",
      colors: state.customColors ? Object.values(state.customColors as Record<string, string>) : [],
      inspiration: (state.inspirationUrls as string[]) || [],
    };
  }

  if (state.selectedFeatures) {
    const features: string[] = [];
    const featureMap = state.selectedFeatures as Record<string, string[]>;
    for (const category of Object.keys(featureMap)) {
      features.push(...featureMap[category]);
    }
    understanding.keyFeatures = features;
  }

  return understanding;
}

/**
 * Delete a context
 */
export function deleteContext(contextId: string): boolean {
  return contextStore.delete(contextId);
}

/**
 * Clean up expired contexts
 */
export function cleanupExpiredContexts(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, context] of contextStore.entries()) {
    const age = now - new Date(context.createdAt).getTime();
    if (age > CONTEXT_TTL_MS) {
      contextStore.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get context summary for debugging
 */
export function getContextSummary(contextId: string): Record<string, unknown> | undefined {
  const context = contextStore.get(contextId);
  if (!context) return undefined;

  return {
    id: context.id,
    projectId: context.projectId,
    userId: context.userId,
    understanding: {
      projectName: context.understanding.projectName,
      projectType: context.understanding.projectType,
      targetAudience: context.understanding.targetAudience,
      featuresCount: context.understanding.keyFeatures.length,
    },
    interactionsCount: context.interactions.length,
    correctionsCount: context.corrections.length,
    confidence: context.confidence,
    completedSteps: context.completedSteps,
    age: Math.round((Date.now() - new Date(context.createdAt).getTime()) / 1000 / 60) + " minutes",
  };
}

