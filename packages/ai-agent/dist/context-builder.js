import { LLMClient } from "./utils/llm-client.js";
import { PromptLoader } from "./utils/prompt-loader.js";
import { withRetry } from "./utils/retry-strategy.js";
import { handleLLMError } from "./error-handler.js";
// Delimiters for parsing combined response
const CURSORRULES_DELIMITER = "---CURSORRULES---";
const STARTPROMPT_DELIMITER = "---STARTPROMPT---";
/**
 * Build Cursor context files (.cursorrules and START_PROMPT.md)
 *
 * OPTIMIZED: Generates both files in a single API call using delimiter format
 * This reduces API calls from 2 to 1 (~$0.02 savings per generation)
 *
 * @param input - Project context (intent, architecture, code)
 * @param options - Optional API key and model configuration
 * @returns Cursor context files
 */
export async function buildCursorContext(input, options) {
    const opts = typeof options === "string" ? { apiKey: options } : options || {};
    const client = new LLMClient(opts.apiKey);
    const prompts = new PromptLoader();
    // Build architecture summary
    const architectureSummary = buildArchitectureSummary(input.architecture);
    // Build integrations list
    const integrationsList = buildIntegrationsList(input.architecture.integrations);
    // Build features list
    const featuresList = input.intent.features.join(", ");
    const variables = {
        projectName: input.projectName || "MyApp",
        description: input.description || input.intent.reasoning,
        template: input.architecture.template,
        architectureSummary,
        integrations: integrationsList,
        features: featuresList,
        timestamp: new Date().toISOString(),
    };
    // Try consolidated single-call approach first
    const result = await withRetry(async () => {
        try {
            // Load both prompts
            const cursorRulesPrompt = await prompts.load("cursor-rules", variables);
            const startPromptPrompt = await prompts.load("start-prompt", variables);
            // Consolidated system prompt for both files
            const consolidatedPrompt = `You will generate TWO files for this project. Output them using the exact delimiter format specified.

=== FILE 1: .cursorrules ===
${cursorRulesPrompt}

=== FILE 2: START_PROMPT.md ===
${startPromptPrompt}

=== OUTPUT FORMAT (CRITICAL) ===
You MUST output both files using this exact delimiter format:

${CURSORRULES_DELIMITER}
[.cursorrules content here]
${STARTPROMPT_DELIMITER}
[START_PROMPT.md content here]

Do NOT include any other text before ${CURSORRULES_DELIMITER} or after the START_PROMPT.md content.`;
            // Use configured model (default to Haiku for cost efficiency)
            // Haiku max output is 4096 tokens - sufficient for context files
            const model = opts.model || "claude-3-haiku-20240307";
            const isHaiku = model.includes("haiku");
            const maxTokens = isHaiku ? 4096 : 8192;
            const response = await client.complete({
                model,
                temperature: 0.3, // Slightly creative for documentation
                maxTokens,
                messages: [
                    {
                        role: "user",
                        content: "Generate both the .cursorrules and START_PROMPT.md files using the specified delimiter format.",
                    },
                ],
                system: consolidatedPrompt,
                stream: opts.stream,
                onStream: opts.onStream,
            }, "context" // Track as context stage
            );
            // Parse the combined response
            const parsed = parseConsolidatedResponse(response.text);
            if (parsed) {
                return parsed;
            }
            // If parsing failed, throw to trigger fallback
            throw new Error("Failed to parse consolidated response - will retry with fallback");
        }
        catch (error) {
            throw handleLLMError(error);
        }
    });
    return result;
}
/**
 * Parse the consolidated response into separate files
 */
function parseConsolidatedResponse(text) {
    try {
        const cursorrulesStart = text.indexOf(CURSORRULES_DELIMITER);
        const startPromptStart = text.indexOf(STARTPROMPT_DELIMITER);
        if (cursorrulesStart === -1 || startPromptStart === -1) {
            console.warn("[ContextBuilder] Delimiter parsing failed - delimiters not found");
            return null;
        }
        // Extract .cursorrules content (between first delimiter and second delimiter)
        const cursorrules = text
            .substring(cursorrulesStart + CURSORRULES_DELIMITER.length, startPromptStart)
            .trim();
        // Extract START_PROMPT.md content (after second delimiter)
        const startPrompt = text
            .substring(startPromptStart + STARTPROMPT_DELIMITER.length)
            .trim();
        // Validate we got meaningful content
        if (cursorrules.length < 100 || startPrompt.length < 100) {
            console.warn("[ContextBuilder] Parsed content too short - may be incomplete");
            return null;
        }
        return {
            cursorrules,
            startPrompt,
        };
    }
    catch (error) {
        console.warn("[ContextBuilder] Parse error:", error.message);
        return null;
    }
}
/**
 * Build a human-readable summary of the architecture
 */
function buildArchitectureSummary(architecture) {
    const parts = [];
    // Pages
    parts.push("**Pages:**");
    architecture.pages.forEach((page) => {
        parts.push(`- ${page.path}: ${page.description}`);
    });
    // Components
    const customComponents = architecture.components.filter((c) => c.template === "create-new");
    if (customComponents.length > 0) {
        parts.push("\n**Custom Components:**");
        customComponents.forEach((comp) => {
            parts.push(`- ${comp.name}: ${comp.description}`);
        });
    }
    // API Routes
    if (architecture.routes.length > 0) {
        parts.push("\n**API Routes:**");
        architecture.routes.forEach((route) => {
            parts.push(`- ${route.method || "GET"} ${route.path}: ${route.description}`);
        });
    }
    return parts.join("\n");
}
/**
 * Build a list of active integrations
 */
function buildIntegrationsList(integrations) {
    const active = Object.entries(integrations)
        .filter(([_, value]) => value)
        .map(([type, provider]) => `- **${type}**: ${provider}`)
        .join("\n");
    return active || "- No external integrations configured";
}
