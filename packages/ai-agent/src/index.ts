// Export core functions
export { analyzeIntent } from "./intent-analyzer.js";
export { generateArchitecture } from "./architecture-generator.js";
export { generateCode } from "./code-generator.js";
export { buildCursorContext } from "./context-builder.js";

// Export types
export type {
  ProjectInput,
  ProjectIntent,
  ProjectArchitecture,
  GeneratedCode,
  CursorContext,
  PageDefinition,
  ComponentDefinition,
  RouteDefinition,
  FileDefinition,
  IntegrationRequirements,
  TemplateMetadata,
  Inspiration,
  ModelTier,
} from "./types.js";

// Export error types
export { AIAgentError, handleLLMError, handleValidationError } from "./error-handler.js";

// Export utilities
export { LLMClient } from "./utils/llm-client.js";
export { PromptLoader } from "./utils/prompt-loader.js";
export { TemplateSelector } from "./template-selector.js";

// Export token tracking utilities
export { TokenTracker, getGlobalTracker, resetGlobalTracker } from "./utils/token-tracker.js";
export type { TokenUsage, TokenSummary, PipelineStage } from "./utils/token-tracker.js";

// Convenience function for full pipeline
import { analyzeIntent } from "./intent-analyzer.js";
import { generateArchitecture } from "./architecture-generator.js";
import { generateCode } from "./code-generator.js";
import { buildCursorContext } from "./context-builder.js";
import { getGlobalTracker, resetGlobalTracker } from "./utils/token-tracker.js";
import type { ProjectInput, ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext, ModelTier } from "./types.js";

export interface GenerateProjectResult {
  intent: ProjectIntent;
  architecture: ProjectArchitecture;
  code: GeneratedCode;
  context: CursorContext;
}

/**
 * Model configuration for each tier
 */
export const MODEL_TIERS: Record<ModelTier, { intent: string; architecture: string; code: string; context: string }> = {
  // Fast: Haiku everywhere except code (not recommended - Haiku unreliable for schemas)
  fast: {
    intent: "claude-3-haiku-20240307",
    architecture: "claude-3-haiku-20240307",
    code: "claude-sonnet-4-20250514", // Code always needs Sonnet
    context: "claude-3-haiku-20240307",
  },
  // Balanced: Haiku for intent, Sonnet for everything else
  balanced: {
    intent: "claude-3-haiku-20240307",
    architecture: "claude-sonnet-4-20250514",
    code: "claude-sonnet-4-20250514",
    context: "claude-sonnet-4-20250514",
  },
  // Quality: Sonnet everywhere (recommended - reliable output)
  quality: {
    intent: "claude-sonnet-4-20250514",
    architecture: "claude-sonnet-4-20250514",
    code: "claude-sonnet-4-20250514",
    context: "claude-sonnet-4-20250514",
  },
};

/**
 * Generate a complete project from a description
 *
 * This convenience function runs the entire pipeline:
 * 1. Analyze intent from description
 * 2. Generate architecture from intent
 * 3. Generate code from architecture
 * 4. Build Cursor context for continuation
 *
 * @param input - Project input with description and optional metadata
 * @param apiKeyOrOptions - Optional Anthropic API key or options object
 * @returns Complete project generation result
 *
 * @example
 * ```typescript
 * // Default (quality tier - recommended)
 * const result = await generateProject({
 *   description: 'A fitness tracking app with social features',
 *   projectName: 'FitTrack'
 * });
 *
 * // With options
 * const result = await generateProject(
 *   { description: '...' },
 *   { modelTier: 'fast', logTokenUsage: true } // Use Haiku where possible
 * );
 * ```
 */
export interface GenerateProjectOptions {
  apiKey?: string;
  logTokenUsage?: boolean;
  /**
   * Model tier selection:
   * - 'fast': Use Haiku where possible (~$0.05/gen, less reliable)
   * - 'balanced': Mix of Haiku and Sonnet (~$0.10/gen)
   * - 'quality': Sonnet everywhere (~$0.18/gen, most reliable) [DEFAULT]
   */
  modelTier?: ModelTier;
}

export async function generateProject(
  input: ProjectInput,
  apiKeyOrOptions?: string | GenerateProjectOptions
): Promise<GenerateProjectResult> {
  // Parse options
  const options: GenerateProjectOptions = typeof apiKeyOrOptions === "string"
    ? { apiKey: apiKeyOrOptions, logTokenUsage: true }
    : { logTokenUsage: true, ...apiKeyOrOptions };

  const { apiKey, logTokenUsage } = options;

  // Reset token tracker for new generation
  resetGlobalTracker();

  // Step 1: Analyze intent
  const intent = await analyzeIntent(input, apiKey);

  // Step 2: Generate architecture
  const architecture = await generateArchitecture(intent, apiKey);

  // Step 3: Generate code
  const code = await generateCode(architecture, input, apiKey);

  // Step 4: Build Cursor context
  const context = await buildCursorContext(
    {
      intent,
      architecture,
      code,
      projectName: input.projectName,
      description: input.description,
    },
    apiKey
  );

  // Log token usage summary
  if (logTokenUsage) {
    const tracker = getGlobalTracker();
    console.log(tracker.exportMetrics());
  }

  return {
    intent,
    architecture,
    code,
    context,
  };
}
