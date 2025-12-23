export { analyzeIntent } from "./intent-analyzer.js";
export { generateArchitecture } from "./architecture-generator.js";
export { generateCode } from "./code-generator.js";
export { buildCursorContext } from "./context-builder.js";
export type { ProjectInput, ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext, PageDefinition, ComponentDefinition, RouteDefinition, FileDefinition, IntegrationRequirements, TemplateMetadata, Inspiration, ModelTier, } from "./types.js";
export { AIAgentError, handleLLMError, handleValidationError } from "./error-handler.js";
export { LLMClient } from "./utils/llm-client.js";
export { PromptLoader } from "./utils/prompt-loader.js";
export { TemplateSelector } from "./template-selector.js";
export { TokenTracker, getGlobalTracker, resetGlobalTracker } from "./utils/token-tracker.js";
export type { TokenUsage, TokenSummary, PipelineStage } from "./utils/token-tracker.js";
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
export declare const MODEL_TIERS: Record<ModelTier, {
    intent: string;
    architecture: string;
    code: string;
    context: string;
}>;
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
export declare function generateProject(input: ProjectInput, apiKeyOrOptions?: string | GenerateProjectOptions): Promise<GenerateProjectResult>;
//# sourceMappingURL=index.d.ts.map