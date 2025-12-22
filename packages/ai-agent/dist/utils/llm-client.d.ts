import type { LLMRequest, LLMResponse } from "../types";
export declare class LLMClient {
    private apiKey?;
    constructor(apiKey?: string);
    complete(req: LLMRequest): Promise<LLMResponse>;
}
//# sourceMappingURL=llm-client.d.ts.map