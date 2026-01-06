// Types for AI Configuration Suggester

export interface SuggestConfigRequest {
  description: string
  context?: {
    budget?: "low" | "medium" | "high"
    timeline?: "fast" | "normal" | "flexible"
    technicalSkill?: "beginner" | "intermediate" | "advanced"
  }
}

export interface SuggestConfigResponse {
  success: boolean
  suggestions: ConfigSuggestions
  questionsToAsk: string[]
  processingTime: number
}

export interface ConfigSuggestions {
  // Target Audience
  audience: {
    primary: string
    secondary?: string
    painPoints: string[]
    goals: string[]
    confidence: number
    reasoning: string
  }

  // Design Preferences
  design: {
    aesthetic: "minimal" | "bold" | "playful" | "luxurious" | "corporate" | "technical"
    colorMode: "dark" | "light" | "system"
    suggestedPrimaryColor: string
    typography: "modern" | "classic" | "geometric" | "humanist"
    imagery: "photography" | "illustrations" | "3d" | "abstract" | "none"
    confidence: number
    reasoning: string
  }

  // Features
  features: {
    required: string[]
    niceToHave: string[]
    excluded: string[]
    confidence: number
    reasoning: string
  }

  // Monetization
  monetization: {
    model: "freemium" | "subscription" | "one-time" | "marketplace" | "free" | "advertising"
    suggestedTiers: number
    priceRange?: { low: number; high: number }
    confidence: number
    reasoning: string
  }

  // Pages
  pages: {
    required: string[]
    optional: string[]
    confidence: number
    reasoning: string
  }

  // Template
  template: {
    recommended: string
    alternatives: string[]
    confidence: number
    reasoning: string
  }

  // Inspiration
  inspiration: {
    suggestedUrls: string[]
    industry: string
    competitors: string[]
    confidence: number
    reasoning: string
  }

  // Integrations
  integrations: {
    recommended: Record<string, string>
    optional: string[]
    confidence: number
    reasoning: string
  }

  // Overall
  overallConfidence: number
  summary: string
}

// Helper to get confidence level
export function getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.8) return "high"
  if (confidence >= 0.5) return "medium"
  return "low"
}

// Helper to get confidence color
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-500"
  if (confidence >= 0.5) return "text-yellow-500"
  return "text-red-500"
}

