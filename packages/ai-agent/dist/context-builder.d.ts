import type { ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext } from "./types.js";
export interface ContextInput {
    intent: ProjectIntent;
    architecture: ProjectArchitecture;
    code: GeneratedCode;
    projectName?: string;
    description?: string;
}
/**
 * Build Cursor context files (.cursorrules and START_PROMPT.md)
 *
 * OPTIMIZED: Generates both files in a single API call using delimiter format
 * This reduces API calls from 2 to 1 (~$0.02 savings per generation)
 *
 * @param input - Project context (intent, architecture, code)
 * @param apiKey - Optional Anthropic API key
 * @returns Cursor context files
 */
export declare function buildCursorContext(input: ContextInput, apiKey?: string): Promise<CursorContext>;
//# sourceMappingURL=context-builder.d.ts.map