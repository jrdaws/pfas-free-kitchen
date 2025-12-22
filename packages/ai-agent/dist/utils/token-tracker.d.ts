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
export type PipelineStage = "intent" | "architecture" | "code" | "context";
export interface TokenUsage {
    stage: PipelineStage;
    inputTokens: number;
    outputTokens: number;
    model: string;
    timestamp: Date;
    cached: boolean;
    durationMs?: number;
}
export interface TokenSummary {
    input: number;
    output: number;
    estimatedCost: number;
    byStage: Record<PipelineStage, {
        input: number;
        output: number;
        cost: number;
    }>;
}
/**
 * Token usage tracker for a single generation session
 */
export declare class TokenTracker {
    private usage;
    private sessionId;
    private startTime;
    constructor(sessionId?: string);
    /**
     * Record token usage for a pipeline stage
     */
    record(usage: TokenUsage): void;
    /**
     * Get total token usage and estimated cost for the session
     */
    getSessionTotal(): TokenSummary;
    /**
     * Get usage for a specific stage
     */
    getStageUsage(stage: PipelineStage): TokenUsage[];
    /**
     * Export metrics as formatted string for logging
     */
    exportMetrics(): string;
    /**
     * Export as JSON for structured logging
     */
    exportJSON(): string;
    /**
     * Reset the tracker for a new session
     */
    reset(): void;
}
/**
 * Get the global token tracker instance
 */
export declare function getGlobalTracker(): TokenTracker;
/**
 * Reset the global tracker (for new generation sessions)
 */
export declare function resetGlobalTracker(): void;
//# sourceMappingURL=token-tracker.d.ts.map