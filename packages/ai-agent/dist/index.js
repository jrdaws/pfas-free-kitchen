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
// Export token tracking utilities
export { TokenTracker, getGlobalTracker, resetGlobalTracker } from "./utils/token-tracker.js";
// Convenience function for full pipeline
import { analyzeIntent } from "./intent-analyzer.js";
import { generateArchitecture } from "./architecture-generator.js";
import { generateCode } from "./code-generator.js";
import { buildCursorContext } from "./context-builder.js";
import { getGlobalTracker, resetGlobalTracker } from "./utils/token-tracker.js";
export async function generateProject(input, apiKeyOrOptions) {
    // Parse options
    const options = typeof apiKeyOrOptions === "string"
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
    const context = await buildCursorContext({
        intent,
        architecture,
        code,
        projectName: input.projectName,
        description: input.description,
    }, apiKey);
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
