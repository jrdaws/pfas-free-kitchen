/**
 * Compose Project API
 * 
 * POST /api/compose/project
 * Composes a complete project with all pages based on user vision and requirements.
 * Optionally generates AI images for all image slots.
 */

import { NextRequest, NextResponse } from "next/server";
import { composeProject, ComposerInput, ComposerOutput, getAvailablePatterns } from "@/lib/composer";
import type { ComposerMode, ComposerModeConfig } from "@/lib/configurator-state";
import {
  generateCompositionImages,
  injectImageProps,
  type ModelTier,
  type BatchGenerationResult,
} from "@/lib/image";

interface ComposeProjectRequest {
  vision: {
    projectName: string;
    description: string;
    audience?: string;
    tone?: string;
    goals?: string[];
    keywords?: string[];
  };
  research?: {
    insights: string[];
    recommendations: string[];
  };
  template: string;
  pages: Array<{
    path: string;
    name: string;
    type: string;
    priority?: number;
  }>;
  integrations?: Record<string, string>;
  preferences?: {
    generateImages?: boolean;
    modelTier?: ModelTier;
    skipLowPriorityImages?: boolean;
  };
  composerConfig?: ComposerModeConfig;
  styleContext?: {
    colorPalette?: string[];
    aesthetic?: string;
    imagery?: "photography" | "illustrations" | "3d" | "abstract" | "minimal";
  };
}

function validateRequest(body: unknown): body is ComposeProjectRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as ComposeProjectRequest;
  
  if (!req.vision?.projectName || !req.vision?.description) {
    return false;
  }
  
  if (!req.template || typeof req.template !== "string") {
    return false;
  }
  
  if (!Array.isArray(req.pages) || req.pages.length === 0) {
    return false;
  }
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Missing required fields: vision.projectName, vision.description, template, pages",
        },
        { status: 400 }
      );
    }
    
    // Transform research recommendations if provided (API accepts string[], internal type is object[])
    const research = body.research ? {
      insights: body.research.insights,
      recommendations: body.research.recommendations.map((r: string) => ({
        category: "general",
        features: [],
        reason: r,
      })),
    } : undefined;

    // Get composer config with defaults
    const composerConfig = body.composerConfig || {
      mode: 'hybrid' as ComposerMode,
      strictPatterns: false,
      maxPatterns: 10,
      useInspirationStructure: true,
      enableGapFiller: true,
      styleInheritance: 'full' as const,
      preferRegistry: true,
    };

    console.log(`[API] Composing with mode: ${composerConfig.mode}`);

    const input: ComposerInput = {
      vision: {
        projectName: body.vision.projectName,
        description: body.vision.description,
        audience: body.vision.audience,
        tone: body.vision.tone as ComposerInput["vision"]["tone"],
        goals: body.vision.goals,
        keywords: body.vision.keywords,
      },
      research,
      template: body.template as ComposerInput["template"],
      pages: body.pages.map(p => ({
        path: p.path,
        name: p.name,
        type: p.type as ComposerInput["pages"][0]["type"],
        priority: p.priority,
      })),
      integrations: body.integrations || {},
      preferences: body.preferences ? {
        generateImages: body.preferences.generateImages,
        // Pass composer config settings as preferences
        maxSections: composerConfig.maxPatterns,
        customInstructions: composerConfig.mode === 'registry' 
          ? 'Only use existing patterns from the registry. Do not generate custom sections.'
          : composerConfig.mode === 'hybrid'
          ? 'Use patterns where available. Generate custom sections for unique requirements.'
          : undefined,
      } : undefined,
    };
    
    // Compose based on mode
    const result = await composeProject(input);
    
    // Response data
    let responseData: {
      composition: typeof result.composition;
      confidence: number;
      imageGeneration?: {
        count: number;
        timing: BatchGenerationResult["timing"];
        errors: BatchGenerationResult["errors"];
      };
    } = {
      composition: result.composition,
      confidence: result.confidence,
    };

    // Generate images if requested
    if (body.preferences?.generateImages && result.composition) {
      console.log("[API] Generating images for composition...");
      
      // Get patterns for slot detection
      const patterns = getAvailablePatterns();
      
      // Build vision context
      const visionContext = {
        projectName: body.vision.projectName,
        description: body.vision.description,
        audience: body.vision.audience,
        tone: body.vision.tone,
        industry: undefined, // Will be inferred from description
      };
      
      // Build style context
      const styleContext = {
        colorPalette: body.styleContext?.colorPalette || [
          result.composition.globalStyles?.colorScheme?.primary || "#6366f1",
          result.composition.globalStyles?.colorScheme?.accent || "#8b5cf6",
        ],
        aesthetic: body.styleContext?.aesthetic || "modern",
        imagery: body.styleContext?.imagery || "photography",
      };
      
      try {
        const imageResult = await generateCompositionImages(
          result.composition,
          patterns,
          visionContext,
          styleContext,
          {
            modelTier: body.preferences.modelTier || "balanced",
            skipLowPriority: body.preferences.skipLowPriorityImages,
          }
        );
        
        console.log(
          `[API] Generated ${imageResult.stats.generated} images ` +
          `(${imageResult.stats.cached} cached, ${imageResult.stats.failed} failed) ` +
          `in ${imageResult.timing.total}ms`
        );
        
        // Inject images into composition
        if (imageResult.images.size > 0) {
          responseData.composition = injectImageProps(
            result.composition,
            imageResult.images
          );
        }
        
        // Add image generation stats to response
        responseData.imageGeneration = {
          count: imageResult.images.size,
          timing: imageResult.timing,
          errors: imageResult.errors,
        };
      } catch (imageError) {
        console.error("[API] Image generation failed:", imageError);
        // Continue without images - don't fail the whole request
        responseData.imageGeneration = {
          count: 0,
          timing: { total: 0, cached: 0, generated: 0, avgPerImage: 0 },
          errors: [{ slotKey: "all", error: imageError instanceof Error ? imageError.message : "Unknown error" }],
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[API] Compose project error:", error);
    
    return NextResponse.json(
      {
        error: "Composition failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

