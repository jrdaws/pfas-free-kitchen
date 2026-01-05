import { NextRequest, NextResponse } from "next/server";
import {
  createContext,
  getContextByProject,
  cleanupExpiredContexts,
} from "@/lib/context/store";
import type {
  CreateContextRequest,
  CreateContextResponse,
} from "@/lib/context/types";

/**
 * POST /api/context/session
 * Create a new session context
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateContextResponse>> {
  try {
    const body: CreateContextRequest = await request.json();
    const { projectId, userId, initialUnderstanding } = body;

    // Check if context already exists for this project
    if (projectId) {
      const existing = getContextByProject(projectId);
      if (existing) {
        return NextResponse.json({
          success: true,
          context: existing,
        });
      }
    }

    // Create new context
    const context = createContext(projectId, userId, initialUnderstanding);

    // Periodic cleanup
    cleanupExpiredContexts();

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error("[Context] Error creating context:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create context" },
      { status: 500 }
    );
  }
}

