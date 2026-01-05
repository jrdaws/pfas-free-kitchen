/**
 * Regenerate Section API
 * 
 * POST /api/compose/regenerate-section
 * Regenerates a specific section with optional feedback for improvement.
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  regenerateSection, 
  fillGap,
  ComposerInput, 
  ProjectComposition,
  SectionComposition,
} from "@/lib/composer";

interface RegenerateSectionRequest {
  composition: ProjectComposition;
  pageId: string;
  sectionIndex: number;
  feedback?: string;
  context?: ComposerInput;
}

interface FillGapRequest {
  requirement: string;
  context: ComposerInput;
  surroundingSections?: SectionComposition[];
}

function validateRegenerateRequest(body: unknown): body is RegenerateSectionRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as RegenerateSectionRequest;
  
  if (!req.composition || !req.pageId || typeof req.sectionIndex !== "number") {
    return false;
  }
  
  return true;
}

function validateFillGapRequest(body: unknown): body is FillGapRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as FillGapRequest;
  
  if (!req.requirement || !req.context) {
    return false;
  }
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get("action") || "regenerate";
    
    if (action === "fill-gap") {
      // Handle gap filling
      if (!validateFillGapRequest(body)) {
        return NextResponse.json(
          {
            error: "Invalid request",
            message: "Missing required fields: requirement, context",
          },
          { status: 400 }
        );
      }
      
      const result = await fillGap(
        body.requirement,
        body.context,
        body.surroundingSections
      );
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    }
    
    // Handle section regeneration
    if (!validateRegenerateRequest(body)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Missing required fields: composition, pageId, sectionIndex",
        },
        { status: 400 }
      );
    }
    
    const result = await regenerateSection(
      body.composition,
      body.pageId,
      body.sectionIndex,
      body.feedback,
      body.context
    );
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[API] Regenerate section error:", error);
    
    return NextResponse.json(
      {
        error: "Regeneration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

