/**
 * Pattern Recommendation Engine
 * 
 * Suggests patterns based on project description and user preferences.
 * Used for interactive pattern selection in the UI.
 */

import { loadPatternRegistry, scorePattern, type ProjectContext } from "./compose";

export interface PatternRecommendation {
  patternId: string;
  patternName: string;
  category: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  alternatives: {
    patternId: string;
    patternName: string;
    reason: string;
  }[];
}

export interface RecommendationRequest {
  projectDescription: string;
  projectType?: string;
  targetAudience?: string;
  existingPatterns?: string[];
  preferences?: {
    style?: "modern" | "minimal" | "bold" | "classic";
    complexity?: "simple" | "standard" | "complex";
  };
}

/**
 * Extract keywords from description
 */
function extractKeywords(description: string): string[] {
  const keywords: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  // Project type keywords
  const typeKeywords = [
    "saas", "ecommerce", "e-commerce", "shop", "store", "blog",
    "portfolio", "agency", "startup", "enterprise", "b2b", "b2c",
    "marketplace", "platform", "tool", "app", "dashboard"
  ];
  
  for (const keyword of typeKeywords) {
    if (lowerDesc.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  // Feature keywords
  const featureKeywords = [
    "pricing", "subscription", "auth", "login", "signup",
    "dashboard", "analytics", "video", "animation", "waitlist",
    "newsletter", "testimonials", "social", "oauth"
  ];
  
  for (const keyword of featureKeywords) {
    if (lowerDesc.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return [...new Set(keywords)];
}

/**
 * Determine project context from request
 */
function buildContext(request: RecommendationRequest): ProjectContext {
  const keywords = extractKeywords(request.projectDescription);
  
  // Determine type
  let type: ProjectContext["type"] = "custom";
  if (keywords.includes("saas") || keywords.includes("subscription")) {
    type = "saas";
  } else if (keywords.includes("ecommerce") || keywords.includes("shop") || keywords.includes("store")) {
    type = "ecommerce";
  } else if (keywords.includes("blog")) {
    type = "blog";
  } else if (keywords.includes("portfolio")) {
    type = "portfolio";
  } else if (keywords.includes("agency")) {
    type = "agency";
  }
  
  return {
    name: "Project",
    type,
    description: request.projectDescription,
    targetAudience: request.targetAudience,
    features: keywords,
    style: request.preferences?.style,
  };
}

/**
 * Get recommendations for a specific slot
 */
export async function recommendForSlot(
  slotType: string,
  request: RecommendationRequest
): Promise<PatternRecommendation | null> {
  const registry = await loadPatternRegistry();
  const context = buildContext(request);
  
  // Map slot types to categories
  const slotToCategory: Record<string, string> = {
    hero: "landing",
    features: "features",
    pricing: "pricing",
    testimonials: "testimonials",
    cta: "cta",
    faq: "faq",
    auth: "auth",
    dashboard: "dashboard",
  };
  
  const category = slotToCategory[slotType];
  if (!category) {
    return null;
  }
  
  // Find patterns in this category
  const candidates = registry.patterns.filter((p) => p.category === category);
  if (candidates.length === 0) {
    return null;
  }
  
  // Score all candidates
  const scored = candidates.map((pattern) => ({
    pattern,
    score: scorePattern(pattern, context),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  const best = scored[0];
  const alternatives = scored.slice(1, 4);
  
  // Determine confidence
  let confidence: "high" | "medium" | "low" = "medium";
  if (best.score >= 15) {
    confidence = "high";
  } else if (best.score < 5) {
    confidence = "low";
  }
  
  // Generate reason
  let reason = `${best.pattern.name} is ${confidence === "high" ? "highly" : ""} recommended`;
  if (best.pattern.bestFor.includes(context.type)) {
    reason += ` for ${context.type} projects`;
  }
  if (context.style && best.pattern.tags.includes(context.style)) {
    reason += ` with ${context.style} style`;
  }
  
  return {
    patternId: best.pattern.id,
    patternName: best.pattern.name,
    category: best.pattern.category,
    confidence,
    reason,
    alternatives: alternatives.map((alt) => ({
      patternId: alt.pattern.id,
      patternName: alt.pattern.name,
      reason: alt.pattern.description,
    })),
  };
}

/**
 * Get full page recommendations
 */
export async function recommendForPage(
  pagePath: string,
  request: RecommendationRequest
): Promise<PatternRecommendation[]> {
  const recommendations: PatternRecommendation[] = [];
  
  // Determine which slots are needed based on page path
  let slots: string[] = [];
  
  if (pagePath === "/" || pagePath === "/home") {
    slots = ["hero", "features", "testimonials", "cta"];
  } else if (pagePath === "/pricing") {
    slots = ["pricing", "faq"];
  } else if (pagePath.startsWith("/dashboard") || pagePath.startsWith("/app")) {
    slots = ["dashboard"];
  } else if (pagePath === "/login" || pagePath === "/signup") {
    slots = ["auth"];
  }
  
  for (const slot of slots) {
    const rec = await recommendForSlot(slot, request);
    if (rec) {
      recommendations.push(rec);
    }
  }
  
  return recommendations;
}

/**
 * Get all recommendations for a project
 */
export async function recommendForProject(
  request: RecommendationRequest
): Promise<{
  pages: {
    path: string;
    recommendations: PatternRecommendation[];
  }[];
  summary: {
    totalPatterns: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
  };
}> {
  const context = buildContext(request);
  
  // Determine pages based on project type
  const pagePaths: string[] = ["/"];
  
  if (context.type === "saas" || context.features?.includes("pricing")) {
    pagePaths.push("/pricing");
  }
  
  if (context.type === "saas" || context.features?.includes("dashboard")) {
    pagePaths.push("/dashboard");
  }
  
  if (context.features?.includes("auth") || context.features?.includes("login")) {
    pagePaths.push("/login");
  }
  
  // Get recommendations for each page
  const pages = await Promise.all(
    pagePaths.map(async (path) => ({
      path,
      recommendations: await recommendForPage(path, request),
    }))
  );
  
  // Calculate summary
  const allRecs = pages.flatMap((p) => p.recommendations);
  
  return {
    pages,
    summary: {
      totalPatterns: allRecs.length,
      highConfidence: allRecs.filter((r) => r.confidence === "high").length,
      mediumConfidence: allRecs.filter((r) => r.confidence === "medium").length,
      lowConfidence: allRecs.filter((r) => r.confidence === "low").length,
    },
  };
}

export default {
  recommendForSlot,
  recommendForPage,
  recommendForProject,
};

