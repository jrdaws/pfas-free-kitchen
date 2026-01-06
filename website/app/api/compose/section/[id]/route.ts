/**
 * Section Operations API
 * 
 * POST /api/compose/section/[id] - Regenerate a specific section
 * PATCH /api/compose/section/[id] - Update section props
 */

import { NextRequest, NextResponse } from "next/server";
import { regenerateSection } from "@/lib/composer";
import { getPatternById } from "@/lib/composer/selector";
import { generatePatternProps } from "@/lib/composer/prop-generator";
import type { ProjectComposition, ComposerInput, SectionComposition } from "@/lib/composer/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================================
// POST - Regenerate Section
// ============================================================================

interface RegenerateRequest {
  composition: ProjectComposition;
  pageId: string;
  sectionIndex: number;
  feedback?: string;
  context: {
    vision: {
      projectName: string;
      description: string;
      audience?: string;
      tone?: string;
    };
    template: string;
    integrations?: Record<string, string>;
  };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body: RegenerateRequest = await request.json();
    
    const { composition, pageId, sectionIndex, feedback, context } = body;
    
    // Build composer input
    const composerInput: ComposerInput = {
      vision: {
        projectName: context.vision.projectName,
        description: context.vision.description,
        audience: context.vision.audience,
        tone: context.vision.tone as ComposerInput["vision"]["tone"],
      },
      template: context.template as ComposerInput["template"],
      pages: [],
      integrations: context.integrations || {},
      preferences: feedback ? { customInstructions: feedback } : undefined,
    };
    
    // Regenerate the section
    const newSection = await regenerateSection(
      composition,
      pageId,
      sectionIndex,
      feedback,
      composerInput
    );
    
    console.log(`[API] Regenerated section ${id} at ${pageId}[${sectionIndex}]`);
    
    return NextResponse.json({
      success: true,
      section: newSection,
    });
  } catch (error) {
    console.error("[API] Section regeneration error:", error);
    
    return NextResponse.json(
      {
        error: "Section regeneration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update Section Props
// ============================================================================

interface UpdatePropsRequest {
  props: Record<string, unknown>;
  variant?: string;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body: UpdatePropsRequest = await request.json();
    
    // This is a simple pass-through - the actual update happens client-side
    // This endpoint is for validation and future server-side persistence
    
    const { props, variant } = body;
    
    console.log(`[API] Updated section ${id} props`);
    
    return NextResponse.json({
      success: true,
      id,
      props,
      variant,
    });
  } catch (error) {
    console.error("[API] Section update error:", error);
    
    return NextResponse.json(
      {
        error: "Section update failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

