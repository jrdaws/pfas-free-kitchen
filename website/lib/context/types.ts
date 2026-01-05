/**
 * AI Context Memory System Types
 * 
 * Types for maintaining coherent context across AI generations.
 */

export type InteractionType = "research" | "preview" | "component" | "export" | "refinement";
export type FeedbackType = "accepted" | "modified" | "rejected";

export interface DesignPreferences {
  style: string;
  colors: string[];
  inspiration: string[];
  typography?: {
    heading: string;
    body: string;
  };
  layout?: string;
}

export interface ProjectUnderstanding {
  projectName: string;
  projectType: string;
  targetAudience: string;
  audienceType: "b2b" | "b2c" | "internal" | "mixed";
  problem: string;
  keyFeatures: string[];
  designPreferences: DesignPreferences;
  technicalRequirements: string[];
  businessModel: string;
  competitors: string[];
  differentiators: string[];
}

export interface AIInteraction {
  id: string;
  timestamp: string;
  type: InteractionType;
  input: {
    prompt?: string;
    parameters?: Record<string, unknown>;
  };
  output: {
    content?: string;
    data?: Record<string, unknown>;
  };
  userFeedback?: FeedbackType;
  duration?: number;
  model?: string;
}

export interface Correction {
  id: string;
  timestamp: string;
  field: string;
  original: string;
  corrected: string;
  context: string;
  applied: boolean;
}

export interface SessionContext {
  id: string;
  projectId?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Accumulated understanding of the project
  understanding: ProjectUnderstanding;
  
  // AI interaction history (last N interactions)
  interactions: AIInteraction[];
  
  // User corrections and refinements
  corrections: Correction[];
  
  // Confidence scores for understanding
  confidence: {
    projectType: number;
    targetAudience: number;
    designPreferences: number;
    features: number;
    overall: number;
  };
  
  // Step completion tracking
  completedSteps: string[];
  
  // Current configurator state snapshot
  stateSnapshot?: Record<string, unknown>;
}

// Default values

export const DEFAULT_UNDERSTANDING: ProjectUnderstanding = {
  projectName: "",
  projectType: "saas",
  targetAudience: "",
  audienceType: "b2c",
  problem: "",
  keyFeatures: [],
  designPreferences: {
    style: "minimal",
    colors: [],
    inspiration: [],
  },
  technicalRequirements: [],
  businessModel: "subscription",
  competitors: [],
  differentiators: [],
};

export const DEFAULT_CONFIDENCE = {
  projectType: 0,
  targetAudience: 0,
  designPreferences: 0,
  features: 0,
  overall: 0,
};

export function createDefaultContext(projectId?: string, userId?: string): SessionContext {
  const now = new Date().toISOString();
  return {
    id: "",
    projectId,
    userId,
    createdAt: now,
    updatedAt: now,
    understanding: { ...DEFAULT_UNDERSTANDING },
    interactions: [],
    corrections: [],
    confidence: { ...DEFAULT_CONFIDENCE },
    completedSteps: [],
  };
}

// Request/Response types

export interface CreateContextRequest {
  projectId?: string;
  userId?: string;
  initialUnderstanding?: Partial<ProjectUnderstanding>;
}

export interface CreateContextResponse {
  success: boolean;
  context?: SessionContext;
  error?: string;
}

export interface UpdateContextRequest {
  understanding?: Partial<ProjectUnderstanding>;
  interaction?: Omit<AIInteraction, "id" | "timestamp">;
  correction?: Omit<Correction, "id" | "timestamp">;
  completedStep?: string;
  stateSnapshot?: Record<string, unknown>;
}

export interface LearnCorrectionRequest {
  field: string;
  original: string;
  corrected: string;
  context: string;
}

export interface GetContextResponse {
  success: boolean;
  context?: SessionContext;
  error?: string;
}

