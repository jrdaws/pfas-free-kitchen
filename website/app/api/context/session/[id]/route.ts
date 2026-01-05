import { NextRequest, NextResponse } from "next/server";
import {
  getContext,
  updateContext,
  deleteContext,
  getContextSummary,
} from "@/lib/context/store";
import type {
  GetContextResponse,
  UpdateContextRequest,
} from "@/lib/context/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/context/session/[id]
 * Get a session context by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<GetContextResponse>> {
  try {
    const { id } = await params;
    const summary = request.nextUrl.searchParams.get("summary") === "true";

    if (summary) {
      const contextSummary = getContextSummary(id);
      if (!contextSummary) {
        return NextResponse.json(
          { success: false, error: "Context not found or expired" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        context: contextSummary as unknown as GetContextResponse["context"],
      });
    }

    const context = getContext(id);

    if (!context) {
      return NextResponse.json(
        { success: false, error: "Context not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error("[Context] Error getting context:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to get context" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/context/session/[id]
 * Update a session context
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body: UpdateContextRequest = await request.json();

    const updatedContext = updateContext(id, body);

    if (!updatedContext) {
      return NextResponse.json(
        { success: false, error: "Context not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      context: updatedContext,
    });
  } catch (error) {
    console.error("[Context] Error updating context:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update context" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/context/session/[id]
 * Delete a session context
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const deleted = deleteContext(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Context not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Context] Error deleting context:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete context" },
      { status: 500 }
    );
  }
}

