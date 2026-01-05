import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

// Lazy initialization - only create client if token exists
function getReplicateClient(): Replicate | null {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || token === "your_replicate_token" || token.startsWith("r8_placeholder")) {
    return null;
  }
  return new Replicate({ auth: token });
}

export type ImageStyle = "photorealistic" | "illustration" | "minimal" | "abstract" | "modern";
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:2";

interface ImageGenerationRequest {
  prompt: string;
  style?: ImageStyle;
  aspectRatio?: AspectRatio;
  colorPalette?: string[];
  quality?: "fast" | "high";
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  cached?: boolean;
}

// Style modifiers for enhanced prompts
const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  photorealistic: "professional photography, 8k, high detail, sharp focus, realistic lighting",
  illustration: "modern flat illustration, vector art style, clean lines, digital art",
  minimal: "minimalist design, clean, simple, elegant, whitespace",
  abstract: "abstract shapes, geometric patterns, modern art, creative composition",
  modern: "modern design, professional, sleek, contemporary style",
};

// Aspect ratio to dimensions
const ASPECT_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1152, height: 896 },
  "3:2": { width: 1216, height: 832 },
};

function buildEnhancedPrompt(
  basePrompt: string,
  style?: ImageStyle,
  colorPalette?: string[]
): string {
  let prompt = basePrompt;

  // Add style modifiers
  if (style && STYLE_MODIFIERS[style]) {
    prompt += `, ${STYLE_MODIFIERS[style]}`;
  }

  // Add color guidance
  if (colorPalette && colorPalette.length > 0) {
    const colorNames = colorPalette.map((c) => c.startsWith("#") ? c : `#${c}`);
    prompt += `, color palette using ${colorNames.join(", ")}`;
  }

  // Quality boosters
  prompt += ", high quality, professional, detailed";

  return prompt;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ImageGenerationResponse>> {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { prompt, style, aspectRatio, colorPalette, quality } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const replicate = getReplicateClient();
    
    if (!replicate) {
      // Return a placeholder when Replicate is not configured
      console.log("[Image Generation] Replicate not configured, returning placeholder");
      return NextResponse.json({
        success: true,
        imageUrl: `https://placehold.co/${ASPECT_DIMENSIONS[aspectRatio || "16:9"].width}x${ASPECT_DIMENSIONS[aspectRatio || "16:9"].height}/1e293b/6366f1?text=AI+Image`,
        cached: false,
      });
    }

    // Build enhanced prompt
    const enhancedPrompt = buildEnhancedPrompt(prompt, style, colorPalette);
    const { width, height } = ASPECT_DIMENSIONS[aspectRatio || "16:9"];

    // Choose model based on quality preference
    const model = quality === "high" 
      ? "black-forest-labs/flux-1.1-pro" 
      : "black-forest-labs/flux-schnell";

    console.log(`[Image Generation] Generating with ${model}:`, enhancedPrompt.substring(0, 100));

    const output = await replicate.run(model, {
      input: {
        prompt: enhancedPrompt,
        width,
        height,
        num_outputs: 1,
        output_format: "webp",
        output_quality: 90,
      },
    });

    // Output is an array of image URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error("No image URL returned from Replicate");
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      cached: false,
    });
  } catch (error) {
    console.error("[Image Generation] Error:", error);
    
    const message = error instanceof Error ? error.message : "Image generation failed";
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

