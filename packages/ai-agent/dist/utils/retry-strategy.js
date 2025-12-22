import { isRetryableError } from "../error-handler.js";
export async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            // Don't retry if error is not retryable
            if (!isRetryableError(error)) {
                throw error;
            }
            // Don't delay after last attempt
            if (attempt < maxRetries - 1) {
                const delay = delayMs * Math.pow(2, attempt); // Exponential backoff
                console.log(`[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    // All retries failed
    throw lastError;
}
