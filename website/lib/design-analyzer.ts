/**
 * Design Analyzer - AI Vision-based website design analysis
 * 
 * Uses Claude Vision to extract design patterns, typography, and aesthetic
 * information from website screenshots.
 */

// ============================================================================
// Types
// ============================================================================

export interface DesignAnalysis {
  layout: {
    heroStyle: "centered" | "split" | "video" | "minimal";
    navigation: "sticky" | "static" | "transparent";
    sections: string[];
    columnLayout: "single" | "two-column" | "grid" | "bento";
  };
  typography: {
    headingStyle: "bold" | "light" | "serif" | "mono";
    bodyStyle: "readable" | "compact" | "spacious";
    emphasis: "uppercase" | "lowercase" | "mixed";
  };
  aesthetic: {
    overall: "modern" | "minimal" | "playful" | "corporate" | "luxury" | "tech";
    mood: "friendly" | "professional" | "bold" | "calm" | "energetic";
    density: "spacious" | "balanced" | "compact";
  };
  components: {
    buttonStyle: "rounded" | "sharp" | "pill";
    cardStyle: "flat" | "elevated" | "bordered" | "glass";
    imageStyle: "rounded" | "sharp" | "masked" | "full-bleed";
  };
  patternRecommendations: PatternRecommendation[];
}

export interface PatternRecommendation {
  patternId: string;
  reason: string;
  confidence: number;
}

// ============================================================================
// Prompt
// ============================================================================

export const DESIGN_ANALYSIS_PROMPT = `Analyze this website screenshot and extract design details.

Return JSON with this exact structure:
{
  "layout": {
    "heroStyle": "centered" | "split" | "video" | "minimal",
    "navigation": "sticky" | "static" | "transparent",
    "sections": ["list", "of", "section", "types"],
    "columnLayout": "single" | "two-column" | "grid" | "bento"
  },
  "typography": {
    "headingStyle": "bold" | "light" | "serif" | "mono",
    "bodyStyle": "readable" | "compact" | "spacious",
    "emphasis": "uppercase" | "lowercase" | "mixed"
  },
  "aesthetic": {
    "overall": "modern" | "minimal" | "playful" | "corporate" | "luxury" | "tech",
    "mood": "friendly" | "professional" | "bold" | "calm" | "energetic",
    "density": "spacious" | "balanced" | "compact"
  },
  "components": {
    "buttonStyle": "rounded" | "sharp" | "pill",
    "cardStyle": "flat" | "elevated" | "bordered" | "glass",
    "imageStyle": "rounded" | "sharp" | "masked" | "full-bleed"
  },
  "patternRecommendations": [
    {
      "patternId": "hero-split-image",
      "reason": "Site uses left text, right image hero layout",
      "confidence": 95
    }
  ]
}

## Available Pattern IDs
- hero-centered: Centered headline with CTA
- hero-split-image: Text on one side, image on other
- features-grid: 3-column feature cards
- features-alternating: Alternating left/right feature blocks
- pricing-three-tier: Three pricing cards
- testimonials-grid: Grid of testimonial cards
- testimonials-carousel: Sliding testimonials
- cta-simple: Simple call-to-action banner
- faq-accordion: Expandable FAQ section
- footer-multi-column: Multi-column footer with links
- nav-standard: Standard navigation bar
- stats-simple: Statistics display section

Be specific about what you see. List all major sections visible in the screenshot.
Return ONLY valid JSON, no other text.`;

// ============================================================================
// Parser
// ============================================================================

export function parseDesignAnalysis(text: string): DesignAnalysis | null {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("[DesignAnalyzer] No JSON found in response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.layout || !parsed.typography || !parsed.aesthetic || !parsed.components) {
      console.warn("[DesignAnalyzer] Missing required fields in response");
      return null;
    }

    // Return with defaults for missing fields
    return {
      layout: {
        heroStyle: parsed.layout.heroStyle || "centered",
        navigation: parsed.layout.navigation || "sticky",
        sections: parsed.layout.sections || [],
        columnLayout: parsed.layout.columnLayout || "single",
      },
      typography: {
        headingStyle: parsed.typography.headingStyle || "bold",
        bodyStyle: parsed.typography.bodyStyle || "readable",
        emphasis: parsed.typography.emphasis || "mixed",
      },
      aesthetic: {
        overall: parsed.aesthetic.overall || "modern",
        mood: parsed.aesthetic.mood || "professional",
        density: parsed.aesthetic.density || "balanced",
      },
      components: {
        buttonStyle: parsed.components.buttonStyle || "rounded",
        cardStyle: parsed.components.cardStyle || "elevated",
        imageStyle: parsed.components.imageStyle || "rounded",
      },
      patternRecommendations: parsed.patternRecommendations || [],
    };
  } catch (error) {
    console.error("[DesignAnalyzer] Parse error:", error);
    return null;
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Map design analysis to pattern variant
 */
export function mapAestheticToVariant(aesthetic: DesignAnalysis["aesthetic"]): "dark" | "light" | "gradient" {
  // Dark mode for tech/luxury aesthetics
  if (aesthetic.overall === "tech" || aesthetic.overall === "luxury") {
    return "dark";
  }
  // Gradient for playful/energetic moods
  if (aesthetic.mood === "energetic" || aesthetic.overall === "playful") {
    return "gradient";
  }
  // Light for everything else
  return "light";
}

/**
 * Map layout analysis to recommended layout type
 */
export function mapLayoutType(layout: DesignAnalysis["layout"]): string {
  if (layout.columnLayout === "bento") {
    return "layout-bento";
  }
  if (layout.columnLayout === "grid") {
    return "layout-grid";
  }
  return "layout-marketing";
}

/**
 * Generate default design analysis for fallback scenarios
 */
export function getDefaultDesignAnalysis(): DesignAnalysis {
  return {
    layout: {
      heroStyle: "centered",
      navigation: "sticky",
      sections: ["hero", "features", "cta"],
      columnLayout: "single",
    },
    typography: {
      headingStyle: "bold",
      bodyStyle: "readable",
      emphasis: "mixed",
    },
    aesthetic: {
      overall: "modern",
      mood: "professional",
      density: "balanced",
    },
    components: {
      buttonStyle: "rounded",
      cardStyle: "elevated",
      imageStyle: "rounded",
    },
    patternRecommendations: [
      {
        patternId: "hero-centered",
        reason: "Default hero pattern",
        confidence: 50,
      },
      {
        patternId: "features-grid",
        reason: "Default features pattern",
        confidence: 50,
      },
      {
        patternId: "cta-simple",
        reason: "Default CTA pattern",
        confidence: 50,
      },
    ],
  };
}

