import { readFile } from "fs/promises";
import { join } from "path";
import { LLMClient } from "./utils/llm-client.js";
import { PromptLoader } from "./utils/prompt-loader.js";
import { withRetry } from "./utils/retry-strategy.js";
import { handleLLMError, handleValidationError } from "./error-handler.js";
import { CodeSchema } from "./validators/code-schema.js";
import { repairAndParseJSON } from "./utils/json-repair.js";
/**
 * Generate code files from project architecture
 *
 * @param architecture - Project architecture definition
 * @param input - Original project input (for context)
 * @param options - Optional API key and model configuration
 * @returns Generated code files
 */
export async function generateCode(architecture, input, options) {
    const opts = typeof options === "string" ? { apiKey: options } : options || {};
    const client = new LLMClient(opts.apiKey);
    const prompts = new PromptLoader();
    return withRetry(async () => {
        try {
            // Load template reference file to show AI the style
            const templateReference = await loadTemplateReference(architecture.template);
            // Prepare prompt variables
            const systemPrompt = await prompts.load("code-generation", {
                architecture: JSON.stringify(architecture, null, 2),
                projectName: input?.projectName || "MyApp",
                templateReference,
            });
            // Use configured model (default to Sonnet for code quality)
            // Haiku max output is 4096, Sonnet 4 supports up to 64K
            // Use model-appropriate limits to prevent API errors
            // Code generation needs high limits for multi-file JSON output
            const model = opts.model || "claude-sonnet-4-20250514";
            const isHaiku = model.includes("haiku");
            const maxTokens = isHaiku ? 4096 : 32000;
            const response = await client.complete({
                model,
                temperature: 0, // Deterministic
                maxTokens,
                messages: [
                    {
                        role: "user",
                        content: "Generate the code files based on the architecture definition.",
                    },
                ],
                system: systemPrompt,
                stream: opts.stream,
                onStream: opts.onStream,
            }, "code" // Track as code stage
            );
            // Extract and parse JSON with repair fallback
            const repairResult = repairAndParseJSON(response.text);
            if (!repairResult.success) {
                throw new Error(`Failed to parse AI response: ${repairResult.error}. Response: ${response.text.substring(0, 500)}`);
            }
            if (repairResult.repaired) {
                console.log(`[CodeGenerator] JSON repaired: ${repairResult.repairs.join(", ")}`);
            }
            // Validate with Zod
            const validated = CodeSchema.parse(repairResult.data);
            return validated;
        }
        catch (error) {
            if (error instanceof Error && error.name === "ZodError") {
                throw handleValidationError(error);
            }
            throw handleLLMError(error);
        }
    });
}
/**
 * Load a reference file from the template to show AI the code style
 */
async function loadTemplateReference(templateId) {
    try {
        const templatesDir = join(process.cwd(), "templates");
        const pagePath = join(templatesDir, templateId, "app", "page.tsx");
        const content = await readFile(pagePath, "utf-8");
        return `Example page from ${templateId} template:\n\n${content}`;
    }
    catch (error) {
        console.warn(`[CodeGenerator] Could not load template reference: ${error.message}`);
        return "// Template reference not available";
    }
}
