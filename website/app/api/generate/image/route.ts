/**
 * Image Generation API using Flux via Replicate
 * 
 * POST /api/generate/image
 * Generates AI images for preview components
 */

import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

interface ImageGenerationRequest {
  prompt: string;
  style?: "photorealistic" | "illustration" | "minimal" | "abstract";
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3";
  colorPalette?: string[];
  model?: "schnell" | "pro";
}

// Style modifiers for different aesthetics
const STYLE_MODIFIERS: Record<string, string> = {
  photorealistic: "professional photography, 8k, high detail, sharp focus, studio lighting",
  illustration: "modern flat illustration, vector art style, clean lines, digital art",
  minimal: "minimalist design, clean, simple, elegant, white space",
  abstract: "abstract shapes, geometric patterns, modern art, contemporary",
};

// Aspect ratio to pixel dimensions
const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1152, height: 896 },
};

function buildEnhancedPrompt(
  basePrompt: string,
  style?: string,
  colorPalette?: string[]
): string {
  let prompt = basePrompt;
  
  // Add style modifiers
  if (style && STYLE_MODIFIERS[style]) {
    prompt += `, ${STYLE_MODIFIERS[style]}`;
  }
  
  // Add color guidance
  if (colorPalette && colorPalette.length > 0) {
    const colorNames = colorPalette.slice(0, 3).join(", ");
    prompt += `, color scheme featuring ${colorNames}`;
  }
  
  // Quality boosters
  prompt += ", high quality, professional, trending on artstation";
  
  return prompt;
}

export async function POST(request: NextRequest) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    return NextResponse.json(
      { success: false, error: "REPLICATE_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const body: ImageGenerationRequest = await request.json();
    const { prompt, style, aspectRatio, colorPalette, model = "schnell" } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const replicate = new Replicate({ auth: apiToken });
    
    // Build enhanced prompt
    const enhancedPrompt = buildEnhancedPrompt(prompt, style, colorPalette);
    
    // Get dimensions
    const dimensions = ASPECT_DIMENSIONS[aspectRatio || "16:9"] || ASPECT_DIMENSIONS["16:9"];
    
    console.log("[ImageGen] Generating with prompt:", enhancedPrompt.substring(0, 100) + "...");
    
    // Choose model based on preference
    const modelId = model === "pro" 
      ? "black-forest-labs/flux-1.1-pro"
      : "black-forest-labs/flux-schnell";
    
    const output = await replicate.run(modelId, {
      input: {
        prompt: enhancedPrompt,
        width: dimensions.width,
        height: dimensions.height,
        num_outputs: 1,
        output_format: "webp",
        output_quality: 90,
      },
    });
    
    // Extract image URL from output
    // Replicate SDK returns FileOutput objects (ReadableStream with url() method)
    let imageUrl: string | undefined;
    
    try {
      if (Array.isArray(output) && output.length > 0) {
        const firstOutput = output[0];
        
        if (typeof firstOutput === "string") {
          // Direct string URL
          imageUrl = firstOutput;
        } else if (firstOutput && typeof firstOutput === "object") {
          // FileOutput object - try various extraction methods
          const fo = firstOutput as { 
            url?: () => Promise<string> | string; 
            href?: string;
            toString?: () => string;
          };
          
          // Method 1: Check for url() method (may be async in newer SDK)
          if (typeof fo.url === "function") {
            const urlResult = fo.url();
            if (urlResult instanceof Promise) {
              imageUrl = await urlResult;
            } else if (typeof urlResult === "string") {
              imageUrl = urlResult;
            }
          }
          
          // Method 2: Check href property
          if (!imageUrl && typeof fo.href === "string") {
            imageUrl = fo.href;
          }
          
          // Method 3: toString() - FileOutput extends URL which has toString
          if (!imageUrl && fo.toString) {
            const str = fo.toString();
            if (str && str.startsWith && str.startsWith("http")) {
              imageUrl = str;
            }
          }
          
          // Method 4: Check if it's a URL object directly
          if (!imageUrl && firstOutput instanceof URL) {
            imageUrl = firstOutput.toString();
          }
        }
      } else if (typeof output === "string") {
        imageUrl = output;
      }
    } catch (extractError) {
      console.error("[ImageGen] Error extracting URL:", extractError);
    }
    
    // Validate the URL
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
      console.error("[ImageGen] Invalid or missing URL. Got:", typeof imageUrl, imageUrl ? String(imageUrl).substring(0, 100) : "undefined");
      return NextResponse.json(
        { success: false, error: "Could not extract valid image URL from Replicate response" },
        { status: 500 }
      );
    }
    
    console.log("[ImageGen] ✅ Generated:", imageUrl.substring(0, 80) + "...");
    
    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
    });
  } catch (error) {
    console.error("[ImageGen] ❌ Generation failed:", error);
    
    // Detect specific error types for better user guidance
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLower = errorMessage.toLowerCase();
    
    // Rate limit detection
    if (errorLower.includes("rate") || errorLower.includes("429") || errorLower.includes("too many")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Rate limit reached. Please wait a few minutes before generating more images.",
          code: "RATE_LIMITED",
          action: "Wait 1-2 minutes and try again. Consider upgrading to a paid Replicate plan for higher limits."
        },
        { status: 429 }
      );
    }
    
    // Payment/credits required
    if (errorLower.includes("payment") || errorLower.includes("credit") || errorLower.includes("billing") || 
        errorLower.includes("402") || errorLower.includes("quota") || errorLower.includes("insufficient")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Image generation credits exhausted. Please add credits to your Replicate account.",
          code: "CREDITS_EXHAUSTED",
          action: "Visit replicate.com/account/billing to add credits or upgrade your plan."
        },
        { status: 402 }
      );
    }
    
    // Invalid/expired API key
    if (errorLower.includes("unauthorized") || errorLower.includes("401") || errorLower.includes("invalid") && errorLower.includes("key")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid or expired Replicate API key. Please check your configuration.",
          code: "INVALID_API_KEY",
          action: "Verify your REPLICATE_API_TOKEN in .env.local is correct and not expired."
        },
        { status: 401 }
      );
    }
    
    // Model unavailable
    if (errorLower.includes("model") && (errorLower.includes("not found") || errorLower.includes("unavailable"))) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Image generation model temporarily unavailable. Please try again later.",
          code: "MODEL_UNAVAILABLE",
          action: "This is usually temporary. Try again in a few minutes."
        },
        { status: 503 }
      );
    }
    
    // Generic fallback
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        code: "GENERATION_FAILED",
        action: "Check your Replicate account status at replicate.com/account"
      },
      { status: 500 }
    );
  }
}
