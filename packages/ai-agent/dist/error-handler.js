import Anthropic from "@anthropic-ai/sdk";
export class AIAgentError extends Error {
    constructor(code, message, retryable = false, context) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.context = context;
        this.name = "AIAgentError";
    }
}
export function handleLLMError(error) {
    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
        const status = error.status || 500;
        const retryable = status === 429 || (status >= 500 && status < 600);
        let message = "API Error";
        let code = `anthropic_${error.status}`;
        switch (status) {
            case 401:
                message = "Invalid API key. Please check your ANTHROPIC_API_KEY.";
                break;
            case 429:
                message = "Rate limit exceeded. Please try again in a few moments.";
                break;
            case 400:
                message = "Invalid request to Claude API.";
                break;
            case 500:
            case 503:
                message = "Claude API is temporarily unavailable.";
                break;
            default:
                message = `API Error: ${error.message}`;
        }
        return new AIAgentError(code, message, retryable, { status, originalMessage: error.message });
    }
    // Handle generic errors
    if (error instanceof Error) {
        return new AIAgentError("unknown_error", `Unexpected error: ${error.message}`, false, { error: error.message, stack: error.stack });
    }
    return new AIAgentError("unknown_error", "An unexpected error occurred", false, { error: String(error) });
}
export function handleValidationError(error) {
    const errorMessages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return new AIAgentError("validation_error", `Invalid AI output: ${errorMessages}`, true, // Retryable - AI might generate valid output on retry
    { errors: error.issues });
}
export function isRetryableError(error) {
    if (error instanceof AIAgentError) {
        return error.retryable;
    }
    return false;
}
