import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, isRedisAvailable } from "@/lib/rate-limiter";
import crypto from "crypto";

interface GeneratePreviewRequest {
  template: string;
  projectName?: string;
  integrations: Record<string, string>;
  inspirations: Array<{ type: string; value: string; preview?: string }>;
  description: string;
  vision?: string;
  mission?: string;
  userApiKey?: string;
  sessionId: string;
  seed?: number;
}

interface CacheEntry {
  html: string;
  components: string[];
  generatedAt: string;
  expiresAt: number;
}

// In-memory cache for preview results (production should use Redis)
const previewCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Cost control: Maximum tokens to prevent runaway generations
// Reduced from 4096 to 2000 for performance optimization (2025-12-22)
// Trade-off: Simpler previews focused on key components vs full multi-page generation
const MAX_TOKENS = 2000;
const MAX_INPUT_LENGTH = 10000; // Prevent extremely long prompts

/**
 * Generate a cache key from request parameters
 * Includes all parameters that affect the generated output
 */
function generateCacheKey(params: {
  template: string;
  projectName?: string;
  integrations: Record<string, string>;
  inspirations: Array<{ type: string; value: string; preview?: string }>;
  description: string;
  vision?: string;
  mission?: string;
  seed?: number;
}): string {
  const keyData = JSON.stringify({
    template: params.template,
    projectName: params.projectName || "",
    integrations: params.integrations,
    // Include inspirations to ensure different inspirations produce different cache keys
    inspirations: params.inspirations.map(i => ({ type: i.type, value: i.value })),
    description: params.description,
    vision: params.vision || "",
    mission: params.mission || "",
    seed: params.seed,
  });
  return crypto.createHash("sha256").update(keyData).digest("hex").slice(0, 16);
}

/**
 * Extract component names from generated HTML
 */
function extractComponents(html: string): string[] {
  const components: string[] = [];
  
  // Look for common section patterns in the HTML
  if (/<(nav|header)/i.test(html)) components.push("Nav");
  if (/hero|jumbotron/i.test(html)) components.push("Hero");
  if (/features?(-section)?/i.test(html) || /feature-grid/i.test(html)) components.push("Features");
  if (/pricing/i.test(html)) components.push("Pricing");
  if (/testimonial/i.test(html)) components.push("Testimonials");
  if (/<footer/i.test(html)) components.push("Footer");
  if (/dashboard|metrics|stats/i.test(html)) components.push("Dashboard");
  if (/sign.?(in|up)|log.?(in|out)|auth/i.test(html)) components.push("Auth");
  if (/cart|checkout/i.test(html)) components.push("Cart");
  if (/product/i.test(html)) components.push("ProductGrid");
  if (/cta|call.?to.?action/i.test(html)) components.push("CTA");
  
  return components.length > 0 ? components : ["Hero", "Nav", "Footer"];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: GeneratePreviewRequest = await request.json();
    const {
      template,
      projectName,
      integrations,
      inspirations,
      description,
      vision,
      mission,
      userApiKey,
      sessionId,
      seed,
    } = body;

    // Validate required fields
    if (!template) {
      return NextResponse.json(
        { error: "Validation failed", message: "Template is required" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Validation failed", message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Validate and normalize inspirations (ensure it's always an array)
    const safeInspirations = Array.isArray(inspirations) ? inspirations : [];

    // Cost control: Limit input size
    const descriptionLength = description?.length || 0;
    if (descriptionLength > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        {
          error: "Input too long",
          message: `Description must be less than ${MAX_INPUT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // Check cache first (only for deterministic requests with explicit seed)
    // Non-seeded requests use temperature 0.3 and should produce varied outputs
    let cacheKey: string | null = null;
    if (seed !== undefined) {
      cacheKey = generateCacheKey({
        template,
        projectName,
        integrations,
        inspirations: safeInspirations,
        description,
        vision,
        mission,
        seed,
      });

      const cachedResult = previewCache.get(cacheKey);
      if (cachedResult && cachedResult.expiresAt > Date.now()) {
        console.log(`[Preview Cache Hit] ${template} | ${Date.now() - startTime}ms`);
        return NextResponse.json({
          success: true,
          html: cachedResult.html,
          components: cachedResult.components,
          generatedAt: cachedResult.generatedAt,
          cached: true,
          remainingDemoGenerations: null, // Cache hit doesn't affect rate limit
        });
      }
    }

    // Rate limiting check (uses Redis in production)
    const rateLimitResult = await checkRateLimit(sessionId, userApiKey);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've reached the demo limit. Add your Anthropic API key for unlimited access.`,
          rateLimited: true,
          resetAt: rateLimitResult.resetAt,
          remaining: 0,
        },
        { status: 429 }
      );
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
    const systemPrompt = buildSystemPrompt(template, integrations, projectName);

    // Construct user prompt
    const userPrompt = buildUserPrompt(
      template,
      integrations,
      safeInspirations,
      description,
      vision,
      mission,
      projectName
    );

    // Call Claude API - using claude-3-haiku-20240307 for fast generation
    // Note: Switched from Sonnet 4 to Haiku for 10x speed improvement (41s -> ~4s)
    // Trade-off: Slightly lower quality, but acceptable for preview purposes
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: MAX_TOKENS,
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
    const components = extractComponents(html);
    const generatedAt = new Date().toISOString();

    // Cache the result only for deterministic (seeded) requests
    if (cacheKey) {
      previewCache.set(cacheKey, {
        html,
        components,
        generatedAt,
        expiresAt: Date.now() + CACHE_TTL,
      });
    }

    // Clean up old cache entries periodically
    if (previewCache.size > 100) {
      const now = Date.now();
      for (const [key, entry] of previewCache.entries()) {
        if (entry.expiresAt < now) {
          previewCache.delete(key);
        }
      }
    }

    // Log success metrics (for monitoring)
    const duration = Date.now() - startTime;
    console.log(`[Preview Generated] ${template} | ${duration}ms | ${message.usage.input_tokens}/${message.usage.output_tokens} tokens | Redis: ${isRedisAvailable()}`);

    return NextResponse.json({
      success: true,
      html,
      components,
      generatedAt,
      seed: seed || Date.now(),
      usage: message.usage,
      remainingDemoGenerations: rateLimitResult.remaining >= 0 ? rateLimitResult.remaining : null,
      redisEnabled: isRedisAvailable(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Enhanced error handling with specific error types
    if (error?.status === 401) {
      console.error(`[API Error 401] Invalid API key | ${duration}ms`);
      return NextResponse.json(
        {
          error: "Invalid API key",
          message: "The API key provided is invalid. Please check your key and try again.",
          details: "Get a valid key from https://console.anthropic.com",
        },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      console.error(`[API Error 429] Anthropic rate limit | ${duration}ms`);
      return NextResponse.json(
        {
          error: "Anthropic rate limit exceeded",
          message: "Too many requests to Claude API. Please try again in a few moments.",
        },
        { status: 429 }
      );
    }

    if (error?.status === 400) {
      console.error(`[API Error 400] Bad request | ${duration}ms`, error.message);
      return NextResponse.json(
        {
          error: "Invalid request",
          message: error.message || "The request was invalid. Please check your inputs.",
        },
        { status: 400 }
      );
    }

    if (error?.status === 500 || error?.status === 503) {
      console.error(`[API Error ${error.status}] Anthropic service error | ${duration}ms`);
      return NextResponse.json(
        {
          error: "Service temporarily unavailable",
          message: "Claude API is temporarily unavailable. Please try again in a few moments.",
        },
        { status: 503 }
      );
    }

    // Generic error handling
    console.error(`[Preview Error] ${duration}ms`, error);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        error: "Generation failed",
        message: "Failed to generate preview. Please try again.",
        details: isDevelopment ? error.message : undefined,
        stack: isDevelopment ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  template: string,
  integrations: Record<string, string>,
  projectName?: string
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
- Project Name: ${projectName || "My App"}
- Selected Integrations: ${integrationsDesc || "none"}

TERMINAL AESTHETIC - STRICTLY FOLLOW THESE COLORS:
- Background: #0a0e14 (MUST use this exact dark terminal background for body and main sections)
- Primary text: #00ff41 (MUST use this exact matrix green for all headings and primary text)
- Accent text: #00d9ff (MUST use this exact cyan for links, buttons, and highlights)
- Borders: Use green (#00ff41) or cyan (#00d9ff) with glow effects (box-shadow)
- Font: MUST use monospace font family (ui-monospace, 'Courier New', monospace)
- Cards/Sections: Dark background with green/cyan borders, subtle glow
- Buttons: Solid cyan background (#00d9ff) with dark text, or outlined with green/cyan
- Windows: Include terminal-style title bars with colored dots (red, yellow, green)

CRITICAL: Apply these exact colors throughout. Do NOT use default Tailwind colors like blue, purple, or standard grays.

YOUR TASK:
Generate a complete, MULTI-PAGE, self-contained HTML preview that demonstrates what the user's project will look like.

OUTPUT REQUIREMENTS:
1. Complete HTML document with <!DOCTYPE html>
2. Include Tailwind CSS via CDN for layout utilities
3. MUST include inline <style> tag with the exact terminal colors specified above
4. STRICTLY use the terminal aesthetic colors (#0a0e14, #00ff41, #00d9ff) throughout
5. Create 3-5 navigable pages (Home, About, Features/Products, Dashboard/Account, Contact/Support)
6. Add working navigation between pages using JavaScript page switching (single-page app with hidden/shown sections)
7. Include realistic content that matches the template type
8. Show integration points visually (auth buttons, payment forms, API docs, etc.)
9. Make each page visually impressive with the terminal theme
10. Include navigation bar on every page with working links
11. Responsive design (mobile-friendly)
12. Add smooth transitions between pages

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
  description: string,
  vision?: string,
  mission?: string,
  projectName?: string
): string {
  let prompt = `Generate a preview for a ${template} project`;
  if (projectName) {
    prompt += ` called "${projectName}"`;
  }
  prompt += `.\n\n`;

  // Add vision/mission context for more relevant content
  if (vision || mission) {
    prompt += `PROJECT CONTEXT:\n`;
    if (vision) {
      prompt += `- Vision: ${vision}\n`;
    }
    if (mission) {
      prompt += `- Mission: ${mission}\n`;
    }
    prompt += `\nUse this context to generate relevant headlines, copy, and feature descriptions.\n\n`;
  }

  // Add integrations context
  const integrationsList = Object.entries(integrations)
    .filter(([_, value]) => value)
    .map(([type, provider]) => `- ${type}: ${provider}`)
    .join("\n");

  if (integrationsList) {
    prompt += `INTEGRATIONS TO SHOWCASE:\n${integrationsList}\n\n`;
    
    // Add specific guidance for key integrations
    if (integrations.auth) {
      prompt += `AUTH INTEGRATION (${integrations.auth}): Include login/signup buttons in the navigation and/or a dedicated authentication section.\n`;
    }
    if (integrations.payments) {
      prompt += `PAYMENTS INTEGRATION (${integrations.payments}): Include a pricing section with plan cards showing prices and features.\n`;
    }
    prompt += `\n`;
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
  if (description?.trim()) {
    prompt += `USER DESCRIPTION:\n${description}\n\n`;
  }

  // Template-specific guidance
  prompt += getTemplateGuidance(template);

  prompt += `

MULTI-PAGE NAVIGATION IMPLEMENTATION:
Structure your HTML like this:
- Create separate <div> sections with ids like "page-home", "page-features", etc.
- Only show one page at a time (use "hidden" class on inactive pages)
- Add navigation links with onclick="showPage('page-features')" handlers
- Include simple JavaScript to handle page switching:
  <script>
    function showPage(pageId) {
      document.querySelectorAll('[id^="page-"]').forEach(p => p.classList.add('hidden'));
      document.getElementById(pageId).classList.remove('hidden');
      window.scrollTo(0, 0);
    }
  </script>
- Add smooth fade transitions with CSS
- Ensure nav bar is visible on every page

IMPORTANT: Make buttons, links, and nav items clickable and functional so users can explore the full app experience.

Generate a visually stunning, MULTI-PAGE preview that incorporates these elements while STRICTLY maintaining the terminal aesthetic colors (#0a0e14, #00ff41, #00d9ff).`;

  return prompt;
}

function getTemplateGuidance(template: string): string {
  const guidance: Record<string, string> = {
    saas: `TEMPLATE GUIDANCE (SaaS Starter):
Create these navigable pages:
1. HOME: Hero section with value proposition, terminal-styled CTA, features overview
2. FEATURES: Detailed features grid with icons and descriptions
3. PRICING: Pricing cards with terminal window styling showing different plans
4. DASHBOARD: Mock dashboard with metrics, charts (if auth integration selected)
5. CONTACT: Contact form with terminal styling

Key elements:
- Sign-up/Login buttons in nav (if auth integration selected)
- Terminal-styled cards with glowing borders
- Mock API key display (if API integration selected)
- Footer on every page with links`,

    ecommerce: `TEMPLATE GUIDANCE (E-commerce):
Create these navigable pages:
1. HOME: Hero banner, featured products grid
2. PRODUCTS: Full product catalog with terminal-styled cards
3. PRODUCT DETAIL: Single product view with "Add to Cart" button
4. CART: Shopping cart page with checkout button
5. ACCOUNT: User account/orders page (if auth integration)

Key elements:
- Shopping cart icon in nav with item count
- Payment section showing Stripe/payment forms
- Product filters with terminal aesthetic
- Category navigation with green/cyan highlighting`,

    blog: `TEMPLATE GUIDANCE (Blog):
Create these navigable pages:
1. HOME: Latest posts list with terminal-styled cards
2. POST: Full blog post with syntax-highlighted code blocks
3. CATEGORIES: Category listing page
4. ABOUT: About the blog/author
5. NEWSLETTER: Subscription page (if email integration)

Key elements:
- Post metadata (date, author, tags) with cyan highlights
- Code blocks with terminal colors
- Sidebar with recent posts and categories
- Newsletter signup form with terminal styling`,

    dashboard: `TEMPLATE GUIDANCE (Dashboard):
Create these navigable pages:
1. HOME: Overview dashboard with key metrics
2. ANALYTICS: Detailed charts and graphs with terminal colors
3. DATA: Data tables with monospace font
4. SETTINGS: Settings page with form inputs
5. API: API keys and documentation (if API integration)

Key elements:
- Sidebar navigation with icons
- Metrics cards with green/cyan values
- Real-time indicators (green dots, "online" status)
- Terminal-styled forms and inputs`,

    "api-backend": `TEMPLATE GUIDANCE (API Backend):
Create these navigable pages:
1. HOME: API overview and getting started
2. ENDPOINTS: Full API reference with endpoint list
3. AUTHENTICATION: Auth docs showing API key usage
4. EXAMPLES: Code examples in terminal windows
5. CHANGELOG: Version history and updates

Key elements:
- Endpoint cards showing HTTP methods (GET, POST, etc.)
- Code examples with syntax highlighting
- Authentication section with API key mockup
- Rate limiting info with terminal styling
- Response examples with formatted JSON`,

    directory: `TEMPLATE GUIDANCE (Directory):
Create these navigable pages:
1. HOME: Listing grid with featured items
2. LISTINGS: Full directory with search and filters
3. DETAIL: Single item detail page
4. SUBMIT: Add new listing form
5. ABOUT: About the directory

Key elements:
- Search bar with terminal aesthetic
- Category filters with green/cyan tags
- Listing cards with terminal borders and glow
- Pagination controls with monospace numbers
- Submit form with terminal-styled inputs`,
  };

  return guidance[template] || "Create a multi-page landing site with navigation for this template type.";
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
