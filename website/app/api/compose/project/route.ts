/**
 * Compose Project API
 * 
 * POST /api/compose/project
 * Composes a complete project with all pages based on user vision and requirements.
 */

import { NextRequest, NextResponse } from "next/server";
import { composeProject, ComposerInput, ComposerOutput } from "@/lib/composer";

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
    
    const input: ComposerInput = {
      vision: {
        projectName: body.vision.projectName,
        description: body.vision.description,
        audience: body.vision.audience,
        tone: body.vision.tone as ComposerInput["vision"]["tone"],
        goals: body.vision.goals,
        keywords: body.vision.keywords,
      },
      research: body.research,
      template: body.template as ComposerInput["template"],
      pages: body.pages.map(p => ({
        path: p.path,
        name: p.name,
        type: p.type as ComposerInput["pages"][0]["type"],
        priority: p.priority,
      })),
      integrations: body.integrations || {},
    };
    
    const result = await composeProject(input);
    
    return NextResponse.json({
      success: true,
      data: result,
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

