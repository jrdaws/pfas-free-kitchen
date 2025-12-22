export { analyzeIntent } from "./intent-analyzer";
export { generateArchitecture } from "./architecture-generator";
export { generateCode } from "./code-generator";
export { buildCursorContext } from "./context-builder";
export type { ProjectInput, ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext, PageDefinition, ComponentDefinition, RouteDefinition, FileDefinition, IntegrationRequirements, TemplateMetadata, Inspiration, } from "./types";
export { AIAgentError, handleLLMError, handleValidationError } from "./error-handler";
export { LLMClient } from "./utils/llm-client";
export { PromptLoader } from "./utils/prompt-loader";
export { TemplateSelector } from "./template-selector";
import type { ProjectInput, ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext } from "./types";
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
export declare function generateProject(input: ProjectInput, apiKey?: string): Promise<GenerateProjectResult>;
//# sourceMappingURL=index.d.ts.map