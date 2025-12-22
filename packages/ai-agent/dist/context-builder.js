import { LLMClient } from "./utils/llm-client.js";
import { PromptLoader } from "./utils/prompt-loader.js";
import { withRetry } from "./utils/retry-strategy.js";
import { handleLLMError } from "./error-handler.js";
/**
 * Build Cursor context files (.cursorrules and START_PROMPT.md)
 *
 * @param input - Project context (intent, architecture, code)
 * @param apiKey - Optional Anthropic API key
 * @returns Cursor context files
 */
export async function buildCursorContext(input, apiKey) {
    const client = new LLMClient(apiKey);
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
    // Generate .cursorrules
    const cursorrules = await withRetry(async () => {
        try {
            const systemPrompt = await prompts.load("cursor-rules", variables);
            const response = await client.complete({
                model: "claude-sonnet-4-20250514",
                temperature: 0.3, // Slightly creative for documentation
                maxTokens: 4096,
                messages: [
                    {
                        role: "user",
                        content: "Generate the .cursorrules file content.",
                    },
                ],
                system: systemPrompt,
            });
            return response.text.trim();
        }
        catch (error) {
            throw handleLLMError(error);
        }
    });
    // Generate START_PROMPT.md
    const startPrompt = await withRetry(async () => {
        try {
            const systemPrompt = await prompts.load("start-prompt", variables);
            const response = await client.complete({
                model: "claude-sonnet-4-20250514",
                temperature: 0.3, // Slightly creative for documentation
                maxTokens: 4096,
                messages: [
                    {
                        role: "user",
                        content: "Generate the START_PROMPT.md file content.",
                    },
                ],
                system: systemPrompt,
            });
            return response.text.trim();
        }
        catch (error) {
            throw handleLLMError(error);
        }
    });
    return {
        cursorrules,
        startPrompt,
    };
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
