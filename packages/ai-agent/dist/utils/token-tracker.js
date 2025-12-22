/**
 * Token Usage Tracking for AI Generation Cost Optimization
 *
 * Tracks token consumption across all pipeline stages to:
 * - Provide visibility into actual API costs
 * - Enable cost optimization decisions
 * - Log usage summaries for monitoring
 *
 * Pricing (as of 2024):
 * - Claude Sonnet 4: $3/1M input, $15/1M output
 * - Claude Haiku: $0.25/1M input, $1.25/1M output
 */
// Model pricing per 1M tokens (USD)
const MODEL_PRICING = {
    "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
    "claude-3-sonnet-20240229": { input: 3.0, output: 15.0 },
    "claude-3-haiku-20240307": { input: 0.25, output: 1.25 },
    "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
    // Default fallback
    default: { input: 3.0, output: 15.0 },
};
/**
 * Token usage tracker for a single generation session
 */
export class TokenTracker {
    constructor(sessionId) {
        this.usage = [];
        this.sessionId = sessionId || `session-${Date.now()}`;
        this.startTime = new Date();
    }
    /**
     * Record token usage for a pipeline stage
     */
    record(usage) {
        this.usage.push(usage);
    }
    /**
     * Get total token usage and estimated cost for the session
     */
    getSessionTotal() {
        const byStage = {
            intent: { input: 0, output: 0, cost: 0 },
            architecture: { input: 0, output: 0, cost: 0 },
            code: { input: 0, output: 0, cost: 0 },
            context: { input: 0, output: 0, cost: 0 },
        };
        let totalInput = 0;
        let totalOutput = 0;
        let totalCost = 0;
        for (const u of this.usage) {
            const pricing = MODEL_PRICING[u.model] || MODEL_PRICING.default;
            const inputCost = (u.inputTokens / 1000000) * pricing.input;
            const outputCost = (u.outputTokens / 1000000) * pricing.output;
            const stageCost = inputCost + outputCost;
            totalInput += u.inputTokens;
            totalOutput += u.outputTokens;
            totalCost += stageCost;
            byStage[u.stage].input += u.inputTokens;
            byStage[u.stage].output += u.outputTokens;
            byStage[u.stage].cost += stageCost;
        }
        return {
            input: totalInput,
            output: totalOutput,
            estimatedCost: Math.round(totalCost * 10000) / 10000, // 4 decimal places
            byStage,
        };
    }
    /**
     * Get usage for a specific stage
     */
    getStageUsage(stage) {
        return this.usage.filter((u) => u.stage === stage);
    }
    /**
     * Export metrics as formatted string for logging
     */
    exportMetrics() {
        const summary = this.getSessionTotal();
        const lines = [
            "[AI Agent] Generation complete:",
        ];
        // Add each stage with model info
        const stageOrder = ["intent", "architecture", "code", "context"];
        for (const stage of stageOrder) {
            const stageUsage = this.usage.filter((u) => u.stage === stage);
            if (stageUsage.length === 0)
                continue;
            const model = stageUsage[0].model;
            const modelShort = model.includes("haiku") ? "Haiku" : "Sonnet";
            const { input, output } = summary.byStage[stage];
            lines.push(`  ${stage.charAt(0).toUpperCase() + stage.slice(1).padEnd(12)}: ${input.toString().padStart(4)} in / ${output.toString().padStart(4)} out (${modelShort})`);
        }
        // Add totals
        lines.push(`  ${"─".repeat(40)}`, `  Total: ${summary.input} in / ${summary.output} out | Est. cost: $${summary.estimatedCost.toFixed(2)}`);
        return lines.join("\n");
    }
    /**
     * Export as JSON for structured logging
     */
    exportJSON() {
        return JSON.stringify({
            sessionId: this.sessionId,
            startTime: this.startTime.toISOString(),
            endTime: new Date().toISOString(),
            summary: this.getSessionTotal(),
            usage: this.usage,
        }, null, 2);
    }
    /**
     * Reset the tracker for a new session
     */
    reset() {
        this.usage = [];
        this.startTime = new Date();
    }
}
// Singleton instance for global tracking
let _globalTracker = null;
/**
 * Get the global token tracker instance
 */
export function getGlobalTracker() {
    if (!_globalTracker) {
        _globalTracker = new TokenTracker("global");
    }
    return _globalTracker;
}
/**
 * Reset the global tracker (for new generation sessions)
 */
export function resetGlobalTracker() {
    if (_globalTracker) {
        _globalTracker.reset();
    }
}
