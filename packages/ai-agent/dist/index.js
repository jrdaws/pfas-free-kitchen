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
/**
 * Model configuration for each tier
 *
 * Haiku: $0.25/1M input, $1.25/1M output (fast, cheap, less reliable for schemas)
 * Sonnet: $3.00/1M input, $15.00/1M output (slower, expensive, reliable)
 */
export const MODEL_TIERS = {
    // Fast: Haiku everywhere (cheapest, uses JSON repair for reliability)
    fast: {
        intent: "claude-3-haiku-20240307",
        architecture: "claude-3-haiku-20240307",
        code: "claude-3-haiku-20240307",
        context: "claude-3-haiku-20240307",
    },
    // Balanced: Haiku for simple tasks, Sonnet for complex (default)
    balanced: {
        intent: "claude-3-haiku-20240307",
        architecture: "claude-3-haiku-20240307",
        code: "claude-sonnet-4-20250514", // Code generation needs Sonnet for quality
        context: "claude-3-haiku-20240307",
    },
    // Quality: Sonnet everywhere (most reliable, highest cost)
    quality: {
        intent: "claude-sonnet-4-20250514",
        architecture: "claude-sonnet-4-20250514",
        code: "claude-sonnet-4-20250514",
        context: "claude-sonnet-4-20250514",
    },
};
/** Default model tier - balanced for cost/quality tradeoff */
export const DEFAULT_MODEL_TIER = "balanced";
export async function generateProject(input, apiKeyOrOptions) {
    // Parse options
    const options = typeof apiKeyOrOptions === "string"
        ? { apiKey: apiKeyOrOptions, logTokenUsage: true }
        : { logTokenUsage: true, ...apiKeyOrOptions };
    const { apiKey, logTokenUsage, stream, onProgress } = options;
    const tier = options.modelTier || DEFAULT_MODEL_TIER;
    const models = MODEL_TIERS[tier];
    // Helper to emit progress events
    const emit = (stage, type, data) => {
        if (onProgress) {
            onProgress({ stage, type, ...data });
        }
    };
    // Reset token tracker for new generation
    resetGlobalTracker();
    // Step 1: Analyze intent
    emit('intent', 'start', { message: 'Analyzing project intent...' });
    const intent = await analyzeIntent(input, {
        apiKey,
        model: models.intent,
        stream,
        onStream: stream ? (chunk, accumulated) => emit('intent', 'chunk', { chunk, accumulated }) : undefined,
    });
    emit('intent', 'complete', { message: 'Intent analysis complete' });
    // Step 2: Generate architecture
    emit('architecture', 'start', { message: 'Designing architecture...' });
    const architecture = await generateArchitecture(intent, {
        apiKey,
        model: models.architecture,
        stream,
        onStream: stream ? (chunk, accumulated) => emit('architecture', 'chunk', { chunk, accumulated }) : undefined,
    });
    emit('architecture', 'complete', { message: 'Architecture design complete' });
    // Steps 3 & 4: Generate code and context in PARALLEL
    // Context builder doesn't use code output - it only uses intent/architecture
    // Running in parallel saves ~10 seconds (context finishes while code generates)
    const [code, context] = await Promise.all([
        // Code generation
        (async () => {
            emit('code', 'start', { message: 'Generating code files...' });
            const result = await generateCode(architecture, input, {
                apiKey,
                model: models.code,
                stream,
                onStream: stream ? (chunk, accumulated) => emit('code', 'chunk', { chunk, accumulated }) : undefined,
            });
            emit('code', 'complete', { message: 'Code generation complete' });
            return result;
        })(),
        // Context building (runs in parallel with code generation)
        (async () => {
            emit('context', 'start', { message: 'Building Cursor context...' });
            const result = await buildCursorContext({
                intent,
                architecture,
                // Empty code - context builder doesn't use it (verified in context-builder.ts)
                code: { files: [], integrationCode: [] },
                projectName: input.projectName,
                description: input.description,
            }, {
                apiKey,
                model: models.context,
                stream,
                onStream: stream ? (chunk, accumulated) => emit('context', 'chunk', { chunk, accumulated }) : undefined,
            });
            emit('context', 'complete', { message: 'Cursor context complete' });
            return result;
        })(),
    ]);
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
