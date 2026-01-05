/**
 * Prop Generator AI
 * 
 * Generates personalized props for each pattern based on user's brand and vision.
 * Creates compelling, context-aware content for headlines, descriptions, features, etc.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  PropGeneratorInput,
  PropGeneratorOutput,
  Pattern,
  ComposerInput,
  PatternSlot,
  VisionDocument,
} from "./types";
import { getPatternById } from "./selector";

// ============================================================================
// Prompt Template
// ============================================================================

const PROP_GENERATOR_TEMPLATE = `You are a world-class copywriter generating content for a {{patternId}} component.

## CRITICAL: DO NOT COPY THE DESCRIPTION
The description below is CONTEXT to understand what to build - DO NOT copy it into the content.
Analyze it, understand the product/audience, then write ORIGINAL marketing copy.

## User's Brand
- Name: {{projectName}}
- What they're building: {{description}}
- Target Audience: {{audience}}
- Tone: {{tone}}
- Goals: {{goals}}

## Research Insights (from analyzing their domain/competitors)
{{researchInsights}}

## Recommended Features from Research
{{researchRecommendations}}

## Extracted Content from Inspiration Sites
{{extractedContent}}

## Component: {{patternName}}
Category: {{category}}

## Slots to Fill
{{slots}}

## Your Task
1. ANALYZE the description to understand what product/service this is
2. IDENTIFY the core value proposition
3. GENERATE original, compelling copy that SELLS the product
4. DO NOT copy the description - write fresh marketing copy

## Copy Writing Rules
1. Headlines: 3-8 words MAX. Punchy. Benefit-focused. NOT a description.
   - BAD: "A platform for sharing and celebrating your furry friends"
   - GOOD: "Dress Up. Show Off. Win Hearts."
   
2. Subheadlines: 10-20 words. Expand on the headline with specific value.
   - BAD: Copy of the vision statement
   - GOOD: "Join 50,000+ pet parents showcasing their costumed companions"

3. Features: Based on the RESEARCH insights, not generic features
   - Use icons that match the actual feature (camera, heart, trophy, etc.)
   
4. CTAs: Action-oriented, specific to the product
   - BAD: "Get Started"  
   - GOOD: "Upload Your First Photo" or "Join the Pack"

5. Testimonials: Make them specific to the product domain

## Tone Guidelines
- professional: Clear, trustworthy, sophisticated
- friendly: Warm, approachable, conversational  
- playful: Fun, energetic, creative (BEST for pet/social apps)
- luxurious: Elegant, exclusive, premium
- technical: Precise, detailed, expert
- casual: Relaxed, simple, direct

## Output Format
Return valid JSON with props for each slot:
{
  "headline": "Short Punchy Headline",
  "subheadline": "Slightly longer but still concise value proposition",
  "ctaText": "Specific Action",
  "features": [
    { "title": "Feature Name", "description": "One line benefit", "icon": "relevant-icon" }
  ]
}

Only include the slots listed above. Do not add extra properties.`;

// ============================================================================
// Slot Formatting
// ============================================================================

function formatSlots(slots: PatternSlot[]): string {
  return slots
    .map(slot => {
      let description = `- ${slot.name} (${slot.type})`;
      if (slot.required) description += " [REQUIRED]";
      if (slot.maxLength) description += ` max ${slot.maxLength} chars`;
      if (slot.description) description += `: ${slot.description}`;
      return description;
    })
    .join("\n");
}

function formatGoals(goals?: string[]): string {
  if (!goals || goals.length === 0) return "Not specified";
  return goals.join(", ");
}

// ============================================================================
// Build Prompt
// ============================================================================

function formatResearchInsights(research?: ComposerInput["research"]): string {
  if (!research?.insights || research.insights.length === 0) {
    return "No research insights available";
  }
  return research.insights.slice(0, 10).map(i => `- ${i}`).join("\n");
}

function formatResearchRecommendations(research?: ComposerInput["research"]): string {
  if (!research?.recommendations || research.recommendations.length === 0) {
    return "No specific recommendations";
  }
  return research.recommendations.slice(0, 5).map(r => 
    `- ${r.category}: ${r.features.join(", ")} (${r.reason})`
  ).join("\n");
}

function formatExtractedContent(research?: ComposerInput["research"]): string {
  if (!research?.extractedContent) {
    return "No extracted content";
  }
  // Limit to first 500 chars to avoid token bloat
  return research.extractedContent.substring(0, 500);
}

function buildPrompt(pattern: Pattern, context: ComposerInput): string {
  const { vision, research } = context;
  
  return PROP_GENERATOR_TEMPLATE
    .replace(/\{\{patternId\}\}/g, pattern.id)
    .replace(/\{\{patternName\}\}/g, pattern.name)
    .replace(/\{\{category\}\}/g, pattern.category)
    .replace(/\{\{projectName\}\}/g, vision.projectName)
    .replace(/\{\{description\}\}/g, vision.description)
    .replace(/\{\{audience\}\}/g, vision.audience || "general audience")
    .replace(/\{\{tone\}\}/g, vision.tone || "professional")
    .replace(/\{\{goals\}\}/g, formatGoals(vision.goals))
    .replace(/\{\{slots\}\}/g, formatSlots(pattern.slots))
    .replace(/\{\{researchInsights\}\}/g, formatResearchInsights(research))
    .replace(/\{\{researchRecommendations\}\}/g, formatResearchRecommendations(research))
    .replace(/\{\{extractedContent\}\}/g, formatExtractedContent(research));
}

// ============================================================================
// Response Parsing
// ============================================================================

function parseResponse(response: string): Record<string, unknown> {
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse prop generator response: no JSON found");
  }
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Failed to parse prop generator response: ${e}`);
  }
}

// ============================================================================
// Default Props Generation (Fallback)
// ============================================================================

function generateDefaultProps(pattern: Pattern, vision: VisionDocument): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  
  for (const slot of pattern.slots) {
    switch (slot.type) {
      case "text":
        props[slot.name] = getDefaultText(slot.name, vision);
        break;
      case "richText":
        props[slot.name] = getDefaultRichText(slot.name, vision);
        break;
      case "boolean":
        props[slot.name] = slot.defaultValue ?? true;
        break;
      case "number":
        props[slot.name] = slot.defaultValue ?? 0;
        break;
      case "array":
        props[slot.name] = getDefaultArray(slot.name, vision);
        break;
      case "image":
        props[slot.name] = "/images/placeholder.webp";
        break;
    }
  }
  
  return props;
}

function getDefaultText(slotName: string, vision: VisionDocument): string {
  const name = vision.projectName;
  
  // Generate contextual defaults - DO NOT copy vision.description
  const defaults: Record<string, string> = {
    headline: `Welcome to ${name}`,
    subheadline: `Start building something amazing today`,
    title: name,
    ctaText: "Get Started",
    ctaLink: "/signup",
    secondaryCta: "Learn More",
    projectName: name,
    description: `Discover what ${name} can do for you`, // NOT the vision
    imageAlt: `${name} product image`,
  };
  
  return defaults[slotName] || name;
}

function getDefaultRichText(slotName: string, vision: VisionDocument): string {
  // DO NOT copy vision.description - generate generic fallback
  return `Discover the power of ${vision.projectName}`;
}

function getDefaultArray(slotName: string, vision: VisionDocument): unknown[] {
  const name = vision.projectName;
  
  switch (slotName) {
    case "features":
      return [
        { title: "Fast & Reliable", description: "Built for speed and performance", icon: "zap" },
        { title: "Secure by Default", description: "Enterprise-grade security included", icon: "shield" },
        { title: "Easy Integration", description: "Works with your existing tools", icon: "puzzle" },
      ];
    case "testimonials":
      return [
        { quote: `${name} transformed our workflow completely.`, author: "Sarah Johnson", role: "CEO", company: "TechCorp" },
        { quote: "The best solution we've found for our team.", author: "Mike Chen", role: "CTO", company: "StartupXYZ" },
        { quote: "Incredible support and amazing results.", author: "Emily Davis", role: "Product Lead", company: "InnovateCo" },
      ];
    case "plans":
      return [
        { name: "Starter", price: 0, period: "month", features: ["5 projects", "Basic support", "1GB storage"] },
        { name: "Pro", price: 29, period: "month", features: ["Unlimited projects", "Priority support", "10GB storage", "API access"], highlighted: true },
        { name: "Enterprise", price: 99, period: "month", features: ["Everything in Pro", "Dedicated support", "Unlimited storage", "Custom integrations"] },
      ];
    case "items": // FAQ items
      return [
        { question: `What is ${name}?`, answer: vision.description || `${name} is a modern solution for your needs.` },
        { question: "How do I get started?", answer: "Simply sign up for a free account and follow our quick setup guide." },
        { question: "Is there a free trial?", answer: "Yes! We offer a 14-day free trial with full access to all features." },
      ];
    case "links":
      return ["Home", "Features", "Pricing", "About", "Contact"];
    case "stats":
      return [
        { label: "Active Users", value: "10,000+" },
        { label: "Projects Created", value: "50,000+" },
        { label: "Uptime", value: "99.9%" },
        { label: "Support Rating", value: "4.9/5" },
      ];
    default:
      return [];
  }
}

// ============================================================================
// Main Export
// ============================================================================

export async function generatePatternProps(
  input: PropGeneratorInput
): Promise<PropGeneratorOutput> {
  const { pattern, context } = input;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // If no API key, use fallback
  if (!apiKey) {
    console.warn("[PropGenerator] No API key, using default props");
    return {
      props: generateDefaultProps(pattern, context.vision),
      tokensUsed: 0,
    };
  }
  
  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(pattern, context);
  
  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        { role: "user", content: prompt },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
    
    return {
      props: parseResponse(content.text),
      tokensUsed,
    };
  } catch (error) {
    console.error("[PropGenerator] AI generation failed, using defaults:", error);
    return {
      props: generateDefaultProps(pattern, context.vision),
      tokensUsed: 0,
    };
  }
}

export async function generatePropsForPattern(
  patternId: string,
  context: ComposerInput,
  sectionIndex: number = 0
): Promise<PropGeneratorOutput> {
  const pattern = getPatternById(patternId);
  
  if (!pattern) {
    console.warn(`[PropGenerator] Pattern not found: ${patternId}`);
    return {
      props: { projectName: context.vision.projectName },
      tokensUsed: 0,
    };
  }
  
  return generatePatternProps({ pattern, context, sectionIndex });
}

