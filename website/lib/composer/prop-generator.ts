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

const PROP_GENERATOR_TEMPLATE = `You are generating personalized content for a {{patternId}} component.

## User's Brand
- Name: {{projectName}}
- Description: {{description}}
- Audience: {{audience}}
- Tone: {{tone}}
- Goals: {{goals}}

## Component: {{patternName}}
Category: {{category}}

## Slots to Fill
{{slots}}

## Task
Generate compelling, personalized content for each slot.

## Rules
1. Use the ACTUAL brand name "{{projectName}}" - never use placeholders like "YourBrand"
2. Match the tone to their audience ({{tone}})
3. Keep copy concise but impactful
4. Headlines should be benefit-focused, not feature-focused
5. CTAs should create urgency or excitement
6. If it's an array slot, generate 3-6 realistic items

## Tone Guidelines
- professional: Clear, trustworthy, sophisticated
- friendly: Warm, approachable, conversational
- playful: Fun, energetic, creative
- luxurious: Elegant, exclusive, premium
- technical: Precise, detailed, expert
- casual: Relaxed, simple, direct

## Output Format
Return valid JSON with props for each slot:
{
  "headline": "Transform Your Business with {{projectName}}",
  "subheadline": "...",
  "ctaText": "Get Started Free",
  "features": [
    { "title": "...", "description": "...", "icon": "rocket" },
    ...
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

function buildPrompt(pattern: Pattern, context: ComposerInput): string {
  const { vision } = context;
  
  return PROP_GENERATOR_TEMPLATE
    .replace(/\{\{patternId\}\}/g, pattern.id)
    .replace(/\{\{patternName\}\}/g, pattern.name)
    .replace(/\{\{category\}\}/g, pattern.category)
    .replace(/\{\{projectName\}\}/g, vision.projectName)
    .replace(/\{\{description\}\}/g, vision.description)
    .replace(/\{\{audience\}\}/g, vision.audience || "general audience")
    .replace(/\{\{tone\}\}/g, vision.tone || "professional")
    .replace(/\{\{goals\}\}/g, formatGoals(vision.goals))
    .replace(/\{\{slots\}\}/g, formatSlots(pattern.slots));
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
  
  const defaults: Record<string, string> = {
    headline: `Welcome to ${name}`,
    subheadline: vision.description || `Discover what ${name} can do for you`,
    title: name,
    ctaText: "Get Started",
    ctaLink: "/signup",
    secondaryCta: "Learn More",
    projectName: name,
    description: vision.description || "",
    imageAlt: `${name} product image`,
  };
  
  return defaults[slotName] || name;
}

function getDefaultRichText(slotName: string, vision: VisionDocument): string {
  return vision.description || `Welcome to ${vision.projectName}`;
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

