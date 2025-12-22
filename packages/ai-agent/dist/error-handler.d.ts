import { type ZodError } from "zod";
export declare class AIAgentError extends Error {
    code: string;
    retryable: boolean;
    context?: Record<string, unknown> | undefined;
    constructor(code: string, message: string, retryable?: boolean, context?: Record<string, unknown> | undefined);
}
export declare function handleLLMError(error: unknown): AIAgentError;
export declare function handleValidationError(error: ZodError<any>): AIAgentError;
export declare function isRetryableError(error: unknown): boolean;
//# sourceMappingURL=error-handler.d.ts.map