/**
 * Compose Page API
 * 
 * POST /api/compose/page
 * Composes a single page based on project context and page configuration.
 */

import { NextRequest, NextResponse } from "next/server";
import { composePage, ComposerInput, PageComposition } from "@/lib/composer";

interface ComposePageRequest {
  vision: {
    projectName: string;
    description: string;
    audience?: string;
    tone?: string;
    goals?: string[];
  };
  research?: {
    insights: string[];
    recommendations: string[];
  };
  template: string;
  page: {
    path: string;
    name: string;
    type: string;
    priority?: number;
  };
  integrations?: Record<string, string>;
}

function validateRequest(body: unknown): body is ComposePageRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as ComposePageRequest;
  
  if (!req.vision?.projectName || !req.vision?.description) {
    return false;
  }
  
  if (!req.template || typeof req.template !== "string") {
    return false;
  }
  
  if (!req.page?.path || !req.page?.name || !req.page?.type) {
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
          message: "Missing required fields: vision, template, page",
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
      },
      research: body.research,
      template: body.template as ComposerInput["template"],
      pages: [body.page].map(p => ({
        path: p.path,
        name: p.name,
        type: p.type as ComposerInput["pages"][0]["type"],
        priority: p.priority,
      })),
      integrations: body.integrations || {},
    };
    
    const pageConfig = {
      path: body.page.path,
      name: body.page.name,
      type: body.page.type as ComposerInput["pages"][0]["type"],
      priority: body.page.priority,
    };
    
    const result = await composePage(input, pageConfig);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[API] Compose page error:", error);
    
    return NextResponse.json(
      {
        error: "Composition failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

