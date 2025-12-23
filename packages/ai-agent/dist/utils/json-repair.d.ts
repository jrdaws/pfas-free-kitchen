/**
 * JSON Repair Utility for AI Output
 *
 * Handles common issues with AI-generated JSON:
 * - Truncated output (unterminated strings, missing brackets)
 * - Extra text before/after JSON
 * - Common syntax errors
 */
export interface RepairResult {
    success: boolean;
    data?: unknown;
    error?: string;
    repaired: boolean;
    repairs: string[];
}
/**
 * Repair metrics for tracking normalization activity
 */
export interface RepairMetrics {
    enumNormalizations: number;
    jsonExtractions: number;
    truncationRepairs: number;
    bracketBalances: number;
}
/**
 * Get current repair metrics
 */
export declare function getRepairMetrics(): RepairMetrics;
/**
 * Reset repair metrics (useful for testing)
 */
export declare function resetRepairMetrics(): void;
/**
 * Attempt to parse and repair malformed JSON from AI output
 *
 * @param text - Raw AI output text
 * @returns Parsed data or error information
 */
export declare function repairAndParseJSON(text: string): RepairResult;
//# sourceMappingURL=json-repair.d.ts.map