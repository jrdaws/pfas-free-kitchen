/**
 * AI Context Memory System
 * 
 * Maintains coherent context across AI generations.
 * 
 * Usage:
 * 
 * 1. Create a context when starting a configurator session:
 *    const context = createContext(projectId, userId);
 * 
 * 2. Update understanding as user progresses:
 *    updateContext(contextId, { understanding: { ... } });
 * 
 * 3. Record AI interactions:
 *    recordInteraction(contextId, 'preview', input, output);
 * 
 * 4. Learn from corrections:
 *    learnCorrection(contextId, 'projectName', 'Old', 'New', 'user edited');
 * 
 * 5. Build context-aware prompts:
 *    const prompt = buildContextAwarePrompt({ context, taskType: 'preview' });
 */

export * from "./types";
export * from "./store";
export * from "./prompt-builder";

