import type { ProjectIntent, ProjectArchitecture, GeneratedCode, CursorContext } from "./types";
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
 * @param input - Project context (intent, architecture, code)
 * @param apiKey - Optional Anthropic API key
 * @returns Cursor context files
 */
export declare function buildCursorContext(input: ContextInput, apiKey?: string): Promise<CursorContext>;
//# sourceMappingURL=context-builder.d.ts.map