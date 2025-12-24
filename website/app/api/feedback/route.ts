import { NextRequest } from "next/server";
import { apiError, apiSuccess, ErrorCodes } from "@/lib/api-errors";
import { validateFeedback, checkRateLimit, storeFeedback, hashIP } from "@/lib/supabase/feedback";

/**
 * POST /api/feedback
 * 
 * Collect user feedback with rate limiting.
 * 
 * @see output/website-agent/inbox/20251223-1900-P2-task-user-feedback-api.txt
 * @see docs/standards/API_CONTRACTS.md
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIP || "unknown";
    const ipHash = hashIP(ip);

    // Check rate limit (5 per hour per IP)
    const rateLimit = await checkRateLimit(ipHash);
    
    if (!rateLimit.allowed) {
      return apiError(
        ErrorCodes.RATE_LIMITED,
        "Too many feedback submissions. Please wait before trying again.",
        429,
        { remaining: rateLimit.remaining, resetIn: "1 hour" },
        "Wait at least an hour before submitting more feedback."
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(
        ErrorCodes.BAD_REQUEST,
        "Invalid JSON in request body",
        400,
        undefined,
        "Ensure the request body is valid JSON."
      );
    }

    const validation = validateFeedback(body);
    
    if (!validation.valid) {
      return apiError(
        ErrorCodes.INVALID_INPUT,
        validation.error,
        400,
        undefined,
        "Check the request format: rating (1-5, required), message (optional, max 1000 chars)"
      );
    }

    // Store feedback
    const result = await storeFeedback(validation.data, ipHash);

    if ("error" in result) {
      return apiError(
        ErrorCodes.DATABASE_ERROR,
        "Failed to store feedback",
        500,
        { reason: result.error },
        "Try again in a few moments."
      );
    }

    // Success response
    return apiSuccess(
      { 
        id: result.id,
        remaining: rateLimit.remaining - 1,
      },
      201
    );
  } catch (error) {
    console.error("[Feedback API Error]", error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      "An unexpected error occurred",
      500,
      undefined,
      "Try again in a few moments. If the issue persists, contact support."
    );
  }
}

/**
 * OPTIONS /api/feedback
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

