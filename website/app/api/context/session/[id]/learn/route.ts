import { NextRequest, NextResponse } from "next/server";
import { learnCorrection, getContext } from "@/lib/context/store";
import type { LearnCorrectionRequest } from "@/lib/context/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/context/session/[id]/learn
 * Process a user correction and update understanding
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body: LearnCorrectionRequest = await request.json();
    const { field, original, corrected, context: correctionContext } = body;

    // Validate required fields
    if (!field || !original || !corrected) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: field, original, corrected" },
        { status: 400 }
      );
    }

    // Check if context exists
    const existingContext = getContext(id);
    if (!existingContext) {
      return NextResponse.json(
        { success: false, error: "Context not found or expired" },
        { status: 404 }
      );
    }

    // Learn from correction
    const correction = learnCorrection(
      id,
      field,
      original,
      corrected,
      correctionContext || ""
    );

    if (!correction) {
      return NextResponse.json(
        { success: false, error: "Failed to learn correction" },
        { status: 500 }
      );
    }

    // Get updated context
    const updatedContext = getContext(id);

    return NextResponse.json({
      success: true,
      correction,
      understanding: updatedContext?.understanding,
      confidence: updatedContext?.confidence,
    });
  } catch (error) {
    console.error("[Context] Error learning correction:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to learn correction" },
      { status: 500 }
    );
  }
}

