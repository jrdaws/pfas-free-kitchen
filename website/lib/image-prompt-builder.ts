/**
 * Smart Image Prompt Builder
 * 
 * Builds context-aware prompts for Flux image generation based on:
 * - Section type (hero, features, testimonials, etc.)
 * - Extracted color palette from inspiration site
 * - Content context (project vision, audience, tone)
 */

export type ImageStyle = "photorealistic" | "illustration" | "abstract" | "3d" | "minimal";
export type ImageMood = "professional" | "friendly" | "luxurious" | "playful" | "technical";
export type SectionType = "hero" | "features" | "testimonials" | "product" | "pricing" | "cta" | "about" | "team";
export type ImageSlot = "hero" | "background" | "icon" | "avatar" | "feature" | "product";

export interface ImageContext {
  section: SectionType;
  purpose: string;
  slot?: ImageSlot;
  style: {
    colorPalette: string[];
    imageStyle: ImageStyle;
    mood: ImageMood;
  };
  content: {
    projectName: string;
    industry: string;
    audience: string;
    description?: string;
  };
}

// Section-specific prompt templates
const SECTION_PROMPTS: Record<SectionType, (content: ImageContext["content"]) => string> = {
  hero: (c) => `Hero image for ${c.projectName}, ${c.industry} ${c.description ? `- ${c.description}` : ""}`,
  features: (c) => `Feature icon or illustration for ${c.industry} software`,
  testimonials: (c) => `Professional headshot of a ${c.audience} persona, natural lighting`,
  product: (c) => `Product showcase for ${c.projectName}, modern clean presentation`,
  pricing: (c) => `Abstract background pattern for pricing section, ${c.industry} themed`,
  cta: (c) => `Call-to-action background image for ${c.projectName}`,
  about: (c) => `Team or company culture image for ${c.industry}`,
  team: (c) => `Professional team member photo, ${c.industry} industry`,
};

// Style modifiers for different image styles
const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  photorealistic: "professional photography, 8k, high detail, shallow depth of field, studio lighting",
  illustration: "modern flat illustration, vector art style, clean lines, digital art, 2D",
  abstract: "abstract shapes, geometric patterns, gradients, modern art",
  "3d": "3D render, isometric view, modern, clean, soft shadows, ambient occlusion",
  minimal: "minimalist, clean, simple shapes, whitespace, subtle",
};

// Mood modifiers
const MOOD_MODIFIERS: Record<ImageMood, string> = {
  professional: "corporate, trustworthy, sophisticated, clean",
  friendly: "warm, approachable, inviting, welcoming",
  luxurious: "elegant, premium, exclusive, high-end",
  playful: "fun, energetic, colorful, dynamic",
  technical: "futuristic, tech, digital, innovative",
};

// Industry-specific keywords
const INDUSTRY_KEYWORDS: Record<string, string> = {
  saas: "software, dashboard, cloud, technology",
  ecommerce: "shopping, products, store, retail",
  fintech: "finance, banking, money, transactions",
  healthcare: "medical, health, wellness, care",
  education: "learning, books, courses, students",
  marketing: "advertising, growth, analytics, campaigns",
  real_estate: "property, homes, buildings, architecture",
  food: "restaurant, cuisine, fresh, delicious",
  travel: "vacation, destinations, adventure, explore",
  fitness: "gym, exercise, health, athletic",
};

/**
 * Build an optimized prompt for Flux image generation
 */
export function buildImagePrompt(context: ImageContext): string {
  const { section, purpose, slot, style, content } = context;

  // Start with section-specific prompt or custom purpose
  const sectionPromptFn = SECTION_PROMPTS[section];
  let prompt = sectionPromptFn ? sectionPromptFn(content) : purpose;

  // Add slot-specific modifiers
  if (slot) {
    const slotModifiers: Record<ImageSlot, string> = {
      hero: "wide shot, banner format, impactful",
      background: "subtle pattern, texture, atmospheric",
      icon: "simple, iconic, clear silhouette",
      avatar: "portrait, headshot, friendly expression",
      feature: "focused, descriptive, informative",
      product: "product photography, clean background, detailed",
    };
    if (slotModifiers[slot]) {
      prompt += `, ${slotModifiers[slot]}`;
    }
  }

  // Add style modifiers
  const styleModifier = STYLE_MODIFIERS[style.imageStyle] || STYLE_MODIFIERS.photorealistic;
  prompt += `, ${styleModifier}`;

  // Add color palette guidance
  if (style.colorPalette.length > 0) {
    const colors = style.colorPalette.slice(0, 3).join(", ");
    prompt += `, color scheme featuring ${colors}`;
  }

  // Add mood
  const moodModifier = MOOD_MODIFIERS[style.mood] || MOOD_MODIFIERS.professional;
  prompt += `, ${moodModifier} style`;

  // Add industry keywords if detected
  const industryLower = content.industry.toLowerCase();
  for (const [key, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (industryLower.includes(key)) {
      prompt += `, ${keywords}`;
      break;
    }
  }

  // Quality suffix
  prompt += ", high quality, trending on artstation, professional";

  // Negative prompt suggestions (for reference - not all APIs support this)
  // "blurry, low quality, watermark, text, logo, distorted"

  return prompt;
}

/**
 * Extract industry from project description
 */
export function extractIndustry(description: string): string {
  const descLower = description.toLowerCase();

  const industryPatterns: [RegExp, string][] = [
    [/saas|software|app|platform/, "saas"],
    [/shop|store|ecommerce|retail|product/, "ecommerce"],
    [/finance|bank|payment|fintech|money/, "fintech"],
    [/health|medical|doctor|patient|wellness/, "healthcare"],
    [/learn|course|education|student|teach/, "education"],
    [/market|advertis|campaign|growth/, "marketing"],
    [/property|real estate|home|house|building/, "real_estate"],
    [/food|restaurant|recipe|cook|cuisine/, "food"],
    [/travel|trip|vacation|hotel|booking/, "travel"],
    [/fitness|gym|workout|exercise|health/, "fitness"],
  ];

  for (const [pattern, industry] of industryPatterns) {
    if (pattern.test(descLower)) {
      return industry;
    }
  }

  return "technology";
}

/**
 * Infer image style from website analysis
 */
export function inferImageStyleFromAnalysis(analysis: {
  components?: {
    icons?: { style?: string };
    cards?: { style?: string };
    buttons?: { style?: string };
  };
  layout?: { overallStyle?: string };
}): ImageStyle {
  const { components, layout } = analysis;

  // Check component styles
  if (components?.icons?.style === "duotone" || components?.icons?.style === "line") {
    return "illustration";
  }
  if (components?.cards?.style === "glass") {
    return "3d";
  }

  // Check layout style
  const overallStyle = layout?.overallStyle?.toLowerCase() || "";
  if (overallStyle.includes("minimal")) {
    return "minimal";
  }
  if (overallStyle.includes("bold") || overallStyle.includes("gradient")) {
    return "abstract";
  }

  return "photorealistic";
}

/**
 * Get appropriate aspect ratio for an image slot
 */
export function getAspectRatioForSlot(slot: ImageSlot): "16:9" | "4:3" | "1:1" | "9:16" {
  const ratios: Record<ImageSlot, "16:9" | "4:3" | "1:1" | "9:16"> = {
    hero: "16:9",
    background: "16:9",
    icon: "1:1",
    avatar: "1:1",
    feature: "4:3",
    product: "4:3",
  };
  return ratios[slot] || "16:9";
}

/**
 * Infer mood from audience type
 */
export function inferMoodFromAudience(audience: string): ImageMood {
  const audienceLower = audience.toLowerCase();

  if (audienceLower.includes("enterprise") || audienceLower.includes("b2b") || audienceLower.includes("corporate")) {
    return "professional";
  }
  if (audienceLower.includes("consumer") || audienceLower.includes("family") || audienceLower.includes("kids")) {
    return "playful";
  }
  if (audienceLower.includes("luxury") || audienceLower.includes("premium") || audienceLower.includes("high-end")) {
    return "luxurious";
  }
  if (audienceLower.includes("developer") || audienceLower.includes("engineer") || audienceLower.includes("tech")) {
    return "technical";
  }

  return "friendly";
}

