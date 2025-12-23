/**
 * Token Usage Tracking for AI Generation Cost Optimization
 *
 * Tracks token consumption across all pipeline stages to:
 * - Provide visibility into actual API costs
 * - Enable cost optimization decisions
 * - Log usage summaries for monitoring
 * - Track JSON repair activity for Haiku reliability
 *
 * Pricing (as of 2024):
 * - Claude Sonnet 4: $3/1M input, $15/1M output
 * - Claude Haiku: $0.25/1M input, $1.25/1M output
 */

import { getRepairMetrics, resetRepairMetrics, type RepairMetrics } from "./json-repair.js";

export type PipelineStage = "intent" | "architecture" | "code" | "context";

// Re-export RepairMetrics for external use
export type { RepairMetrics };

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
  byStage: Record<PipelineStage, { input: number; output: number; cost: number }>;
  repairs: RepairMetrics;
}

// Model pricing per 1M tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
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
  private usage: TokenUsage[] = [];
  private sessionId: string;
  private startTime: Date;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || `session-${Date.now()}`;
    this.startTime = new Date();
  }

  /**
   * Record token usage for a pipeline stage
   */
  record(usage: TokenUsage): void {
    this.usage.push(usage);
  }

  /**
   * Get total token usage and estimated cost for the session
   */
  getSessionTotal(): TokenSummary {
    const byStage: Record<PipelineStage, { input: number; output: number; cost: number }> = {
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
      const inputCost = (u.inputTokens / 1_000_000) * pricing.input;
      const outputCost = (u.outputTokens / 1_000_000) * pricing.output;
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
      repairs: getRepairMetrics(),
    };
  }

  /**
   * Get usage for a specific stage
   */
  getStageUsage(stage: PipelineStage): TokenUsage[] {
    return this.usage.filter((u) => u.stage === stage);
  }

  /**
   * Export metrics as formatted string for logging
   */
  exportMetrics(): string {
    const summary = this.getSessionTotal();
    const lines: string[] = [
      "[AI Agent] Generation complete:",
    ];

    // Add each stage with model info
    const stageOrder: PipelineStage[] = ["intent", "architecture", "code", "context"];
    for (const stage of stageOrder) {
      const stageUsage = this.usage.filter((u) => u.stage === stage);
      if (stageUsage.length === 0) continue;

      const model = stageUsage[0].model;
      const modelShort = model.includes("haiku") ? "Haiku" : "Sonnet";
      const { input, output } = summary.byStage[stage];

      lines.push(
        `  ${stage.charAt(0).toUpperCase() + stage.slice(1).padEnd(12)}: ${input.toString().padStart(4)} in / ${output.toString().padStart(4)} out (${modelShort})`
      );
    }

    // Add totals
    lines.push(
      `  ${"─".repeat(40)}`,
      `  Total: ${summary.input} in / ${summary.output} out | Est. cost: $${summary.estimatedCost.toFixed(2)}`
    );

    // Add repair metrics if any repairs were made
    const repairs = summary.repairs;
    const totalRepairs = repairs.enumNormalizations + repairs.jsonExtractions + repairs.truncationRepairs + repairs.bracketBalances;
    if (totalRepairs > 0) {
      lines.push(
        `  Repairs: ${repairs.enumNormalizations} enum, ${repairs.jsonExtractions} extract, ${repairs.truncationRepairs} truncation, ${repairs.bracketBalances} brackets`
      );
    }

    return lines.join("\n");
  }

  /**
   * Export as JSON for structured logging
   */
  exportJSON(): string {
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
  reset(): void {
    this.usage = [];
    this.startTime = new Date();
    resetRepairMetrics();
  }

  /**
   * Get current repair metrics
   */
  getRepairMetrics(): RepairMetrics {
    return getRepairMetrics();
  }
}

// Singleton instance for global tracking
let _globalTracker: TokenTracker | null = null;

/**
 * Get the global token tracker instance
 */
export function getGlobalTracker(): TokenTracker {
  if (!_globalTracker) {
    _globalTracker = new TokenTracker("global");
  }
  return _globalTracker;
}

/**
 * Reset the global tracker (for new generation sessions)
 */
export function resetGlobalTracker(): void {
  if (_globalTracker) {
    _globalTracker.reset();
  }
}

