import type { LLMRequest, LLMResponse } from "../types.js";
import { type PipelineStage } from "./token-tracker.js";
export interface LLMClientOptions {
    apiKey?: string;
    trackUsage?: boolean;
}
export declare class LLMClient {
    private apiKey?;
    private trackUsage;
    constructor(apiKeyOrOptions?: string | LLMClientOptions);
    /**
     * Complete a request with optional token tracking
     *
     * @param req - LLM request parameters
     * @param stage - Pipeline stage for token tracking (optional)
     */
    complete(req: LLMRequest, stage?: PipelineStage): Promise<LLMResponse>;
}
//# sourceMappingURL=llm-client.d.ts.map