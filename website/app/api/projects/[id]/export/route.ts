/**
 * /api/projects/[id]/export
 * 
 * POST - Generate export package for a saved project
 * 
 * This endpoint reads the project configuration from the database
 * and generates a downloadable ZIP file with all project files.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedClient,
  isAuthError,
  unauthorizedResponse,
  apiError,
  apiSuccess,
  verifyProjectOwnership,
} from "@/lib/api/auth";
import type { ExportOptions, UserProject, ProjectPage } from "@/lib/types/project";
import JSZip from "jszip";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/projects/[id]/export
 * Generate and return a ZIP file of the project
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    const auth = await getAuthenticatedClient(request);
    if (isAuthError(auth)) {
      return unauthorizedResponse(auth);
    }

    const { supabase, user } = auth;
    
    let options: ExportOptions = {
      format: 'zip',
      includeEnvExample: true,
      includeDocs: true,
    };
    
    try {
      const body = await request.json();
      options = { ...options, ...body };
    } catch {
      // Use defaults
    }

    // Verify project ownership
    const isOwner = await verifyProjectOwnership(supabase, projectId);
    if (!isOwner) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Fetch full project data
    const { data: project, error: projectError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return apiError("NOT_FOUND", "Project not found", 404);
    }

    // Fetch pages
    const { data: pages } = await supabase
      .from("project_pages")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    // Log generation to history
    await supabase.from("generation_history").insert({
      project_id: projectId,
      generation_type: "export",
      input_config: { options, user_id: user.id },
      model: "none",
      success: true,
    });

    // Generate ZIP file
    const zip = new JSZip();
    const typedProject = project as UserProject;
    const typedPages = (pages || []) as ProjectPage[];

    // Add project manifest
    zip.file(
      ".dd/template-manifest.json",
      JSON.stringify(
        {
          projectId: typedProject.id,
          name: typedProject.name,
          template: typedProject.template,
          integrations: typedProject.integrations,
          features: typedProject.features,
          exportedAt: new Date().toISOString(),
          exportedBy: user.id,
        },
        null,
        2
      )
    );

    // Add vision document if available
    const projectConfig = typedProject.project_config as { vision?: string } | null;
    if (projectConfig?.vision) {
      zip.file(".dd/vision.md", `# Project Vision\n\n${projectConfig.vision}`);
    }

    // Add pages manifest
    if (typedPages.length > 0) {
      zip.file(
        ".dd/pages.json",
        JSON.stringify(
          typedPages.map((p) => ({
            name: p.name,
            path: p.path,
            type: p.page_type,
            isProtected: p.is_protected,
            isDynamic: p.is_dynamic,
          })),
          null,
          2
        )
      );
    }

    // Generate page files
    for (const page of typedPages) {
      const pagePath = page.path === "/" ? "/page.tsx" : `${page.path}/page.tsx`;
      const pageContent = generatePageFile(page, typedProject);
      zip.file(`app${pagePath}`, pageContent);
    }

    // Add environment example
    if (options.includeEnvExample) {
      const envVars = generateEnvExample(typedProject);
      zip.file(".env.local.example", envVars);
    }

    // Add README
    if (options.includeDocs) {
      const readme = generateReadme(typedProject, typedPages);
      zip.file("README.md", readme);
    }

    // Add package.json
    const packageJson = generatePackageJson(typedProject);
    zip.file("package.json", packageJson);

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: "nodebuffer" });

    // Return ZIP file
    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${typedProject.slug || typedProject.name.toLowerCase().replace(/\s+/g, "-")}-export.zip"`,
      },
    });
  } catch (error) {
    console.error("[Project Export] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to export project", 500);
  }
}

/**
 * Generate a basic page file from page config
 */
function generatePageFile(page: ProjectPage, project: UserProject): string {
  const isProtected = page.is_protected;
  const pageMeta = page.meta as { title?: string; description?: string } | null;

  return `/**
 * ${page.name}
 * Path: ${page.path}
 * ${isProtected ? "🔒 Protected Route" : "🌐 Public Route"}
 */

${isProtected ? `import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
` : ""}
export const metadata = {
  title: "${pageMeta?.title || page.name} | ${project.name}",
  description: "${pageMeta?.description || `${page.name} page`}",
};

export default async function ${toPascalCase(page.name)}Page() {
${isProtected ? `  // Check authentication
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
` : ""}
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${page.name}</h1>
      {/* TODO: Add page content */}
      <p className="text-muted-foreground">
        This page was generated by the Dawson Does Framework.
      </p>
    </main>
  );
}
`;
}

/**
 * Generate environment variables example
 */
function generateEnvExample(project: UserProject): string {
  const vars: string[] = [
    "# Environment Variables",
    `# Generated for: ${project.name}`,
    `# Template: ${project.template || "custom"}`,
    "",
  ];

  const integrations = project.integrations as Record<string, string>;

  // Add integration-specific env vars
  if (integrations.auth === "supabase" || integrations.db === "supabase") {
    vars.push("# Supabase");
    vars.push("NEXT_PUBLIC_SUPABASE_URL=");
    vars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY=");
    vars.push("SUPABASE_SERVICE_ROLE_KEY=");
    vars.push("");
  }

  if (integrations.payments === "stripe") {
    vars.push("# Stripe");
    vars.push("STRIPE_SECRET_KEY=");
    vars.push("STRIPE_WEBHOOK_SECRET=");
    vars.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=");
    vars.push("");
  }

  if (integrations.ai === "openai") {
    vars.push("# OpenAI");
    vars.push("OPENAI_API_KEY=");
    vars.push("");
  }

  if (integrations.ai === "anthropic") {
    vars.push("# Anthropic");
    vars.push("ANTHROPIC_API_KEY=");
    vars.push("");
  }

  if (integrations.email === "resend") {
    vars.push("# Resend");
    vars.push("RESEND_API_KEY=");
    vars.push("");
  }

  if (integrations.analytics === "posthog") {
    vars.push("# PostHog");
    vars.push("NEXT_PUBLIC_POSTHOG_KEY=");
    vars.push("NEXT_PUBLIC_POSTHOG_HOST=");
    vars.push("");
  }

  return vars.join("\n");
}

/**
 * Generate README file
 */
function generateReadme(project: UserProject, pages: ProjectPage[]): string {
  const integrations = project.integrations as Record<string, string>;
  const integrationList = Object.entries(integrations)
    .filter(([, v]) => v)
    .map(([k, v]) => `- **${k}**: ${v}`)
    .join("\n");

  const pageList = pages
    .map((p) => `- \`${p.path}\` - ${p.name}${p.is_protected ? " 🔒" : ""}`)
    .join("\n");

  return `# ${project.name}

${project.description || "A project generated by the Dawson Does Framework."}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
\`\`\`

## Project Structure

### Pages
${pageList || "No pages configured yet."}

### Integrations
${integrationList || "No integrations configured."}

## Deployment

This project is configured for deployment on Vercel:

\`\`\`bash
npx vercel
\`\`\`

## Generated By

This project was created with [Dawson Does Framework](https://github.com/jrdaws/dawson-does-framework).

---

Generated on ${new Date().toISOString().split("T")[0]}
`;
}

/**
 * Generate package.json
 */
function generatePackageJson(project: UserProject): string {
  const integrations = project.integrations as Record<string, string>;
  const deps: Record<string, string> = {
    next: "^15.0.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
  };

  // Add integration dependencies
  if (integrations.auth === "supabase" || integrations.db === "supabase") {
    deps["@supabase/supabase-js"] = "^2.47.10";
    deps["@supabase/ssr"] = "^0.1.0";
  }

  if (integrations.payments === "stripe") {
    deps["stripe"] = "^17.4.0";
  }

  if (integrations.ai === "openai") {
    deps["openai"] = "^4.28.0";
  }

  if (integrations.ai === "anthropic") {
    deps["@anthropic-ai/sdk"] = "^0.32.1";
  }

  if (integrations.email === "resend") {
    deps["resend"] = "^3.2.0";
  }

  if (integrations.analytics === "posthog") {
    deps["posthog-js"] = "^1.100.0";
  }

  const packageJson = {
    name: project.slug || project.name.toLowerCase().replace(/\s+/g, "-"),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: deps,
    devDependencies: {
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      typescript: "^5",
      tailwindcss: "^3.4.0",
      postcss: "^8",
      autoprefixer: "^10",
    },
  };

  return JSON.stringify(packageJson, null, 2);
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

