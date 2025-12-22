// Export core functions
export { analyzeIntent } from "./intent-analyzer.js";
export { generateArchitecture } from "./architecture-generator.js";
export { generateCode } from "./code-generator.js";
export { buildCursorContext } from "./context-builder.js";
// Export error types
export { AIAgentError, handleLLMError, handleValidationError } from "./error-handler.js";
// Export utilities
export { LLMClient } from "./utils/llm-client.js";
export { PromptLoader } from "./utils/prompt-loader.js";
export { TemplateSelector } from "./template-selector.js";
// Convenience function for full pipeline
import { analyzeIntent } from "./intent-analyzer.js";
import { generateArchitecture } from "./architecture-generator.js";
import { generateCode } from "./code-generator.js";
import { buildCursorContext } from "./context-builder.js";
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
export async function generateProject(input, apiKey) {
    // Step 1: Analyze intent
    const intent = await analyzeIntent(input, apiKey);
    // Step 2: Generate architecture
    const architecture = await generateArchitecture(intent, apiKey);
    // Step 3: Generate code
    const code = await generateCode(architecture, input, apiKey);
    // Step 4: Build Cursor context
    const context = await buildCursorContext({
        intent,
        architecture,
        code,
        projectName: input.projectName,
        description: input.description,
    }, apiKey);
    return {
        intent,
        architecture,
        code,
        context,
    };
}
