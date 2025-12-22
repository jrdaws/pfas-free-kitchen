import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class PromptLoader {
    constructor(promptsDir) {
        this.cache = new Map();
        // Default to src/prompts relative to this file
        this.promptsDir = promptsDir || join(__dirname, "../prompts");
    }
    async load(name, vars = {}) {
        // Check cache first
        const cacheKey = `${name}-${JSON.stringify(vars)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        // Load file
        const filePath = join(this.promptsDir, `${name}.md`);
        let content = await readFile(filePath, "utf-8");
        // Simple variable substitution: {variable} -> value
        for (const [key, value] of Object.entries(vars)) {
            const regex = new RegExp(`\\{${key}\\}`, "g");
            content = content.replace(regex, value);
        }
        // Cache result
        this.cache.set(cacheKey, content);
        return content;
    }
    clearCache() {
        this.cache.clear();
    }
}
