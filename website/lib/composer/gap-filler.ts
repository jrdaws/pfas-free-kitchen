/**
 * Gap Filler
 * 
 * When no existing pattern fits a requirement, generates custom React components.
 * Uses AI to create one-off sections that seamlessly integrate with the composition.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  GapFillerInput,
  GapFillerOutput,
  ComposerInput,
  Pattern,
  SectionComposition,
} from "./types";

// ============================================================================
// Prompt Template
// ============================================================================

const GAP_FILLER_TEMPLATE = `You are an expert React developer creating a custom section component.

## Requirement
{{requirement}}

## Project Context
- Name: {{projectName}}
- Description: {{description}}
- Tone: {{tone}}
- Template: {{template}}

## Surrounding Sections
{{surroundings}}

## Existing Patterns (for reference)
{{existingPatterns}}

## Task
Create a custom React component that:
1. Fulfills the specific requirement
2. Matches the visual style of surrounding sections
3. Uses Tailwind CSS for styling
4. Is self-contained (no external dependencies beyond React)
5. Follows dark theme conventions (bg-[#0A0A0A], text-white, etc.)

## Component Requirements
- Use TypeScript
- Use "use client" if needed for interactivity
- Include proper TypeScript interface for props
- Keep it simple and maintainable
- Use semantic HTML

## Output Format
Return valid JSON:
{
  "component": "// Full React component code here",
  "props": {
    // Default prop values
  },
  "patternId": "custom-{{hash}}"
}

## Example Component Structure
\`\`\`tsx
"use client";

interface CustomSectionProps {
  title: string;
  items: Array<{ name: string; value: string }>;
}

export function CustomSection({ title, items }: CustomSectionProps) {
  return (
    <section className="w-full px-6 py-16 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">{title}</h2>
        {/* Component content */}
      </div>
    </section>
  );
}
\`\`\``;

// ============================================================================
// Helpers
// ============================================================================

function formatSurroundings(sections: SectionComposition[]): string {
  if (sections.length === 0) return "No surrounding sections.";
  
  return sections
    .map((s, i) => `${i + 1}. ${s.patternId} (order: ${s.order}, variant: ${s.variant})`)
    .join("\n");
}

function formatExistingPatterns(patterns: Pattern[]): string {
  if (patterns.length === 0) return "No patterns available.";
  
  return patterns
    .slice(0, 10) // Limit to 10 to save tokens
    .map(p => `- ${p.id}: ${p.name} (${p.category})`)
    .join("\n");
}

function generateHash(): string {
  return Math.random().toString(36).substring(2, 8);
}

function buildPrompt(input: GapFillerInput): string {
  const { requirement, context, existingPatterns, surroundingSections } = input;
  
  return GAP_FILLER_TEMPLATE
    .replace(/\{\{requirement\}\}/g, requirement)
    .replace(/\{\{projectName\}\}/g, context.vision.projectName)
    .replace(/\{\{description\}\}/g, context.vision.description)
    .replace(/\{\{tone\}\}/g, context.vision.tone || "professional")
    .replace(/\{\{template\}\}/g, context.template)
    .replace(/\{\{surroundings\}\}/g, formatSurroundings(surroundingSections))
    .replace(/\{\{existingPatterns\}\}/g, formatExistingPatterns(existingPatterns))
    .replace(/\{\{hash\}\}/g, generateHash());
}

function parseResponse(response: string): GapFillerOutput {
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse gap filler response: no JSON found");
  }
  
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      component: parsed.component || "",
      props: parsed.props || {},
      patternId: parsed.patternId || `custom-${generateHash()}`,
    };
  } catch (e) {
    throw new Error(`Failed to parse gap filler response: ${e}`);
  }
}

// ============================================================================
// Fallback Component
// ============================================================================

function generateFallbackComponent(requirement: string, projectName: string): GapFillerOutput {
  const hash = generateHash();
  
  const component = `"use client";

interface CustomSection${hash}Props {
  title: string;
  description: string;
}

export function CustomSection${hash}({ title, description }: CustomSection${hash}Props) {
  return (
    <section className="w-full px-6 py-16 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>
    </section>
  );
}`;

  return {
    component,
    props: {
      title: `${projectName} Custom Section`,
      description: requirement,
    },
    patternId: `custom-${hash}`,
  };
}

// ============================================================================
// Main Export
// ============================================================================

export async function generateCustomSection(
  input: GapFillerInput
): Promise<GapFillerOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const { requirement, context, existingPatterns, surroundingSections } = input;
  
  // If no API key, use fallback
  if (!apiKey) {
    console.warn("[GapFiller] No API key, using fallback component");
    return generateFallbackComponent(requirement, context.vision.projectName);
  }
  
  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(input);
  
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022", // Use Sonnet for code generation quality
      max_tokens: 2048,
      messages: [
        { role: "user", content: prompt },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    return parseResponse(content.text);
  } catch (error) {
    console.error("[GapFiller] AI generation failed, using fallback:", error);
    return generateFallbackComponent(requirement, context.vision.projectName);
  }
}

/**
 * Check if a requirement can be fulfilled by existing patterns
 */
export function canFulfillWithPattern(
  requirement: string,
  patterns: Pattern[]
): Pattern | null {
  const requirementLower = requirement.toLowerCase();
  
  // Simple keyword matching for common requirements
  const keywords: Record<string, string[]> = {
    hero: ["hero", "banner", "welcome", "landing", "intro"],
    features: ["features", "benefits", "capabilities", "what we offer"],
    pricing: ["pricing", "plans", "cost", "subscription"],
    testimonials: ["testimonials", "reviews", "feedback", "customers say"],
    faq: ["faq", "questions", "q&a", "help"],
    cta: ["cta", "call to action", "signup", "get started"],
    footer: ["footer", "bottom", "links"],
    stats: ["stats", "numbers", "metrics", "achievements"],
  };
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => requirementLower.includes(word))) {
      const matchingPattern = patterns.find(p => p.category === category);
      if (matchingPattern) return matchingPattern;
    }
  }
  
  return null;
}

