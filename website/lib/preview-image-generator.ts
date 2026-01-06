/**
 * Preview Image Generator
 * 
 * Generates custom images for preview sections using Flux AI,
 * based on website analysis and project vision.
 */

import {
  buildImagePrompt,
  extractIndustry,
  inferImageStyleFromAnalysis,
  inferMoodFromAudience,
  getAspectRatioForSlot,
  type ImageStyle,
  type ImageMood,
  type SectionType,
  type ImageSlot,
} from "./image-prompt-builder";
import { hashPrompt, getCachedImage, cacheImage } from "./image-cache";

// Website analysis interface (matching our analysis-types)
interface WebsiteAnalysis {
  visual?: {
    colorPalette?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    components?: {
      icons?: { style?: string };
      cards?: { style?: string };
    };
    layout?: {
      overallStyle?: string;
    };
  };
}

// Vision/project context
interface ProjectVision {
  projectName: string;
  description: string;
  audience: string;
  tone?: string;
}

// Section definition for image generation
interface SectionImageRequest {
  type: SectionType;
  needsImage: boolean;
  imageSlot?: ImageSlot;
  customPrompt?: string;
}

// Request for batch image generation
export interface PreviewImageRequest {
  sections: SectionImageRequest[];
  websiteAnalysis?: WebsiteAnalysis;
  vision: ProjectVision;
}

// Result type
export interface PreviewImageResult {
  images: Map<string, string>;
  generatedCount: number;
  cachedCount: number;
  errors: string[];
}

/**
 * Generate images for preview sections
 */
export async function generatePreviewImages(
  request: PreviewImageRequest
): Promise<PreviewImageResult> {
  const { sections, websiteAnalysis, vision } = request;
  const images = new Map<string, string>();
  const errors: string[] = [];
  let generatedCount = 0;
  let cachedCount = 0;

  // Extract style from analysis
  const colorPalette = websiteAnalysis?.visual?.colorPalette
    ? [
        websiteAnalysis.visual.colorPalette.primary,
        websiteAnalysis.visual.colorPalette.accent,
      ]
    : [];

  const imageStyle: ImageStyle = websiteAnalysis?.visual
    ? inferImageStyleFromAnalysis(websiteAnalysis.visual)
    : "photorealistic";

  const mood: ImageMood = vision.tone
    ? (vision.tone as ImageMood)
    : inferMoodFromAudience(vision.audience);

  const industry = extractIndustry(vision.description);

  // Generate images for sections that need them
  for (const section of sections) {
    if (!section.needsImage) continue;

    const slot = section.imageSlot || inferSlotForSection(section.type);
    const imageKey = `${section.type}-${slot}`;

    // Build prompt
    const prompt = section.customPrompt || buildImagePrompt({
      section: section.type,
      purpose: `${slot} image for ${section.type} section`,
      slot,
      style: {
        colorPalette,
        imageStyle,
        mood,
      },
      content: {
        projectName: vision.projectName,
        industry,
        audience: vision.audience,
        description: vision.description,
      },
    });

    // Check cache first
    const promptHash = hashPrompt(prompt, imageStyle, getAspectRatioForSlot(slot));
    const cachedUrl = getCachedImage(promptHash);

    if (cachedUrl) {
      images.set(imageKey, cachedUrl);
      cachedCount++;
      continue;
    }

    // Generate new image
    try {
      const imageUrl = await generateFluxImage(prompt, slot, imageStyle);
      images.set(imageKey, imageUrl);
      cacheImage(promptHash, imageUrl, prompt);
      generatedCount++;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Failed to generate ${imageKey}: ${errorMsg}`);
      // Use placeholder on failure
      images.set(imageKey, getPlaceholderUrl(slot));
    }
  }

  return {
    images,
    generatedCount,
    cachedCount,
    errors,
  };
}

/**
 * Generate a single image using Flux API
 */
async function generateFluxImage(
  prompt: string,
  slot: ImageSlot,
  style: ImageStyle
): Promise<string> {
  const aspectRatio = getAspectRatioForSlot(slot);

  // Map our style to API style
  const apiStyle = mapToApiStyle(style);

  const response = await fetch("/api/generate/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      style: apiStyle,
      aspectRatio,
      model: "schnell", // Fast model for preview
    }),
  });

  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success || !data.imageUrl) {
    throw new Error(data.error || "No image URL returned");
  }

  return data.imageUrl;
}

/**
 * Map internal style to API style
 */
function mapToApiStyle(
  style: ImageStyle
): "photorealistic" | "illustration" | "minimal" | "abstract" {
  const mapping: Record<ImageStyle, "photorealistic" | "illustration" | "minimal" | "abstract"> = {
    photorealistic: "photorealistic",
    illustration: "illustration",
    abstract: "abstract",
    "3d": "photorealistic", // 3D renders as photorealistic
    minimal: "minimal",
  };
  return mapping[style] || "photorealistic";
}

/**
 * Infer the appropriate image slot for a section type
 */
function inferSlotForSection(sectionType: SectionType): ImageSlot {
  const slotMapping: Record<SectionType, ImageSlot> = {
    hero: "hero",
    features: "feature",
    testimonials: "avatar",
    product: "product",
    pricing: "background",
    cta: "background",
    about: "feature",
    team: "avatar",
  };
  return slotMapping[sectionType] || "feature";
}

/**
 * Get placeholder URL for a slot
 */
function getPlaceholderUrl(slot: ImageSlot): string {
  const dimensions: Record<ImageSlot, { w: number; h: number }> = {
    hero: { w: 1344, h: 768 },
    background: { w: 1344, h: 768 },
    icon: { w: 256, h: 256 },
    avatar: { w: 256, h: 256 },
    feature: { w: 600, h: 400 },
    product: { w: 600, h: 400 },
  };
  const { w, h } = dimensions[slot] || { w: 600, h: 400 };
  return `https://placehold.co/${w}x${h}/1e293b/6366f1?text=${slot}`;
}

/**
 * Generate a single hero image (convenience function)
 */
export async function generateHeroImage(vision: ProjectVision): Promise<string> {
  const result = await generatePreviewImages({
    sections: [{ type: "hero", needsImage: true, imageSlot: "hero" }],
    vision,
  });
  return result.images.get("hero-hero") || getPlaceholderUrl("hero");
}

/**
 * Generate team/avatar images (convenience function)
 */
export async function generateAvatarImages(
  count: number,
  vision: ProjectVision
): Promise<string[]> {
  const sections: SectionImageRequest[] = Array.from({ length: count }, (_, i) => ({
    type: "testimonials" as SectionType,
    needsImage: true,
    imageSlot: "avatar" as ImageSlot,
    customPrompt: `Professional headshot ${i + 1}, ${vision.audience} demographic, friendly expression, neutral background`,
  }));

  const result = await generatePreviewImages({ sections, vision });
  return sections.map((_, i) => 
    result.images.get(`testimonials-avatar`) || getPlaceholderUrl("avatar")
  );
}

