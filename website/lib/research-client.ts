/**
 * Research API Client
 * Handles domain and URL analysis for project recommendations
 */

export interface UrlAnalysis {
  url: string;
  title: string;
  features: string[];
  designPatterns: string[];
  targetAudience: string;
  keyTakeaways: string[];
}

export interface FeatureRecommendation {
  category: string;
  features: string[];
  reason: string;
}

export interface ResearchResult {
  success: boolean;
  analysis: {
    domainInsights: {
      overview: string;
      commonFeatures: string[];
      competitorPatterns: string[];
      mustHaveIntegrations: string[];
      targetAudience: string;
    };
    urlAnalysis: UrlAnalysis[];
    recommendations: {
      suggestedTemplate: string;
      templateReason: string;
      suggestedFeatures: FeatureRecommendation[];
      suggestedIntegrations: string[];
      priorityOrder: string[];
    };
    competitorInsights?: string;
  };
  error?: string;
}

export interface ResearchParams {
  domain: string;
  inspirationUrls?: string[];
  vision?: string;
}

/**
 * Analyze a domain and inspiration URLs to get feature recommendations
 */
export async function analyzeProject(params: ResearchParams): Promise<ResearchResult> {
  try {
    const response = await fetch("/api/research/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Research Client] Error:", error);
    return {
      success: false,
      analysis: {
        domainInsights: {
          overview: "",
          commonFeatures: [],
          competitorPatterns: [],
          mustHaveIntegrations: [],
          targetAudience: "",
        },
        urlAnalysis: [],
        recommendations: {
          suggestedTemplate: "",
          templateReason: "",
          suggestedFeatures: [],
          suggestedIntegrations: [],
          priorityOrder: [],
        },
      },
      error: error instanceof Error ? error.message : "Research failed",
    };
  }
}

