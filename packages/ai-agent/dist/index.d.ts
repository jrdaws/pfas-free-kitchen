export { analyzeIntent } from "./intent-analyzer.js";
export { generateArchitecture } from "./architecture-generator.js";
export { generateCode } from "./code-generator.js";
export { buildCursorContext } from "./context-builder.js";
export type { ProjectInput, ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext, PageDefinition, ComponentDefinition, RouteDefinition, FileDefinition, IntegrationRequirements, TemplateMetadata, Inspiration, } from "./types.js";
export { AIAgentError, handleLLMError, handleValidationError } from "./error-handler.js";
export { LLMClient } from "./utils/llm-client.js";
export { PromptLoader } from "./utils/prompt-loader.js";
export { TemplateSelector } from "./template-selector.js";
export { TokenTracker, getGlobalTracker, resetGlobalTracker } from "./utils/token-tracker.js";
export type { TokenUsage, TokenSummary, PipelineStage } from "./utils/token-tracker.js";
import type { ProjectInput, ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext } from "./types.js";
export interface GenerateProjectResult {
    intent: ProjectIntent;
    architecture: ProjectArchitecture;
    code: GeneratedCode;
    context: CursorContext;
}
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
 * @param apiKey - Optional Anthropic API key (uses env var if not provided)
 * @returns Complete project generation result
 *
 * @example
 * ```typescript
 * const result = await generateProject({
 *   description: 'A fitness tracking app with social features',
 *   projectName: 'FitTrack'
 * });
 *
 * console.log(result.intent.suggestedTemplate); // 'saas'
 * console.log(result.architecture.pages); // Array of pages
 * console.log(result.code.files); // Generated files
 * console.log(result.context.cursorrules); // .cursorrules content
 * ```
 */
export interface GenerateProjectOptions {
    apiKey?: string;
    logTokenUsage?: boolean;
}
export declare function generateProject(input: ProjectInput, apiKeyOrOptions?: string | GenerateProjectOptions): Promise<GenerateProjectResult>;
//# sourceMappingURL=index.d.ts.map