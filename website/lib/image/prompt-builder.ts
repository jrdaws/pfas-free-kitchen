/**
 * Context-Aware Image Prompt Builder
 * 
 * Builds optimized prompts for Flux image generation based on:
 * - Image slot context (section type, purpose, aspect ratio)
 * - User vision (project description, audience, tone)
 * - Style preferences (color palette, imagery style)
 */

import type { ImageSlot, ImageStyle, SectionType } from "./slot-detector";

export interface VisionContext {
  projectName: string;
  description: string;
  audience?: string;
  tone?: string;
  industry?: string;
}

export interface StyleContext {
  colorPalette: string[];
  aesthetic?: string;
  imagery?: "photography" | "illustrations" | "3d" | "abstract" | "minimal";
}

export interface PromptContext {
  slot: ImageSlot;
  vision: VisionContext;
  style: StyleContext;
}

export interface GeneratedPrompt {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  style: string;
}

// Section-specific prompt templates
const SECTION_PROMPTS: Record<SectionType, (ctx: VisionContext) => string> = {
  hero: (v) =>
    `Hero image for ${v.projectName}, ${v.description.substring(0, 100)}`,
  features: (v) =>
    `Feature illustration for ${v.projectName}, representing key functionality`,
  testimonials: (v) =>
    `Professional headshot of a ${v.audience || "business professional"}, friendly and approachable`,
  product: (v) =>
    `Product showcase for ${v.projectName}, clean modern presentation`,
  team: (v) =>
    `Professional team member portrait, ${v.industry || "technology"} industry`,
  about: (v) =>
    `About section image for ${v.projectName}, representing company culture`,
  cta: (v) =>
    `Call-to-action background for ${v.projectName}, abstract and inviting`,
  pricing: (v) =>
    `Abstract background for pricing section, professional and clean`,
};

// Style modifiers by imagery type
const IMAGERY_MODIFIERS: Record<string, string> = {
  photography:
    "professional photography, 8k, high detail, shallow depth of field, studio lighting",
  illustrations:
    "modern flat illustration, vector art style, clean lines, minimalist, digital art",
  "3d":
    "3D render, isometric, modern lighting, soft shadows, ambient occlusion",
  abstract:
    "abstract shapes, geometric patterns, gradients, flowing curves, modern art",
  minimal:
    "minimalist design, simple shapes, lots of whitespace, subtle colors",
};

// Mood modifiers by tone
const MOOD_MODIFIERS: Record<string, string> = {
  professional: "corporate, trustworthy, sophisticated, clean, business",
  friendly: "warm, approachable, inviting, welcoming, comfortable",
  playful: "fun, energetic, colorful, dynamic, youthful",
  luxurious: "elegant, premium, exclusive, high-end, refined",
  technical: "futuristic, tech, digital, innovative, precise",
  creative: "artistic, unique, imaginative, expressive, bold",
  modern: "contemporary, sleek, cutting-edge, fresh, current",
};

// Industry-specific keywords
const INDUSTRY_KEYWORDS: Record<string, string> = {
  saas: "software, dashboard, cloud, technology, digital",
  ecommerce: "shopping, products, store, retail, commerce",
  fintech: "finance, banking, money, transactions, security",
  healthcare: "medical, health, wellness, care, clinical",
  education: "learning, books, courses, students, knowledge",
  marketing: "advertising, growth, analytics, campaigns, branding",
  real_estate: "property, homes, buildings, architecture, spaces",
  food: "restaurant, cuisine, fresh, delicious, culinary",
  travel: "vacation, destinations, adventure, explore, journey",
  fitness: "gym, exercise, health, athletic, wellness",
  technology: "tech, innovation, digital, software, computing",
};

/**
 * Build an optimized prompt for image generation
 */
export function buildImagePrompt(context: PromptContext): GeneratedPrompt {
  const { slot, vision, style } = context;
  const { section, purpose } = slot.context;

  // Start with section-specific base prompt
  const sectionPromptFn = SECTION_PROMPTS[section];
  let prompt = sectionPromptFn
    ? sectionPromptFn(vision)
    : `${purpose}, ${vision.description}`;

  // Add slot-specific modifiers
  if (slot.slotName.includes("avatar") || slot.slotName.includes("profile")) {
    prompt += ", portrait photo, professional headshot, neutral background";
  } else if (slot.slotName.includes("background")) {
    prompt += ", wide shot, atmospheric, suitable for text overlay";
  } else if (slot.slotName.includes("icon")) {
    prompt += ", simple icon, clear silhouette, symbolic";
  } else if (slot.slotName.includes("hero")) {
    prompt += ", impactful, attention-grabbing, banner format";
  }

  // Add imagery style
  const imageryType = style.imagery || "photography";
  const imageryModifier =
    IMAGERY_MODIFIERS[imageryType] || IMAGERY_MODIFIERS.photography;
  prompt += `, ${imageryModifier}`;

  // Add color palette
  if (style.colorPalette.length > 0) {
    const colors = style.colorPalette.slice(0, 3).join(", ");
    prompt += `, color scheme: ${colors}`;
  }

  // Add mood/tone
  const tone = vision.tone || "professional";
  const moodModifier = MOOD_MODIFIERS[tone] || MOOD_MODIFIERS.professional;
  prompt += `, ${moodModifier} mood`;

  // Add industry keywords if detected
  const industry = vision.industry || extractIndustry(vision.description);
  if (industry && INDUSTRY_KEYWORDS[industry]) {
    prompt += `, ${INDUSTRY_KEYWORDS[industry]}`;
  }

  // Quality suffix
  prompt += ", high quality, professional, no text, no watermarks";

  // Build negative prompt
  const negativePrompt = buildNegativePrompt(section, slot.slotName);

  return {
    prompt,
    negativePrompt,
    aspectRatio: slot.context.aspectRatio,
    style: mapStyleToApi(slot.context.style),
  };
}

/**
 * Build negative prompt based on section type
 */
function buildNegativePrompt(section: SectionType, slotName: string): string {
  const base =
    "blurry, low quality, distorted, watermark, logo, signature, text, ugly, deformed";

  const sectionNegatives: Record<SectionType, string> = {
    hero: "busy, cluttered, distracting elements",
    features: "overly complex, confusing, messy",
    testimonials: "unflattering, unprofessional, artificial",
    product: "cheap looking, poor lighting, amateur",
    team: "unfriendly, harsh lighting, inappropriate",
    about: "generic stock photo, impersonal",
    cta: "boring, flat, unengaging",
    pricing: "distracting, overwhelming",
  };

  let negative = base;
  if (sectionNegatives[section]) {
    negative += `, ${sectionNegatives[section]}`;
  }

  // Add slot-specific negatives
  if (slotName.includes("avatar")) {
    negative += ", multiple people, full body, cartoon";
  }

  return negative;
}

/**
 * Extract industry from description
 */
function extractIndustry(description: string): string | undefined {
  const descLower = description.toLowerCase();

  const patterns: [RegExp, string][] = [
    [/saas|software|app|platform|cloud/, "saas"],
    [/shop|store|ecommerce|retail|product|sell/, "ecommerce"],
    [/finance|bank|payment|fintech|money/, "fintech"],
    [/health|medical|doctor|patient|wellness/, "healthcare"],
    [/learn|course|education|student|teach/, "education"],
    [/market|advertis|campaign|growth|seo/, "marketing"],
    [/property|real estate|home|house|building/, "real_estate"],
    [/food|restaurant|recipe|cook|cuisine/, "food"],
    [/travel|trip|vacation|hotel|booking/, "travel"],
    [/fitness|gym|workout|exercise/, "fitness"],
  ];

  for (const [pattern, industry] of patterns) {
    if (pattern.test(descLower)) {
      return industry;
    }
  }

  return "technology";
}

/**
 * Map internal style to API style
 */
function mapStyleToApi(
  style: ImageStyle
): "photorealistic" | "illustration" | "abstract" | "minimal" {
  const mapping: Record<ImageStyle, "photorealistic" | "illustration" | "abstract" | "minimal"> = {
    photo: "photorealistic",
    illustration: "illustration",
    "3d": "photorealistic",
    abstract: "abstract",
    minimal: "minimal",
  };
  return mapping[style] || "photorealistic";
}

/**
 * Generate a simple prompt for quick generation
 */
export function buildSimplePrompt(
  sectionType: SectionType,
  projectName: string,
  description: string
): string {
  const sectionPromptFn = SECTION_PROMPTS[sectionType];
  const basePrompt = sectionPromptFn
    ? sectionPromptFn({ projectName, description, audience: "", tone: "" })
    : `${sectionType} image for ${projectName}`;

  return `${basePrompt}, professional photography, high quality, modern, clean`;
}

/**
 * Get recommended model tier based on slot priority
 */
export function getRecommendedModelTier(
  priority: ImageSlot["priority"]
): "fast" | "balanced" | "quality" {
  const tierMap: Record<ImageSlot["priority"], "fast" | "balanced" | "quality"> = {
    high: "quality",
    medium: "balanced",
    low: "fast",
  };
  return tierMap[priority];
}

