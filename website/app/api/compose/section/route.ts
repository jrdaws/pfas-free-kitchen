/**
 * Section API
 * 
 * POST /api/compose/section - Generate a new section with AI-generated props
 */

import { NextRequest, NextResponse } from "next/server";
import { getPatternById } from "@/lib/composer/selector";
import { generatePatternProps } from "@/lib/composer/prop-generator";
import type { ComposerInput, SectionComposition } from "@/lib/composer/types";
import { handleApiError } from "@/lib/api-wrapper";

interface AddSectionRequest {
  patternId: string;
  atIndex?: number;
  variant?: string;
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

export async function POST(request: NextRequest) {
  try {
    const body: AddSectionRequest = await request.json();
    
    const { patternId, atIndex = 0, variant = 'dark', context } = body;
    
    // Validate pattern exists
    const pattern = getPatternById(patternId);
    if (!pattern) {
      return NextResponse.json(
        { error: "Pattern not found", patternId },
        { status: 404 }
      );
    }
    
    // Build composer input for prop generation
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
    };
    
    // Generate AI props for the pattern
    const propsResult = await generatePatternProps({
      pattern,
      context: composerInput,
      sectionIndex: atIndex,
    });
    
    // Build the section
    const section: SectionComposition = {
      patternId,
      variant,
      order: atIndex + 1,
      props: propsResult.props,
      isCustomGenerated: false,
    };
    
    console.log(`[API] Generated section: ${patternId} at index ${atIndex}`);
    
    return NextResponse.json({
      success: true,
      section,
      tokensUsed: propsResult.tokensUsed,
    });
  } catch (error) {
    console.error("[API] Section generation error:", error);
    return handleApiError(error, "anthropic");
  }
}

