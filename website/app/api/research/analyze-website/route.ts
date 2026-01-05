/**
 * Deep Website Analysis API
 * 
 * POST /api/research/analyze-website
 * Performs comprehensive analysis of an inspiration URL:
 * - Visual design (colors, typography)
 * - Page structure (sections, layouts)
 * - UI components (buttons, cards, forms)
 * - Features (auth, ecommerce, content)
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  analyzeWebsite, 
  quickAnalyzeWebsite,
  type WebsiteAnalysis,
} from "@/lib/website-analyzer";

interface AnalyzeWebsiteRequest {
  url: string;
  mode?: "full" | "quick";
  includeScreenshot?: boolean;
}

function validateRequest(body: unknown): body is AnalyzeWebsiteRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as AnalyzeWebsiteRequest;
  
  if (!req.url || typeof req.url !== "string") {
    return false;
  }
  
  return true;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          message: "Missing required field: url",
        },
        { status: 400 }
      );
    }
    
    if (!isValidUrl(body.url)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL",
          message: "URL must be a valid HTTP or HTTPS URL",
        },
        { status: 400 }
      );
    }
    
    const mode = body.mode || "full";
    const includeScreenshot = body.includeScreenshot ?? false;
    
    console.log(`[API] Analyzing website: ${body.url} (mode: ${mode})`);
    
    let result;
    
    if (mode === "quick") {
      result = await quickAnalyzeWebsite(body.url);
    } else {
      result = await analyzeWebsite(body.url, {
        includeScreenshot,
        parallel: true,
      });
    }
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Analysis failed",
          message: result.error,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      warnings: result.warnings,
    });
  } catch (error) {
    console.error("[API] Website analysis error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET for simple URL-based analysis
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const mode = request.nextUrl.searchParams.get("mode") || "quick";
  
  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid or missing URL parameter",
      },
      { status: 400 }
    );
  }
  
  const result = mode === "full" 
    ? await analyzeWebsite(url, { parallel: true })
    : await quickAnalyzeWebsite(url);
  
  return NextResponse.json({
    success: result.success,
    analysis: result.analysis,
    warnings: result.warnings,
  });
}

