/**
 * API Wrapper with Service Limit Detection
 * 
 * Wraps external service calls to automatically detect and handle:
 * - Rate limits (429)
 * - Billing/credits issues (402)
 * - Auth/API key issues (401)
 * - Service unavailability (503)
 * 
 * Usage:
 *   const result = await withServiceLimits("anthropic", async () => {
 *     return await claude.messages.create({...});
 *   });
 */

import { NextResponse } from "next/server";
import { 
  detectServiceLimit, 
  getServiceLimitMessage, 
  type ServiceCode,
  type ServiceLimitError 
} from "./service-limits";

/**
 * Result of a wrapped service call
 */
export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceLimitError; response: NextResponse };

/**
 * Wrap an external service call with automatic limit detection
 */
export async function withServiceLimits<T>(
  service: ServiceCode,
  fn: () => Promise<T>
): Promise<ServiceResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const limitError = detectServiceLimit(error, service);
    
    if (limitError) {
      const message = getServiceLimitMessage(limitError);
      console.error(`[${service}] Service limit: ${limitError.code}`, limitError.message);
      
      const statusMap: Record<string, number> = {
        RATE_LIMITED: 429,
        CREDITS_EXHAUSTED: 402,
        QUOTA_EXCEEDED: 402,
        INVALID_API_KEY: 401,
        SERVICE_UNAVAILABLE: 503,
        FREE_TIER_LIMIT: 402,
      };
      
      return {
        success: false,
        error: limitError,
        response: NextResponse.json(
          {
            success: false,
            error: message.description,
            code: limitError.code,
            service: service,
            action: limitError.action,
            upgradeUrl: limitError.upgradeUrl,
            retryAfter: limitError.retryAfter,
          },
          { 
            status: statusMap[limitError.code] || 500,
            headers: limitError.retryAfter 
              ? { "Retry-After": String(limitError.retryAfter) }
              : undefined,
          }
        ),
      };
    }
    
    // Re-throw if not a service limit error
    throw error;
  }
}

/**
 * Create a wrapped Anthropic client call
 */
export async function callAnthropic<T>(
  fn: () => Promise<T>
): Promise<ServiceResult<T>> {
  return withServiceLimits("anthropic", fn);
}

/**
 * Create a wrapped Replicate client call
 */
export async function callReplicate<T>(
  fn: () => Promise<T>
): Promise<ServiceResult<T>> {
  return withServiceLimits("replicate", fn);
}

/**
 * Create a wrapped Supabase client call
 */
export async function callSupabase<T>(
  fn: () => Promise<T>
): Promise<ServiceResult<T>> {
  return withServiceLimits("supabase", fn);
}

/**
 * Create a wrapped OpenAI client call
 */
export async function callOpenAI<T>(
  fn: () => Promise<T>
): Promise<ServiceResult<T>> {
  return withServiceLimits("openai", fn);
}

/**
 * Helper to check if a result is a service limit error
 */
export function isServiceLimitError<T>(
  result: ServiceResult<T>
): result is { success: false; error: ServiceLimitError; response: NextResponse } {
  return !result.success;
}

/**
 * Middleware-style error handler for API routes
 * Use this in catch blocks to automatically detect service limits
 */
export function handleApiError(
  error: unknown,
  service?: ServiceCode
): NextResponse {
  // If we know the service, try to detect specific limit errors
  if (service) {
    const limitError = detectServiceLimit(error, service);
    if (limitError) {
      const message = getServiceLimitMessage(limitError);
      return NextResponse.json(
        {
          success: false,
          error: message.description,
          code: limitError.code,
          service,
          action: limitError.action,
          upgradeUrl: limitError.upgradeUrl,
        },
        { status: getStatusForCode(limitError.code) }
      );
    }
  }
  
  // Generic error response
  const errorMessage = error instanceof Error ? error.message : "An error occurred";
  console.error("[API Error]", error);
  
  return NextResponse.json(
    { success: false, error: errorMessage },
    { status: 500 }
  );
}

function getStatusForCode(code: string): number {
  switch (code) {
    case "RATE_LIMITED": return 429;
    case "CREDITS_EXHAUSTED": 
    case "QUOTA_EXCEEDED":
    case "FREE_TIER_LIMIT": return 402;
    case "INVALID_API_KEY": return 401;
    case "SERVICE_UNAVAILABLE": return 503;
    default: return 500;
  }
}

