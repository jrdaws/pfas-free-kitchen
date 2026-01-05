import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSessionCache } from "@/lib/preview/session-store";
import { generatePageProps, type PropsGenerationContext } from "@/lib/preview/intelligent-props";
import { getTemplateComposition } from "@/lib/preview/template-compositions";
import type { PagePreviewResponse, PreviewSession, PreviewStateSimulation } from "@/lib/preview/session-types";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

/**
 * POST /api/preview/page/[pageId]
 * Generate preview for a specific page within a session
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<PagePreviewResponse>> {
  try {
    const { pageId } = await params;
    const body = await request.json();
    const { sessionId, regenerate = false } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    // Get session
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found or expired" },
        { status: 404 }
      );
    }

    // Decode page path from pageId (URL-safe base64 or just the path)
    const pagePath = pageId === "home" ? "/" : `/${pageId}`;

    // Check cache first (unless regenerate is requested)
    if (!regenerate && session.pageCache[pagePath]) {
      const cached = session.pageCache[pagePath];
      return NextResponse.json({
        success: true,
        html: cached.html,
        props: cached.props,
        navigation: session.navigation,
        stateSimulation: session.stateSimulation,
        fidelityScore: session.fidelityScore,
      });
    }

    // Find page in navigation
    const pageInfo = session.navigation.pages.find((p) => p.path === pagePath);
    if (!pageInfo) {
      return NextResponse.json(
        { success: false, error: `Page not found: ${pagePath}` },
        { status: 404 }
      );
    }

    // Build props generation context
    const context: PropsGenerationContext = {
      template: session.template,
      projectName: session.branding.projectName,
      pagePath,
      pageTitle: pageInfo.title,
      branding: session.branding,
      vision: session.vision,
      research: session.research,
      integrations: session.integrations,
      pages: session.navigation.pages.map((p) => ({
        path: p.path,
        title: p.title,
      })),
    };

    // Generate intelligent props
    const componentProps = generatePageProps(context);

    // Generate HTML preview
    const html = generatePreviewHtml(session, componentProps, pageInfo.title);

    // Cache the result
    updateSessionCache(sessionId, pagePath, html, componentProps);

    return NextResponse.json({
      success: true,
      html,
      props: componentProps,
      navigation: {
        ...session.navigation,
        currentPath: pagePath,
        pages: session.navigation.pages.map((p) => ({
          ...p,
          isCurrentPage: p.path === pagePath,
        })),
      },
      stateSimulation: session.stateSimulation,
      fidelityScore: session.fidelityScore,
    });
  } catch (error) {
    console.error("[Page Preview] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate preview" },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML preview from component props
 * This creates an HTML string that can be rendered in an iframe
 */
function generatePreviewHtml(
  session: PreviewSession,
  props: Record<string, Record<string, unknown>>,
  pageTitle: string
): string {

  const { branding, template, stateSimulation } = session;
  const composition = getTemplateComposition(template);

  // Generate CSS variables from branding
  const cssVariables = `
    :root {
      --primary: ${branding.colors.primary};
      --primary-foreground: #ffffff;
      --secondary: ${branding.colors.secondary};
      --accent: ${branding.colors.accent};
      --background: ${branding.colors.background};
      --foreground: ${branding.colors.foreground};
      --muted: #f1f5f9;
      --muted-foreground: #64748b;
      --border: #e2e8f0;
      --radius: 0.5rem;
    }
  `;

  // Generate component HTML
  const sectionsHtml = composition.sections
    .map((section) => {
      const componentProps = props[section.component] || {};
      return generateComponentHtml(section.component, componentProps, stateSimulation);
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} | ${branding.projectName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssVariables}
    
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: '${branding.fonts?.body || "Inter"}', system-ui, sans-serif;
      background: var(--background);
      color: var(--foreground);
    }
    
    .btn-primary {
      background: var(--primary);
      color: var(--primary-foreground);
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius);
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    
    .btn-secondary {
      background: transparent;
      color: var(--foreground);
      border: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius);
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }
    
    .card {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
    }
    
    .preview-nav-link {
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    .preview-nav-link:hover {
      color: var(--primary);
    }
  </style>
</head>
<body>
  ${sectionsHtml}
  
  <script>
    // Handle navigation within preview
    document.querySelectorAll('[data-preview-link]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = e.currentTarget.dataset.previewLink;
        window.parent.postMessage({ type: 'preview-navigate', path }, '*');
      });
    });
    
    // Handle auth state toggle
    window.authState = '${stateSimulation.auth.state}';
    function toggleAuth() {
      window.parent.postMessage({ type: 'preview-toggle-auth' }, '*');
    }
  </script>
</body>
</html>`;
}

/**
 * Generate HTML for a specific component
 */
function generateComponentHtml(
  componentName: string,
  props: Record<string, unknown>,
  stateSimulation: PreviewStateSimulation
): string {

  switch (componentName) {
    case "Nav":
      return generateNavHtml(props, stateSimulation);
    case "Hero":
      return generateHeroHtml(props);
    case "FeatureCards":
      return generateFeatureCardsHtml(props);
    case "PricingTable":
      return generatePricingTableHtml(props);
    case "Testimonials":
      return generateTestimonialsHtml(props);
    case "CTA":
      return generateCTAHtml(props);
    case "Footer":
      return generateFooterHtml(props);
    case "ProductGrid":
      return generateProductGridHtml(props);
    case "FAQ":
      return generateFAQHtml(props);
    default:
      return `<!-- ${componentName} placeholder -->`;
  }
}

function generateNavHtml(props: Record<string, unknown>, stateSimulation: PreviewStateSimulation): string {
  const links = (props.links as string[]) || [];
  const projectName = props.projectName as string || "Project";
  const showAuth = props.showAuth as boolean;
  const isLoggedIn = stateSimulation.auth.state !== "logged-out";

  return `
<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <a href="/" data-preview-link="/" class="text-xl font-bold preview-nav-link">${projectName}</a>
        <div class="hidden md:flex ml-10 space-x-8">
          ${links.map((link) => `<a href="#" class="preview-nav-link text-sm font-medium">${link}</a>`).join("")}
        </div>
      </div>
      ${showAuth ? `
      <div class="flex items-center space-x-4">
        ${isLoggedIn
          ? `<span class="text-sm">Welcome, ${stateSimulation.auth.user?.name || "User"}</span>
             <button onclick="toggleAuth()" class="btn-secondary text-sm py-2 px-4">Sign Out</button>`
          : `<a href="/login" data-preview-link="/login" class="preview-nav-link text-sm font-medium">Login</a>
             <a href="/signup" data-preview-link="/signup" class="btn-primary text-sm py-2 px-4">Sign Up</a>`
        }
      </div>
      ` : ""}
    </div>
  </div>
</nav>`;
}

function generateHeroHtml(props: Record<string, unknown>): string {
  const title = props.title as string || "Welcome";
  const subtitle = props.subtitle as string || "";
  const ctaText = props.ctaText as string || "Get Started";
  const ctaSecondaryText = props.ctaSecondaryText as string;

  return `
<section class="relative py-20 lg:py-32 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
      ${title}
    </h1>
    <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
      ${subtitle}
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="/signup" data-preview-link="/signup" class="btn-primary text-lg">${ctaText}</a>
      ${ctaSecondaryText ? `<a href="/features" data-preview-link="/features" class="btn-secondary text-lg">${ctaSecondaryText}</a>` : ""}
    </div>
  </div>
</section>`;
}

function generateFeatureCardsHtml(props: Record<string, unknown>): string {
  const features = (props.features as { title: string; description: string; iconName?: string }[]) || [];
  const title = props.title as string || "Features";

  return `
<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center mb-12">${title}</h2>
    <div class="grid md:grid-cols-3 gap-8">
      ${features.map((f) => `
        <div class="card">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
            <span class="text-2xl">⚡</span>
          </div>
          <h3 class="text-lg font-semibold mb-2">${f.title}</h3>
          <p class="text-gray-600">${f.description}</p>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;
}

function generatePricingTableHtml(props: Record<string, unknown>): string {
  const plans = (props.plans as { name: string; price: number; period: string; features: string[]; highlighted?: boolean }[]) || [];

  return `
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
    <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      ${plans.map((plan) => `
        <div class="card ${plan.highlighted ? "ring-2 ring-blue-500" : ""}">
          <h3 class="text-xl font-bold mb-2">${plan.name}</h3>
          <div class="text-3xl font-bold mb-4">
            ${plan.price === 0 ? "Free" : `$${plan.price}`}
            ${plan.price > 0 ? `<span class="text-sm font-normal text-gray-500">/${plan.period}</span>` : ""}
          </div>
          <ul class="space-y-2 mb-6">
            ${plan.features.map((f) => `<li class="flex items-center text-sm"><span class="text-green-500 mr-2">✓</span>${f}</li>`).join("")}
          </ul>
          <button class="${plan.highlighted ? "btn-primary" : "btn-secondary"} w-full">
            ${plan.price === 0 ? "Get Started" : "Subscribe"}
          </button>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;
}

function generateTestimonialsHtml(props: Record<string, unknown>): string {
  const testimonials = (props.testimonials as { quote: string; author: string; role?: string; company?: string }[]) || [];

  return `
<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
    <div class="grid md:grid-cols-3 gap-8">
      ${testimonials.map((t) => `
        <div class="card">
          <p class="text-gray-600 mb-4">"${t.quote}"</p>
          <div class="font-semibold">${t.author}</div>
          <div class="text-sm text-gray-500">${t.role || ""}${t.company ? ` at ${t.company}` : ""}</div>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;
}

function generateCTAHtml(props: Record<string, unknown>): string {
  const title = props.title as string || "Ready to Get Started?";
  const subtitle = props.subtitle as string || "";
  const buttonText = props.buttonText as string || "Get Started";

  return `
<section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-3xl font-bold text-white mb-4">${title}</h2>
    <p class="text-white/80 mb-8">${subtitle}</p>
    <a href="/signup" data-preview-link="/signup" class="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition">
      ${buttonText}
    </a>
  </div>
</section>`;
}

function generateFooterHtml(props: Record<string, unknown>): string {
  const projectName = props.projectName as string || "Project";
  const links = (props.links as string[]) || [];

  return `
<footer class="bg-gray-900 text-white py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="text-xl font-bold mb-4 md:mb-0">${projectName}</div>
      <div class="flex space-x-6">
        ${links.map((link) => `<a href="#" class="text-gray-400 hover:text-white text-sm">${link}</a>`).join("")}
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
      © ${new Date().getFullYear()} ${projectName}. All rights reserved.
    </div>
  </div>
</footer>`;
}

function generateProductGridHtml(props: Record<string, unknown>): string {
  const products = (props.products as { name: string; price: number; category?: string }[]) || [];
  const title = props.title as string || "Products";

  return `
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center mb-12">${title}</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${products.map((p) => `
        <div class="card group cursor-pointer hover:shadow-lg transition">
          <div class="aspect-square bg-gray-100 rounded-lg mb-4"></div>
          ${p.category ? `<span class="text-xs font-medium text-blue-600">${p.category}</span>` : ""}
          <h3 class="font-semibold mt-1">${p.name}</h3>
          <p class="text-lg font-bold mt-2">$${p.price.toFixed(2)}</p>
          <button class="btn-primary w-full mt-4 opacity-0 group-hover:opacity-100 transition">Add to Cart</button>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;
}

function generateFAQHtml(props: Record<string, unknown>): string {
  const items = (props.items as { question: string; answer: string }[]) || [];

  return `
<section class="py-20">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
    <div class="space-y-4">
      ${items.map((item, i) => `
        <details class="card" ${i === 0 ? "open" : ""}>
          <summary class="font-semibold cursor-pointer">${item.question}</summary>
          <p class="mt-2 text-gray-600">${item.answer}</p>
        </details>
      `).join("")}
    </div>
  </div>
</section>`;
}

