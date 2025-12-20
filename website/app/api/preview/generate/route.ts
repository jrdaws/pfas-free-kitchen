import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Rate limiting: 5 previews per session in demo mode
const DEMO_RATE_LIMIT = 5;
const sessionUsage = new Map<string, number>();

interface GeneratePreviewRequest {
  template: string;
  integrations: Record<string, string>;
  inspirations: Array<{ type: string; value: string; preview?: string }>;
  description: string;
  userApiKey?: string;
  sessionId: string;
  seed?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePreviewRequest = await request.json();
    const {
      template,
      integrations,
      inspirations,
      description,
      userApiKey,
      sessionId,
      seed,
    } = body;

    // Validate required fields
    if (!template) {
      return NextResponse.json(
        { error: "Template is required" },
        { status: 400 }
      );
    }

    // Rate limiting for demo mode
    if (!userApiKey) {
      const usage = sessionUsage.get(sessionId) || 0;
      if (usage >= DEMO_RATE_LIMIT) {
        return NextResponse.json(
          {
            error: "Demo limit reached",
            message: `You've reached the demo limit of ${DEMO_RATE_LIMIT} previews. Add your Anthropic API key in the settings to continue.`,
            rateLimited: true,
          },
          { status: 429 }
        );
      }
      sessionUsage.set(sessionId, usage + 1);
    }

    // Initialize Anthropic client
    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "No API key available",
          message: "Please provide your Anthropic API key to generate previews.",
        },
        { status: 401 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    // Construct system prompt
    const systemPrompt = buildSystemPrompt(template, integrations);

    // Construct user prompt
    const userPrompt = buildUserPrompt(
      template,
      integrations,
      inspirations,
      description
    );

    // Call Claude API - using claude-sonnet-4-20250514 (latest Sonnet model)
    // Fallback to claude-3-5-sonnet-latest if the specific version fails
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: seed ? 0 : 0.3, // Deterministic if seed provided
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract HTML from response
    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response format from Claude");
    }

    const html = extractHtmlFromResponse(content.text);

    return NextResponse.json({
      success: true,
      html,
      seed: seed || Date.now(),
      usage: message.usage,
      remainingDemoGenerations: userApiKey
        ? null
        : DEMO_RATE_LIMIT - (sessionUsage.get(sessionId) || 0),
    });
  } catch (error: any) {
    console.error("Preview generation error:", error);

    return NextResponse.json(
      {
        error: "Generation failed",
        message: error.message || "Failed to generate preview. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  template: string,
  integrations: Record<string, string>
): string {
  const integrationsDesc = Object.entries(integrations)
    .filter(([_, value]) => value)
    .map(([type, provider]) => `${type}: ${provider}`)
    .join(", ");

  return `You are an expert web designer creating preview mockups for dawson-does-framework projects.

FRAMEWORK CONTEXT:
- Framework: Next.js 15 with App Router, React 19, TypeScript
- Styling: Tailwind CSS with terminal aesthetic
- Template: ${template}
- Selected Integrations: ${integrationsDesc || "none"}

TERMINAL AESTHETIC:
- Background: #0a0e14 (dark terminal)
- Primary text: #00ff41 (matrix green)
- Accent: #00d9ff (cyan)
- Borders: green/cyan with glow effects
- Font: Monospace (JetBrains Mono style)
- Windows have terminal-style title bars with colored dots

YOUR TASK:
Generate a complete, self-contained HTML preview that demonstrates what the user's project will look like.

OUTPUT REQUIREMENTS:
1. Complete HTML document with <!DOCTYPE html>
2. Include Tailwind CSS via CDN
3. Inline all styles (no external stylesheets)
4. Use the terminal aesthetic consistently
5. Create realistic content that matches the template type
6. Show integration points visually (auth buttons, payment forms, etc.)
7. Make it visually impressive but maintain the terminal theme
8. Include navigation, hero section, and key features
9. Responsive design (mobile-friendly)
10. No JavaScript interactions needed (static preview)

OUTPUT FORMAT:
Return ONLY the HTML code, wrapped in a code block:

\`\`\`html
<!DOCTYPE html>
<html>
...
</html>
\`\`\`

Do not include explanations before or after the code.`;
}

function buildUserPrompt(
  template: string,
  integrations: Record<string, string>,
  inspirations: Array<{ type: string; value: string; preview?: string }>,
  description: string
): string {
  let prompt = `Generate a preview for a ${template} project.\n\n`;

  // Add integrations context
  const integrationsList = Object.entries(integrations)
    .filter(([_, value]) => value)
    .map(([type, provider]) => `- ${type}: ${provider}`)
    .join("\n");

  if (integrationsList) {
    prompt += `INTEGRATIONS TO SHOWCASE:\n${integrationsList}\n\n`;
  }

  // Add inspirations
  if (inspirations.length > 0) {
    prompt += `USER INSPIRATIONS:\n`;
    inspirations.forEach((inspiration, idx) => {
      if (inspiration.type === "url") {
        prompt += `${idx + 1}. URL Reference: ${inspiration.value}\n`;
      } else if (inspiration.type === "image") {
        prompt += `${idx + 1}. Image: ${inspiration.value} (user uploaded design reference)\n`;
      } else if (inspiration.type === "figma") {
        prompt += `${idx + 1}. Figma Link: ${inspiration.value}\n`;
      }
    });
    prompt += `\n`;
  }

  // Add user description
  if (description.trim()) {
    prompt += `USER DESCRIPTION:\n${description}\n\n`;
  }

  // Template-specific guidance
  prompt += getTemplateGuidance(template);

  prompt += `\nGenerate a visually stunning preview that incorporates these elements while maintaining the terminal aesthetic.`;

  return prompt;
}

function getTemplateGuidance(template: string): string {
  const guidance: Record<string, string> = {
    saas: `TEMPLATE GUIDANCE (SaaS Starter):
- Hero section with value proposition and terminal-styled CTA
- Features grid showcasing key capabilities
- Pricing cards with terminal window styling
- Sign-up/Login buttons (auth integration)
- Dashboard preview with metrics
- Footer with links`,

    ecommerce: `TEMPLATE GUIDANCE (E-commerce):
- Product catalog grid with terminal-styled cards
- Shopping cart icon with count
- Product detail view with "Add to Cart" button
- Payment/checkout section (Stripe integration visual)
- Category navigation
- Search bar with terminal aesthetic`,

    blog: `TEMPLATE GUIDANCE (Blog):
- Article list with terminal-styled post cards
- Post title, date, author, tags
- Featured post with larger display
- Sidebar with categories and recent posts
- Newsletter signup form (email integration visual)
- Syntax-highlighted code blocks`,

    dashboard: `TEMPLATE GUIDANCE (Dashboard):
- Metrics cards with terminal-styled stats
- Charts/graphs with terminal colors (green/cyan)
- Data tables with monospace font
- Sidebar navigation with icons
- Real-time data indicators
- Settings/profile section`,

    "api-backend": `TEMPLATE GUIDANCE (API Backend):
- API documentation page
- Endpoint list with terminal-styled cards
- Code examples in terminal windows
- Authentication section showing API keys
- Rate limiting info
- Response examples with JSON formatting`,

    directory: `TEMPLATE GUIDANCE (Directory):
- Listing grid with terminal-styled item cards
- Search and filter controls
- Category tags with terminal colors
- Detail view with specifications
- Submit/Add listing button
- Pagination controls`,
  };

  return guidance[template] || "Create an impressive landing page for this template type.";
}

function extractHtmlFromResponse(text: string): string {
  // Extract HTML from markdown code block
  const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }

  // Fallback: look for <!DOCTYPE or <html
  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    return text.trim();
  }

  throw new Error("Could not extract HTML from Claude's response");
}
