export declare class PromptLoader {
    private promptsDir;
    private cache;
    constructor(promptsDir?: string);
    load(name: string, vars?: Record<string, string>): Promise<string>;
    clearCache(): void;
}
//# sourceMappingURL=prompt-loader.d.ts.map