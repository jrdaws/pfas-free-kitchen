import { NextRequest, NextResponse } from "next/server";
import { getSupabase, Project } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limiter";
import { apiError, ErrorCodes } from "@/lib/api-errors";

// CORS headers for CLI access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Template file manifests - these define which files are included in each template
const templateFiles: Record<string, string[]> = {
  saas: [
    "app/layout.tsx",
    "app/page.tsx",
    "next-env.d.ts",
    "next.config.js",
    "package.json",
    "template.json",
    "tsconfig.json",
  ],
  "seo-directory": [
    "components.json",
    "eslint.config.mjs",
    "next-env.d.ts",
    "next.config.ts",
    "package.json",
    "postcss.config.mjs",
    "PROJECT.md",
    "README.md",
    "template.json",
    "tsconfig.json",
    "src/app/favicon.ico",
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/components/ui/badge.tsx",
    "src/components/ui/button.tsx",
    "src/components/ui/card.tsx",
    "src/components/ui/input.tsx",
    "src/components/ui/separator.tsx",
    "src/components/ui/tabs.tsx",
    "src/lib/utils.ts",
  ],
  "flagship-saas": [
    "demo.mjs",
    "README.md",
  ],
};

// Integration file manifests - files added when an integration is selected
const integrationFiles: Record<string, Record<string, string[]>> = {
  saas: {
    "auth:supabase": [
      "integrations/auth/supabase/app/api/auth/callback/route.ts",
      "integrations/auth/supabase/app/login/page.tsx",
      "integrations/auth/supabase/components/auth/auth-button.tsx",
      "integrations/auth/supabase/integration.json",
      "integrations/auth/supabase/lib/supabase.ts",
      "integrations/auth/supabase/middleware.ts",
      "integrations/auth/supabase/package.json",
    ],
    "auth:clerk": [
      "integrations/auth/clerk/app/sign-in/[[...sign-in]]/page.tsx",
      "integrations/auth/clerk/app/sign-up/[[...sign-up]]/page.tsx",
      "integrations/auth/clerk/components/auth/clerk-provider-wrapper.tsx",
      "integrations/auth/clerk/components/auth/user-button.tsx",
      "integrations/auth/clerk/integration.json",
      "integrations/auth/clerk/middleware.ts",
      "integrations/auth/clerk/package.json",
    ],
    "payments:stripe": [
      "integrations/payments/stripe/app/api/stripe/checkout/route.ts",
      "integrations/payments/stripe/app/api/stripe/portal/route.ts",
      "integrations/payments/stripe/app/api/stripe/webhook/route.ts",
      "integrations/payments/stripe/components/pricing/pricing-cards.tsx",
      "integrations/payments/stripe/integration.json",
      "integrations/payments/stripe/lib/stripe.ts",
      "integrations/payments/stripe/package.json",
    ],
    "email:resend": [
      "integrations/email/resend/app/api/email/send/route.ts",
      "integrations/email/resend/emails/welcome-email.tsx",
      "integrations/email/resend/integration.json",
      "integrations/email/resend/lib/resend.ts",
      "integrations/email/resend/package.json",
    ],
    "db:supabase": [
      "integrations/db/supabase/integration.json",
      "integrations/db/supabase/lib/database.ts",
      "integrations/db/supabase/package.json",
    ],
    "ai:openai": [
      "integrations/ai/openai/app/api/ai/chat/route.ts",
      "integrations/ai/openai/app/api/ai/completion/route.ts",
      "integrations/ai/openai/components/ai/chat-interface.tsx",
      "integrations/ai/openai/integration.json",
      "integrations/ai/openai/lib/openai.ts",
      "integrations/ai/openai/package.json",
    ],
    "ai:anthropic": [
      "integrations/ai/anthropic/app/api/ai/claude/route.ts",
      "integrations/ai/anthropic/components/ai/claude-chat.tsx",
      "integrations/ai/anthropic/integration.json",
      "integrations/ai/anthropic/lib/anthropic.ts",
      "integrations/ai/anthropic/package.json",
    ],
    "analytics:posthog": [
      "integrations/analytics/posthog/components/analytics/posthog-provider.tsx",
      "integrations/analytics/posthog/components/analytics/use-posthog.tsx",
      "integrations/analytics/posthog/integration.json",
      "integrations/analytics/posthog/lib/posthog.ts",
      "integrations/analytics/posthog/package.json",
    ],
    "analytics:plausible": [
      "integrations/analytics/plausible/components/analytics/plausible-provider.tsx",
      "integrations/analytics/plausible/components/analytics/use-plausible.tsx",
      "integrations/analytics/plausible/integration.json",
      "integrations/analytics/plausible/package.json",
    ],
  },
};

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return apiError(
        ErrorCodes.MISSING_FIELD,
        "Token is required",
        400,
        { field: "token" },
        "Provide a valid project token in the URL path",
        corsHeaders
      );
    }

    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     "anonymous";
    
    const rateLimitResult = await checkRateLimit(`download:${clientIp}`);
    
    if (!rateLimitResult.allowed) {
      return apiError(
        ErrorCodes.RATE_LIMITED,
        "Too many requests. Please try again later.",
        429,
        { resetAt: rateLimitResult.resetAt },
        "Wait a few minutes before trying again. Rate limits reset every 15 minutes.",
        corsHeaders
      );
    }

    // Fetch project from database
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("token", token)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return apiError(
          ErrorCodes.TOKEN_NOT_FOUND,
          `Project with token "${token}" not found`,
          404,
          undefined,
          "Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure",
          corsHeaders
        );
      }

      console.error("[Project Download Error]", error);
      return apiError(
        ErrorCodes.DATABASE_ERROR,
        "Failed to fetch project",
        500,
        { details: error.message },
        "Try again in a few moments. If the issue persists, contact support.",
        corsHeaders
      );
    }

    // Check if project has expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return apiError(
        ErrorCodes.TOKEN_EXPIRED,
        `Project "${token}" has expired. Projects expire after 30 days.`,
        410,
        {
          expiredAt: data.expires_at,
          helpUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/configure`
        },
        "Create a new project configuration at https://dawson.dev/configure",
        corsHeaders
      );
    }

    const project = data as Project;

    // Build the list of files to include
    const baseFiles = templateFiles[project.template] || [];
    const integrationFilesList: string[] = [];

    // Add integration files based on project configuration
    if (project.integrations && integrationFiles[project.template]) {
      const templateIntegrations = integrationFiles[project.template];
      
      for (const [category, provider] of Object.entries(project.integrations)) {
        const key = `${category}:${provider}`;
        if (templateIntegrations[key]) {
          integrationFilesList.push(...templateIntegrations[key]);
        }
      }
    }

    // Update last_accessed_at timestamp
    await supabase
      .from("projects")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("token", token);

    console.log(`[Project Download] ${token} | ${project.template} | ${project.project_name}`);

    // Build downloadable project manifest
    const downloadManifest = {
      version: "1.0.0",
      token: project.token,
      template: project.template,
      project_name: project.project_name,
      output_dir: project.output_dir,
      created_at: project.created_at,
      expires_at: project.expires_at,
      
      // Project configuration
      config: {
        integrations: project.integrations,
        env_keys: project.env_keys,
        vision: project.vision,
        mission: project.mission,
        success_criteria: project.success_criteria,
        inspirations: project.inspirations,
        description: project.description,
      },
      
      // Files to be scaffolded
      files: {
        base: baseFiles,
        integrations: integrationFilesList,
        total: baseFiles.length + integrationFilesList.length,
      },
      
      // CLI instructions
      cli: {
        pullCommand: `npx @jrdaws/framework pull ${token}`,
        templatePath: `templates/${project.template}`,
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(downloadManifest, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${project.project_name}-config.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("[Project Download Error]", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to download project",
      500,
      process.env.NODE_ENV === "development" ? { details: errorMessage } : undefined,
      "Try again in a few moments. If the issue persists, contact support.",
      corsHeaders
    );
  }
}

