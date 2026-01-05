import { NextRequest } from "next/server";
import { apiError, apiSuccess, ErrorCodes } from "@/lib/api-errors";
import { hashIP, checkRateLimit } from "@/lib/supabase/feedback";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Export Feedback Schema
 * 
 * Collects specific feedback about exported projects to measure quality.
 */
interface ExportFeedback {
  // Project identification
  exportId?: string;
  projectName: string;
  template: string;
  integrations: Record<string, string>;
  
  // Export outcome
  buildSuccessful: boolean;
  
  // Quality ratings (1-5)
  previewAccuracy: number;
  overallSatisfaction: number;
  
  // Issues encountered
  missingFiles?: string[];
  buildErrors?: string[];
  
  // Free-form feedback
  whatWasMissing?: string;
  wouldUseAgain: boolean;
}

/**
 * POST /api/feedback/export
 * 
 * Collect detailed feedback about exported projects.
 * Used to measure and improve export quality.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIP || "unknown";
    const ipHash = hashIP(ip);

    const rateLimit = await checkRateLimit(ipHash);
    
    if (!rateLimit.allowed) {
      return apiError(
        ErrorCodes.RATE_LIMITED,
        "Too many feedback submissions. Please wait before trying again.",
        429,
        { remaining: rateLimit.remaining, resetIn: "1 hour" }
      );
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(
        ErrorCodes.BAD_REQUEST,
        "Invalid JSON in request body",
        400
      );
    }

    // Validate
    const validation = validateExportFeedback(body);
    if (!validation.valid) {
      return apiError(
        ErrorCodes.INVALID_INPUT,
        validation.error,
        400
      );
    }

    // Store feedback
    const result = await storeExportFeedback(validation.data, ipHash);

    if ("error" in result) {
      return apiError(
        ErrorCodes.DATABASE_ERROR,
        "Failed to store feedback",
        500,
        { reason: result.error }
      );
    }

    return apiSuccess(
      { 
        id: result.id,
        message: "Thank you for your feedback!",
      },
      201
    );
  } catch (error) {
    console.error("[Export Feedback API Error]", error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      "An unexpected error occurred",
      500
    );
  }
}

/**
 * Validate export feedback input
 */
function validateExportFeedback(
  input: unknown
): { valid: true; data: ExportFeedback } | { valid: false; error: string } {
  if (!input || typeof input !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }

  const body = input as Record<string, unknown>;

  // Required fields
  if (typeof body.projectName !== "string" || !body.projectName) {
    return { valid: false, error: "projectName is required" };
  }

  if (typeof body.template !== "string" || !body.template) {
    return { valid: false, error: "template is required" };
  }

  if (typeof body.buildSuccessful !== "boolean") {
    return { valid: false, error: "buildSuccessful must be a boolean" };
  }

  if (typeof body.wouldUseAgain !== "boolean") {
    return { valid: false, error: "wouldUseAgain must be a boolean" };
  }

  // Rating validations (1-5)
  if (typeof body.previewAccuracy !== "number" || 
      body.previewAccuracy < 1 || body.previewAccuracy > 5) {
    return { valid: false, error: "previewAccuracy must be a number between 1 and 5" };
  }

  if (typeof body.overallSatisfaction !== "number" || 
      body.overallSatisfaction < 1 || body.overallSatisfaction > 5) {
    return { valid: false, error: "overallSatisfaction must be a number between 1 and 5" };
  }

  // Optional string validation
  if (body.whatWasMissing !== undefined && 
      typeof body.whatWasMissing !== "string") {
    return { valid: false, error: "whatWasMissing must be a string" };
  }

  // Integrations validation
  if (body.integrations !== undefined && typeof body.integrations !== "object") {
    return { valid: false, error: "integrations must be an object" };
  }

  return {
    valid: true,
    data: {
      exportId: body.exportId as string | undefined,
      projectName: body.projectName as string,
      template: body.template as string,
      integrations: (body.integrations as Record<string, string>) || {},
      buildSuccessful: body.buildSuccessful as boolean,
      previewAccuracy: body.previewAccuracy as number,
      overallSatisfaction: body.overallSatisfaction as number,
      missingFiles: body.missingFiles as string[] | undefined,
      buildErrors: body.buildErrors as string[] | undefined,
      whatWasMissing: body.whatWasMissing as string | undefined,
      wouldUseAgain: body.wouldUseAgain as boolean,
    },
  };
}

/**
 * Store export feedback
 */
async function storeExportFeedback(
  input: ExportFeedback,
  ipHash: string
): Promise<{ id: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    // Development mode: log and return mock ID
    console.log("[Export Feedback] Development mode - feedback logged:", {
      ...input,
      ip_hash: ipHash,
    });
    return { id: `dev-export-${Date.now()}` };
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("export_feedback")
    .insert({
      export_id: input.exportId || null,
      project_name: input.projectName,
      template: input.template,
      integrations: input.integrations,
      build_successful: input.buildSuccessful,
      preview_accuracy: input.previewAccuracy,
      overall_satisfaction: input.overallSatisfaction,
      missing_files: input.missingFiles || null,
      build_errors: input.buildErrors || null,
      what_was_missing: input.whatWasMissing?.slice(0, 1000) || null,
      would_use_again: input.wouldUseAgain,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[Export Feedback] Failed to store:", error);
    return { error: error.message };
  }

  return { id: data.id };
}

/**
 * OPTIONS handler for CORS
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

