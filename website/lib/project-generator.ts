/**
 * Client-side wrapper for AI project generation
 * Includes streaming support with auto-retry for dropped connections
 */

export type ModelTier = 'fast' | 'balanced' | 'quality';

export interface ProjectGenerationParams {
  description: string;
  projectName?: string;
  template?: string;
  vision?: string;
  mission?: string;
  inspirations?: Array<{ type: string; value: string; preview?: string }>;
  userApiKey?: string;
  sessionId: string;
  seed?: number;
  modelTier?: ModelTier;
  stream?: boolean;
}

// Progress event from streaming API
export interface StreamProgressEvent {
  type: 'progress';
  stage: 'intent' | 'architecture' | 'code' | 'context';
  eventType: 'start' | 'chunk' | 'complete';
  message?: string;
}

// Callback for streaming progress updates
export type StreamProgressCallback = (event: StreamProgressEvent) => void;

// Streaming options with retry configuration
export interface StreamOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_STREAM_OPTIONS: StreamOptions = {
  maxRetries: 2,
  retryDelayMs: 1000,
};

export interface ProjectGenerationResult {
  success: boolean;
  intent: {
    category: string;
    confidence: number;
    reasoning: string;
    suggestedTemplate: string;
    features: string[];
    integrations: Record<string, string | null>;
    complexity: string;
    keyEntities: string[];
  };
  architecture: {
    template: string;
    pages: Array<{
      path: string;
      name: string;
      description: string;
      components: string[];
      layout?: string;
    }>;
    components: Array<{
      name: string;
      type: string;
      description: string;
      props?: Record<string, string>;
      template: string;
    }>;
    routes: Array<{
      path: string;
      type: string;
      method?: string;
      description: string;
    }>;
    integrations: Record<string, string | null>;
  };
  files: Array<{
    path: string;
    content: string;
    overwrite: boolean;
  }>;
  integrationCode: Array<{
    integration: string;
    files: Array<{
      path: string;
      content: string;
      overwrite: boolean;
    }>;
  }>;
  cursorrules: string;
  startPrompt: string;
  generatedAt: string;
  seed: number;
  cached?: boolean;
  remainingDemoGenerations?: number | null;
  redisEnabled?: boolean;
}

export interface ProjectGenerationError {
  success: false;
  error: string;
  message: string;
  retryable?: boolean;
  rateLimited?: boolean;
  resetAt?: number;
  remaining?: number;
  details?: string;
}

/**
 * Generate a complete project from a description
 * 
 * @param params - Generation parameters
 * @param onProgress - Optional callback for streaming progress updates
 * @param streamOptions - Optional retry configuration for streaming
 */
export async function generateProject(
  params: ProjectGenerationParams,
  onProgress?: StreamProgressCallback,
  streamOptions?: StreamOptions
): Promise<ProjectGenerationResult | ProjectGenerationError> {
  // Use streaming if callback is provided
  const enableStreaming = !!onProgress;
  const options = { ...DEFAULT_STREAM_OPTIONS, ...streamOptions };
  
  // Retry wrapper for streaming requests
  const attemptGeneration = async (
    attempt: number
  ): Promise<ProjectGenerationResult | ProjectGenerationError> => {
    try {
      const response = await fetch("/api/generate/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...params, stream: enableStreaming }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorResult: ProjectGenerationError = {
          success: false,
          error: data.error || "generation_failed",
          message: data.message || "Failed to generate project",
          retryable: data.retryable,
          rateLimited: data.rateLimited,
          resetAt: data.resetAt,
          remaining: data.remaining,
          details: data.details,
        };

        // Don't retry rate-limited or non-retryable errors
        if (errorResult.rateLimited || errorResult.retryable === false) {
          return errorResult;
        }

        // Try to retry if we have attempts left
        if (attempt < (options.maxRetries || 0)) {
          options.onRetry?.(attempt + 1, new Error(errorResult.message));
          await sleep(options.retryDelayMs || 1000);
          return attemptGeneration(attempt + 1);
        }

        return errorResult;
      }

      // Handle streaming response
      if (enableStreaming && response.body) {
        return await processStreamingResponse(
          response.body,
          onProgress,
          attempt,
          options
        );
      }

      // Non-streaming: parse JSON response directly
      const data = await response.json();
      return data;
    } catch (error) {
      const networkError: ProjectGenerationError = {
        success: false,
        error: "network_error",
        message:
          error instanceof Error ? error.message : "Network error occurred",
        retryable: true,
      };

      // Retry network errors
      if (attempt < (options.maxRetries || 0)) {
        options.onRetry?.(attempt + 1, error instanceof Error ? error : new Error(String(error)));
        await sleep(options.retryDelayMs || 1000);
        return attemptGeneration(attempt + 1);
      }

      return networkError;
    }
  };

  return attemptGeneration(0);
}

/**
 * Process a streaming SSE response with error recovery
 */
async function processStreamingResponse(
  body: ReadableStream<Uint8Array>,
  onProgress: StreamProgressCallback,
  attempt: number,
  options: StreamOptions
): Promise<ProjectGenerationResult | ProjectGenerationError> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: ProjectGenerationResult | null = null;
  let errorResult: ProjectGenerationError | null = null;
  let lastEventTime = Date.now();
  const STREAM_TIMEOUT_MS = 120000; // 2 minutes timeout for long operations

  try {
    while (true) {
      // Check for stream timeout (connection dropped without closing)
      if (Date.now() - lastEventTime > STREAM_TIMEOUT_MS) {
        throw new Error('Stream timeout - no data received for 2 minutes');
      }

      const { done, value } = await reader.read();
      if (done) break;

      lastEventTime = Date.now();
      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.slice(6));

            if (eventData.type === 'progress') {
              onProgress({
                type: 'progress',
                stage: eventData.stage,
                eventType: eventData.eventType,
                message: eventData.message,
              });
            } else if (eventData.type === 'complete') {
              result = eventData.result;
            } else if (eventData.type === 'error') {
              errorResult = {
                success: false,
                error: eventData.error,
                message: eventData.message,
                retryable: eventData.retryable,
              };
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError);
          }
        }
      }
    }
  } catch (streamError) {
    // Stream was interrupted - return retryable error
    console.error('Stream interrupted:', streamError);
    return {
      success: false,
      error: "stream_interrupted",
      message: streamError instanceof Error 
        ? `Connection interrupted: ${streamError.message}` 
        : "Stream connection was interrupted",
      retryable: true,
    };
  } finally {
    reader.releaseLock();
  }

  // Return the final result or error
  if (errorResult) {
    return errorResult;
  }
  if (result) {
    return result;
  }

  return {
    success: false,
    error: "stream_ended",
    message: "Stream ended without result",
    retryable: true,
  };
}

/**
 * Helper function to sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
