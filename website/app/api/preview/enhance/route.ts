import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, ErrorCodes } from "@/lib/api-errors";
import { buildPreviewPrompt, parsePreviewResponse, mergeWithDefaults, generateFallbackProps, UserConfig } from "@/lib/ai/preview-generator";
import { getTemplateComposition } from "@/lib/preview/template-compositions";
import { handleApiError } from "@/lib/api-wrapper";

/**
 * POST /api/preview/enhance
 * 
 * Generates AI-enhanced component props based on user configuration.
 * AI outputs JSON props, not raw HTML.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const userConfig: UserConfig = {
      template: body.template || "saas",
      projectName: body.projectName || "My Project",
      vision: body.vision,
      mission: body.mission,
      description: body.description,
      inspiration: body.inspiration,
      integrations: body.integrations || {},
    };

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY || body.userApiKey;
    
    if (!apiKey) {
      // Return fallback props with suggested section order
      const fallbackProps = generateFallbackProps(userConfig);
      const composition = getTemplateComposition(userConfig.template);
      
      return apiSuccess({
        componentProps: fallbackProps,
        sectionOrder: getSuggestedOrder(userConfig.template),
        source: "fallback",
        message: "Using default props (no API key configured)",
      });
    }

    // Build the prompt
    const prompt = buildPreviewPrompt(userConfig);

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Fast model for preview
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Preview Enhance] Anthropic API error:", errorText);
      
      // Return fallback on API error
      const fallbackProps = generateFallbackProps(userConfig);
      return apiSuccess({
        componentProps: fallbackProps,
        sectionOrder: getSuggestedOrder(userConfig.template),
        source: "fallback",
        message: "AI unavailable, using default props",
      });
    }

    const data = await response.json();
    const aiText = data.content?.[0]?.text || "";

    // Parse AI response
    let aiProps: Record<string, Record<string, unknown>>;
    try {
      aiProps = parsePreviewResponse(aiText);
    } catch {
      console.error("[Preview Enhance] Failed to parse AI response");
      const fallbackProps = generateFallbackProps(userConfig);
      return apiSuccess({
        componentProps: fallbackProps,
        sectionOrder: getSuggestedOrder(userConfig.template),
        source: "fallback",
        message: "Failed to parse AI response, using defaults",
      });
    }

    // Merge with defaults
    const composition = getTemplateComposition(userConfig.template);
    const mergedProps = mergeWithDefaults(aiProps, composition);

    // Generate suggested section order based on content
    const sectionOrder = generateSectionOrder(userConfig, aiProps);

    return apiSuccess({
      componentProps: mergedProps,
      sectionOrder,
      source: "ai",
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    });

  } catch (error) {
    console.error("[Preview Enhance Error]", error);
    return handleApiError(error, "anthropic");
  }
}

/**
 * Generate section order based on template and user context
 */
function generateSectionOrder(
  userConfig: UserConfig,
  aiProps: Record<string, Record<string, unknown>>
): string[] {
  const composition = getTemplateComposition(userConfig.template);
  const baseOrder = composition.sections.map(s => s.component);

  // Customize order based on template type
  switch (userConfig.template) {
    case "ecommerce":
      // E-commerce: Hero → Products → Features → Testimonials → CTA → Footer
      return reorderSections(baseOrder, [
        "Nav",
        "Hero",
        "ProductGrid",
        "FeatureCards",
        "Testimonials",
        "CTA",
        "Footer",
      ]);

    case "saas":
      // SaaS: Hero → Features → Pricing → Testimonials → FAQ → CTA → Footer
      return reorderSections(baseOrder, [
        "Nav",
        "Hero",
        "FeatureCards",
        "PricingTable",
        "Testimonials",
        "FAQ",
        "CTA",
        "Footer",
      ]);

    case "landing-page":
      // If user mentions pricing, put it after features
      if (userConfig.description?.toLowerCase().includes("pricing")) {
        return reorderSections(baseOrder, [
          "Nav",
          "Hero",
          "FeatureCards",
          "PricingTable",
          "Testimonials",
          "FAQ",
          "CTA",
          "Footer",
        ]);
      }
      // Default: Social proof earlier
      return reorderSections(baseOrder, [
        "Nav",
        "Hero",
        "FeatureCards",
        "Testimonials",
        "FAQ",
        "CTA",
        "Footer",
      ]);

    case "blog":
      return reorderSections(baseOrder, [
        "Nav",
        "Hero",
        "BlogPostList",
        "CTA",
        "Footer",
      ]);

    default:
      return baseOrder;
  }
}

/**
 * Reorder sections while keeping only those in baseOrder
 */
function reorderSections(baseOrder: string[], preferredOrder: string[]): string[] {
  // Get sections that exist in both arrays, in preferred order
  const reordered = preferredOrder.filter(s => baseOrder.includes(s));
  
  // Add any remaining sections from baseOrder
  const remaining = baseOrder.filter(s => !reordered.includes(s));
  
  return [...reordered, ...remaining];
}

/**
 * Get suggested section order for a template
 */
function getSuggestedOrder(template: string): string[] {
  const composition = getTemplateComposition(template);
  return composition.sections.map(s => s.component);
}

