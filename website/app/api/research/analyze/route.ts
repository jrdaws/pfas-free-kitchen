import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractMultipleUrls, type ExtractedContent } from "@/lib/url-extractor";

// Feature categories from our system
const AVAILABLE_FEATURES = {
  "authentication": ["oauth", "email-password", "magic-link", "mfa", "social-login"],
  "database": ["postgres", "mongodb", "redis", "prisma", "drizzle"],
  "payments": ["stripe", "paypal", "subscriptions", "one-time", "invoicing"],
  "storage": ["file-upload", "image-optimization", "cdn", "s3"],
  "ai": ["chat", "embeddings", "image-generation", "voice", "agents"],
  "communication": ["email", "sms", "push-notifications", "webhooks"],
  "analytics": ["user-tracking", "events", "dashboards", "ab-testing"],
  "ui": ["dark-mode", "responsive", "animations", "accessibility"],
};

const AVAILABLE_TEMPLATES = ["saas", "ecommerce", "portfolio", "blog", "dashboard", "landing"];

interface VisionDocument {
  problem: string;
  audience: {
    type: "b2b" | "b2c" | "internal" | "mixed";
    description?: string;
  };
  businessModel: "subscription" | "one-time" | "freemium" | "marketplace" | "free";
  designStyle: "minimal" | "bold" | "playful" | "corporate" | "dark";
  inspirations: string[];
  requiredFeatures: string[];
  niceToHaveFeatures: string[];
}

interface ResearchRequest {
  domain: string;
  inspirationUrls?: string[];
  vision?: string;
  visionDocument?: VisionDocument;
}

interface UrlAnalysis {
  url: string;
  title: string;
  features: string[];
  designPatterns: string[];
  targetAudience: string;
  keyTakeaways: string[];
}

interface ResearchResponse {
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
      suggestedFeatures: Array<{
        category: string;
        features: string[];
        reason: string;
      }>;
      suggestedIntegrations: string[];
      priorityOrder: string[];
    };
    competitorInsights?: string;
  };
  extractedUrls?: ExtractedContent[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ResearchRequest = await request.json();
    const { domain, inspirationUrls = [], vision, visionDocument } = body;

    if (!domain?.trim()) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Merge inspiration URLs from visionDocument if present
    const allInspirationUrls = [
      ...inspirationUrls,
      ...(visionDocument?.inspirations || []),
    ].filter((url, i, arr) => arr.indexOf(url) === i); // dedupe

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    // Extract content from inspiration URLs (if provided)
    let extractedContent: ExtractedContent[] = [];
    if (allInspirationUrls.length > 0) {
      console.log(`[Research] Extracting content from ${allInspirationUrls.length} URLs...`);
      extractedContent = await extractMultipleUrls(allInspirationUrls.slice(0, 5)); // Limit to 5 URLs
    }

    // Build context from extracted URLs (enhanced with Firecrawl structured data)
    const urlContext = extractedContent
      .filter(ec => ec.success)
      .map(ec => {
        let context = `
### ${ec.title} (${ec.url})
**Source**: ${ec.source === "firecrawl" ? "Firecrawl (structured)" : "Jina Reader"}
${ec.description}`;

        // Add Firecrawl structured data if available
        if (ec.structured) {
          if (ec.structured.features?.length) {
            context += `\n**Extracted Features**: ${ec.structured.features.join(", ")}`;
          }
          if (ec.structured.designPatterns?.length) {
            context += `\n**Design Patterns**: ${ec.structured.designPatterns.join(", ")}`;
          }
          if (ec.structured.targetAudience) {
            context += `\n**Target Audience**: ${ec.structured.targetAudience}`;
          }
          if (ec.structured.techStack?.length) {
            context += `\n**Tech Stack**: ${ec.structured.techStack.join(", ")}`;
          }
          if (ec.structured.pricing) {
            context += `\n**Pricing**: ${ec.structured.pricing}`;
          }
        }

        context += `\n\nContent excerpt:\n${ec.content.slice(0, 1500)}`;
        return context;
      })
      .join("\n\n");

    // Build structured vision context if available
    let visionContext = "";
    if (visionDocument) {
      visionContext = `
## Structured Vision (from Guided Builder)
- **Problem**: ${visionDocument.problem}
- **Target Audience**: ${visionDocument.audience.type}${visionDocument.audience.description ? ` - ${visionDocument.audience.description}` : ""}
- **Business Model**: ${visionDocument.businessModel}
- **Design Style**: ${visionDocument.designStyle}
- **Required Features**: ${visionDocument.requiredFeatures.join(", ") || "None specified"}
- **Nice-to-Have Features**: ${visionDocument.niceToHaveFeatures.join(", ") || "None specified"}`;
    }

    // Build the research prompt
    const prompt = `You are a product research analyst helping a developer build a new web application.

## Context
- **Domain/Industry**: ${domain}
- **User's Vision**: ${vision || "Not specified"}
${visionContext}
${urlContext ? `\n## Inspiration Websites Analyzed\n${urlContext}` : ""}

## Your Task
Analyze this domain and provide actionable recommendations for building a web application.

## Available Templates
${AVAILABLE_TEMPLATES.join(", ")}

## Available Feature Categories
${Object.entries(AVAILABLE_FEATURES)
  .map(([cat, features]) => `- ${cat}: ${features.join(", ")}`)
  .join("\n")}

## Required Output (JSON)
Respond ONLY with valid JSON in this exact structure:
{
  "domainInsights": {
    "overview": "2-3 sentence overview of what apps in this domain typically need",
    "commonFeatures": ["list", "of", "5-8", "common", "features"],
    "competitorPatterns": ["list", "of", "3-5", "patterns", "competitors", "use"],
    "mustHaveIntegrations": ["stripe", "auth", "etc"],
    "targetAudience": "Description of the target audience"
  },
  "urlAnalysis": [
    {
      "url": "analyzed url",
      "title": "site title",
      "features": ["features", "this", "site", "has"],
      "designPatterns": ["design", "patterns", "observed"],
      "targetAudience": "who this site targets",
      "keyTakeaways": ["what", "to", "learn", "from", "this"]
    }
  ],
  "recommendations": {
    "suggestedTemplate": "one of: ${AVAILABLE_TEMPLATES.join(", ")}",
    "templateReason": "Why this template fits",
    "suggestedFeatures": [
      {
        "category": "authentication",
        "features": ["oauth", "magic-link"],
        "reason": "Why these features matter for this domain"
      }
    ],
    "suggestedIntegrations": ["stripe", "uploadthing", "resend"],
    "priorityOrder": ["feature1", "feature2", "feature3"]
  },
  "competitorInsights": "Summary of what competitors do well and opportunities to differentiate"
}

Important:
- Only suggest features from the available list
- Be specific and actionable
- If no URLs were provided, focus on domain analysis
- priorityOrder should list the most important features first`;

    console.log(`[Research] Calling Claude for domain analysis: ${domain}`);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse JSON response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("[Research] Failed to parse AI response:", parseError);
      console.error("[Research] Raw response:", textContent.text.slice(0, 500));
      throw new Error("Failed to parse research results");
    }

    const result: ResearchResponse = {
      success: true,
      analysis: {
        domainInsights: analysis.domainInsights || {
          overview: "",
          commonFeatures: [],
          competitorPatterns: [],
          mustHaveIntegrations: [],
          targetAudience: "",
        },
        urlAnalysis: analysis.urlAnalysis || [],
        recommendations: analysis.recommendations || {
          suggestedTemplate: "saas",
          templateReason: "",
          suggestedFeatures: [],
          suggestedIntegrations: [],
          priorityOrder: [],
        },
        competitorInsights: analysis.competitorInsights,
      },
      extractedUrls: extractedContent,
    };

    console.log(`[Research] Analysis complete for ${domain}`);
    return NextResponse.json(result);

  } catch (error) {
    console.error("[Research] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Research failed",
      },
      { status: 500 }
    );
  }
}

