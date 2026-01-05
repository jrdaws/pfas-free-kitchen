/**
 * Extract Colors API
 * 
 * POST /api/research/extract-colors
 * Extracts color palette from an inspiration URL or uploaded image.
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  extractColorsFromUrl, 
  extractColorsFromScreenshot,
  extractColorsFromImageUrl,
  getDefaultPalette,
  type ColorPalette,
} from "@/lib/color-extractor";

interface ExtractColorsRequest {
  url?: string;
  imageUrl?: string;
  imageBase64?: string;
}

function validateRequest(body: unknown): body is ExtractColorsRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as ExtractColorsRequest;
  
  // At least one source must be provided
  if (!req.url && !req.imageUrl && !req.imageBase64) {
    return false;
  }
  
  return true;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
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
          message: "Provide url, imageUrl, or imageBase64",
          palette: getDefaultPalette(),
        },
        { status: 400 }
      );
    }
    
    let result;
    
    // Priority: imageBase64 > imageUrl > url
    if (body.imageBase64) {
      // Extract from provided base64 image
      result = await extractColorsFromScreenshot(body.imageBase64);
    } else if (body.imageUrl) {
      // Extract from image URL
      if (!isValidUrl(body.imageUrl)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid image URL",
            palette: getDefaultPalette(),
          },
          { status: 400 }
        );
      }
      result = await extractColorsFromImageUrl(body.imageUrl);
    } else if (body.url) {
      // Extract from website URL (screenshot + analyze)
      if (!isValidUrl(body.url)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid URL",
            palette: getDefaultPalette(),
          },
          { status: 400 }
        );
      }
      result = await extractColorsFromUrl(body.url);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No source provided",
          palette: getDefaultPalette(),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: result.success,
      palette: result.palette,
      error: result.error,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error("[API] Extract colors error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Extraction failed",
        message: error instanceof Error ? error.message : "Unknown error",
        palette: getDefaultPalette(),
      },
      { status: 500 }
    );
  }
}

// Also support GET for simple URL-based extraction
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  
  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid or missing URL parameter",
        palette: getDefaultPalette(),
      },
      { status: 400 }
    );
  }
  
  const result = await extractColorsFromUrl(url);
  
  return NextResponse.json({
    success: result.success,
    palette: result.palette,
    error: result.error,
  });
}

