import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { apiError, ErrorCodes } from "@/lib/api-errors";
import { generateProject, type ProjectConfig, type IntegrationCategory } from "@/lib/generator";

// Template component manifests - what core pages/components each template includes
const TEMPLATE_COMPONENTS: Record<string, {
  pages: string[];
  components: string[];
  lib: string[];
  styles: string[];
  config: string[];
}> = {
  saas: {
    pages: [
      "app/page.tsx",
      "app/layout.tsx",
      "app/dashboard/page.tsx",
      "app/dashboard/settings/page.tsx",
      "app/pricing/page.tsx",
    ],
    components: [
      "components/Hero.tsx",
      "components/Nav.tsx",
      "components/CTA.tsx",
      "components/DashboardPreview.tsx",
      "components/FAQ.tsx",
      "components/FeatureCards.tsx",
      "components/Footer.tsx",
      "components/PricingTable.tsx",
      "components/Testimonials.tsx",
      "components/index.ts",
      "components/ui/empty-state.tsx",
    ],
    lib: [
      "lib/utils.ts",
    ],
    styles: ["app/globals.css"],
    config: ["package.json", "tailwind.config.ts", "tsconfig.json", "next.config.js", "postcss.config.js"],
  },
  ecommerce: {
    pages: ["app/page.tsx", "app/layout.tsx"],
    components: [
      "components/Hero.tsx",
      "components/Nav.tsx",
      "components/CTA.tsx",
      "components/DashboardPreview.tsx",
      "components/FAQ.tsx",
      "components/FeatureCards.tsx",
      "components/Footer.tsx",
      "components/PricingTable.tsx",
      "components/Testimonials.tsx",
      "components/index.ts",
      "components/ui/empty-state.tsx",
    ],
    lib: ["lib/utils.ts"],
    styles: ["app/globals.css"],
    config: ["package.json", "tailwind.config.ts", "tsconfig.json", "next.config.js", "postcss.config.js"],
  },
  blog: {
    pages: ["app/page.tsx", "app/layout.tsx", "app/blog/[slug]/page.tsx"],
    components: [],
    lib: [],
    styles: ["app/globals.css"],
    config: ["package.json", "tailwind.config.ts", "tsconfig.json", "next.config.js", "postcss.config.js"],
  },
  dashboard: {
    pages: ["app/page.tsx", "app/layout.tsx", "app/settings/page.tsx"],
    components: [],
    lib: [],
    styles: ["app/globals.css"],
    config: ["package.json", "tailwind.config.ts", "tsconfig.json", "next.config.js", "postcss.config.js"],
  },
  "landing-page": {
    pages: ["app/page.tsx", "app/layout.tsx"],
    components: [],
    lib: [],
    styles: ["app/globals.css"],
    config: ["package.json", "tailwind.config.ts", "tsconfig.json", "next.config.js", "postcss.config.js"],
  },
  "seo-directory": {
    pages: ["src/app/page.tsx", "src/app/layout.tsx"],
    components: [
      "src/components/ui/badge.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/card.tsx",
      "src/components/ui/input.tsx",
      "src/components/ui/separator.tsx",
      "src/components/ui/tabs.tsx",
    ],
    lib: ["src/lib/utils.ts"],
    styles: ["src/app/globals.css"],
    config: ["package.json", "tailwind.config.ts", "tsconfig.json", "next.config.ts", "postcss.config.mjs", "components.json"],
  },
};

// Integration file paths within templates/saas/integrations/
const INTEGRATION_PATHS: Record<string, string[]> = {
  "auth:supabase": [
    "integrations/auth/supabase/app/api/auth/callback/route.ts",
    "integrations/auth/supabase/app/login/page.tsx",
    "integrations/auth/supabase/components/auth/auth-button.tsx",
    "integrations/auth/supabase/lib/supabase.ts",  // Re-export shim for backward compatibility
    "integrations/auth/supabase/lib/supabase/client.ts",
    "integrations/auth/supabase/lib/supabase/server.ts",
    "integrations/auth/supabase/lib/supabase/index.ts",
    "integrations/auth/supabase/middleware.ts",
  ],
  "auth:clerk": [
    "integrations/auth/clerk/app/sign-in/[[...sign-in]]/page.tsx",
    "integrations/auth/clerk/app/sign-up/[[...sign-up]]/page.tsx",
    "integrations/auth/clerk/components/auth/clerk-provider-wrapper.tsx",
    "integrations/auth/clerk/components/auth/user-button.tsx",
    "integrations/auth/clerk/middleware.ts",
  ],
  "payments:stripe": [
    "integrations/payments/stripe/app/api/stripe/checkout/route.ts",
    "integrations/payments/stripe/app/api/stripe/portal/route.ts",
    "integrations/payments/stripe/app/api/stripe/webhook/route.ts",
    "integrations/payments/stripe/components/pricing/pricing-cards.tsx",
    "integrations/payments/stripe/lib/stripe.ts",
  ],
  "email:resend": [
    "integrations/email/resend/app/api/email/send/route.ts",
    "integrations/email/resend/emails/welcome-email.tsx",
    "integrations/email/resend/lib/resend.ts",
  ],
  "db:supabase": [
    "integrations/db/supabase/lib/database.ts",
  ],
  "ai:openai": [
    "integrations/ai/openai/app/api/ai/chat/route.ts",
    "integrations/ai/openai/app/api/ai/completion/route.ts",
    "integrations/ai/openai/components/ai/chat-interface.tsx",
    "integrations/ai/openai/lib/openai.ts",
  ],
  "ai:anthropic": [
    "integrations/ai/anthropic/app/api/ai/claude/route.ts",
    "integrations/ai/anthropic/components/ai/claude-chat.tsx",
    "integrations/ai/anthropic/lib/anthropic.ts",
  ],
  "analytics:posthog": [
    "integrations/analytics/posthog/components/analytics/posthog-provider.tsx",
    "integrations/analytics/posthog/components/analytics/use-posthog.tsx",
    "integrations/analytics/posthog/lib/posthog.ts",
  ],
  "analytics:plausible": [
    "integrations/analytics/plausible/components/analytics/plausible-provider.tsx",
    "integrations/analytics/plausible/components/analytics/use-plausible.tsx",
  ],
  "storage:r2": [],  // Will generate boilerplate inline
  "storage:s3": [],  // Will generate boilerplate inline
  "storage:uploadthing": [
    "integrations/storage/uploadthing/app/api/uploadthing/core.ts",
    "integrations/storage/uploadthing/app/api/uploadthing/route.ts",
    "integrations/storage/uploadthing/components/storage/upload-button.tsx",
    "integrations/storage/uploadthing/components/storage/upload-dropzone.tsx",
    "integrations/storage/uploadthing/components/storage/file-upload.tsx",
    "integrations/storage/uploadthing/components/storage/file-preview.tsx",
    "integrations/storage/uploadthing/components/storage/index.ts",
    "integrations/storage/uploadthing/lib/uploadthing.ts",
  ],
  // New integrations (P1)
  "search:algolia": [
    "integrations/search/algolia/lib/search/algolia.ts",
    "integrations/search/algolia/lib/search/indexer.ts",
    "integrations/search/algolia/components/search/SearchBox.tsx",
    "integrations/search/algolia/components/search/SearchResults.tsx",
    "integrations/search/algolia/components/search/SearchModal.tsx",
    "integrations/search/algolia/hooks/useSearch.ts",
  ],
  "monitoring:sentry": [
    "integrations/monitoring/sentry/sentry.client.config.ts",
    "integrations/monitoring/sentry/sentry.server.config.ts",
    "integrations/monitoring/sentry/sentry.edge.config.ts",
    "integrations/monitoring/sentry/instrumentation.ts",
    "integrations/monitoring/sentry/app/global-error.tsx",
    "integrations/monitoring/sentry/lib/sentry.ts",
  ],
  "cms:sanity": [
    "integrations/cms/sanity/lib/sanity/client.ts",
    "integrations/cms/sanity/lib/sanity/queries.ts",
    "integrations/cms/sanity/lib/sanity/image.ts",
    "integrations/cms/sanity/sanity.config.ts",
    "integrations/cms/sanity/sanity/schemas/index.ts",
    "integrations/cms/sanity/app/studio/[[...tool]]/page.tsx",
  ],
  "images:cloudinary": [
    "integrations/images/cloudinary/lib/cloudinary.ts",
    "integrations/images/cloudinary/lib/cloudinary-upload.ts",
    "integrations/images/cloudinary/components/media/CloudinaryImage.tsx",
    "integrations/images/cloudinary/components/media/CloudinaryUpload.tsx",
    "integrations/images/cloudinary/app/api/cloudinary/sign/route.ts",
  ],
  "imageOpt:cloudinary": [  // Alias for configurator compatibility
    "integrations/images/cloudinary/lib/cloudinary.ts",
    "integrations/images/cloudinary/lib/cloudinary-upload.ts",
    "integrations/images/cloudinary/components/media/CloudinaryImage.tsx",
    "integrations/images/cloudinary/components/media/CloudinaryUpload.tsx",
    "integrations/images/cloudinary/app/api/cloudinary/sign/route.ts",
  ],
  "jobs:inngest": [
    "integrations/jobs/inngest/lib/inngest/client.ts",
    "integrations/jobs/inngest/lib/inngest/functions.ts",
    "integrations/jobs/inngest/app/api/inngest/route.ts",
  ],
  "backgroundJobs:inngest": [  // Alias for configurator compatibility
    "integrations/jobs/inngest/lib/inngest/client.ts",
    "integrations/jobs/inngest/lib/inngest/functions.ts",
    "integrations/jobs/inngest/app/api/inngest/route.ts",
  ],
  "notifications:novu": [
    "integrations/notifications/novu/lib/notifications/novu.ts",
    "integrations/notifications/novu/lib/notifications/novu-client.ts",
    "integrations/notifications/novu/components/notifications/NotificationBell.tsx",
    "integrations/notifications/novu/components/notifications/NotificationCenter.tsx",
    "integrations/notifications/novu/app/api/notifications/route.ts",
  ],
  "flags:posthog": [
    "integrations/flags/posthog/lib/feature-flags/posthog.ts",
    "integrations/flags/posthog/hooks/useFeatureFlag.ts",
    "integrations/flags/posthog/components/FeatureFlag.tsx",
  ],
  "featureFlags:posthog-flags": [  // Alias for configurator compatibility
    "integrations/flags/posthog/lib/feature-flags/posthog.ts",
    "integrations/flags/posthog/hooks/useFeatureFlag.ts",
    "integrations/flags/posthog/components/FeatureFlag.tsx",
  ],
};

interface ExportRequest {
  template: string;
  projectName: string;
  integrations: Record<string, string>;
  vision?: string;
  mission?: string;
  successCriteria?: string;
  inspiration?: {
    description?: string;
    urls?: string[];
  };
  envKeys?: Record<string, string>;
}

function getTemplatesPath(): string {
  // Try different paths based on environment
  const possiblePaths = [
    path.join(process.cwd(), "..", "templates"),  // From website/
    path.join(process.cwd(), "templates"),         // From root
    path.join(__dirname, "..", "..", "..", "..", "templates"), // Relative
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return path.join(process.cwd(), "..", "templates");
}

function safeReadFile(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch {
    console.warn(`Could not read: ${filePath}`);
  }
  return null;
}

function getRequiredEnvVars(integrations: Record<string, string>): string[] {
  const vars: string[] = [];
  
  Object.entries(integrations).forEach(([type, provider]) => {
    if (!provider) return;
    
    switch (`${type}:${provider}`) {
      case "auth:supabase":
      case "db:supabase":
        if (!vars.includes("NEXT_PUBLIC_SUPABASE_URL")) {
          vars.push("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY");
        }
        break;
      case "auth:clerk":
        vars.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY");
        break;
      case "payments:stripe":
        vars.push("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
        break;
      case "email:resend":
        vars.push("RESEND_API_KEY");
        break;
      case "ai:openai":
        vars.push("OPENAI_API_KEY");
        break;
      case "ai:anthropic":
        vars.push("ANTHROPIC_API_KEY");
        break;
      case "analytics:posthog":
        vars.push("NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST");
        break;
      case "analytics:plausible":
        vars.push("NEXT_PUBLIC_PLAUSIBLE_DOMAIN");
        break;
      case "storage:r2":
        vars.push("R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_ENDPOINT");
        break;
      case "storage:s3":
        vars.push("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_BUCKET", "AWS_REGION");
        break;
      case "storage:uploadthing":
        vars.push("UPLOADTHING_SECRET", "UPLOADTHING_APP_ID");
        break;
      // New integrations (P1)
      case "search:algolia":
        vars.push("NEXT_PUBLIC_ALGOLIA_APP_ID", "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY", "ALGOLIA_ADMIN_KEY", "NEXT_PUBLIC_ALGOLIA_INDEX_NAME");
        break;
      case "monitoring:sentry":
        vars.push("SENTRY_DSN", "SENTRY_ORG", "SENTRY_PROJECT");
        break;
      case "cms:sanity":
        vars.push("NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_TOKEN");
        break;
      case "images:cloudinary":
      case "imageOpt:cloudinary":
        vars.push("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET");
        break;
      case "jobs:inngest":
      case "backgroundJobs:inngest":
        vars.push("INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY");
        break;
      case "notifications:novu":
        vars.push("NOVU_API_KEY", "NEXT_PUBLIC_NOVU_APP_ID");
        break;
      case "flags:posthog":
      case "featureFlags:posthog-flags":
        if (!vars.includes("NEXT_PUBLIC_POSTHOG_KEY")) {
          vars.push("NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST");
        }
        break;
    }
  });
  
  return [...new Set(vars)];
}

function getIntegrationDependencies(integrations: Record<string, string>): Record<string, string> {
  const deps: Record<string, string> = {};

  Object.entries(integrations).forEach(([type, provider]) => {
    if (!provider) return;

    switch (`${type}:${provider}`) {
      case "auth:supabase":
      case "db:supabase":
        deps["@supabase/supabase-js"] = "^2.47.10";
        deps["@supabase/ssr"] = "^0.1.0";
        break;
      case "auth:clerk":
        deps["@clerk/nextjs"] = "^5.0.0";
        break;
      case "payments:stripe":
        deps["stripe"] = "^17.4.0";  // Updated for 2024-11-20.acacia API version
        break;
      case "payments:paddle":
        deps["@paddle/paddle-js"] = "^1.0.0";
        break;
      case "email:resend":
        deps["resend"] = "^3.2.0";
        deps["react-email"] = "^2.1.0";
        deps["@react-email/components"] = "^0.0.15";
        break;
      case "email:sendgrid":
        deps["@sendgrid/mail"] = "^8.0.0";
        break;
      case "ai:openai":
        deps["openai"] = "^4.28.0";
        deps["ai"] = "^3.0.0";
        break;
      case "ai:anthropic":
        deps["@anthropic-ai/sdk"] = "^0.32.1";
        break;
      case "analytics:posthog":
        deps["posthog-js"] = "^1.100.0";
        break;
      case "analytics:plausible":
        deps["next-plausible"] = "^3.12.0";
        break;
      case "storage:r2":
      case "storage:s3":
        deps["@aws-sdk/client-s3"] = "^3.500.0";
        deps["@aws-sdk/s3-request-presigner"] = "^3.500.0";
        break;
      case "storage:uploadthing":
        deps["uploadthing"] = "^6.0.0";
        deps["@uploadthing/react"] = "^6.0.0";
        break;
      // New integrations (P1)
      case "search:algolia":
        deps["algoliasearch"] = "^4.23.0";
        deps["react-instantsearch"] = "^7.6.0";
        break;
      case "monitoring:sentry":
        deps["@sentry/nextjs"] = "^8.0.0";
        break;
      case "cms:sanity":
        deps["sanity"] = "^3.40.0";
        deps["@sanity/image-url"] = "^1.0.2";
        deps["@sanity/vision"] = "^3.40.0";
        deps["next-sanity"] = "^9.0.0";
        deps["styled-components"] = "^6.1.0";
        break;
      case "images:cloudinary":
      case "imageOpt:cloudinary":
        deps["cloudinary"] = "^2.0.0";
        deps["next-cloudinary"] = "^6.0.0";
        break;
      case "jobs:inngest":
      case "backgroundJobs:inngest":
        deps["inngest"] = "^3.19.0";
        break;
      case "notifications:novu":
        deps["@novu/node"] = "^0.24.0";
        deps["@novu/notification-center"] = "^0.24.0";
        break;
      case "flags:posthog":
      case "featureFlags:posthog-flags":
        deps["posthog-js"] = "^1.100.0";
        break;
    }
  });

  return deps;
}

function generateR2StorageCode(): Record<string, string> {
  return {
    "lib/storage/r2.ts": `import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export async function uploadFile(key: string, body: Buffer | Blob, contentType: string) {
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body instanceof Blob ? Buffer.from(await body.arrayBuffer()) : body,
    ContentType: contentType,
  }));
  return key;
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(R2, command, { expiresIn });
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(R2, command, { expiresIn });
}

export async function deleteFile(key: string) {
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
`,
    "app/api/storage/upload/route.ts": `import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadUrl } from "@/lib/storage/r2";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }
    
    const key = \`uploads/\${Date.now()}-\${filename}\`;
    const uploadUrl = await getSignedUploadUrl(key, contentType);
    
    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Upload URL generation failed:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { template, projectName, integrations, vision, mission, successCriteria, inspiration, envKeys } = body;

    if (!template || !projectName) {
      return apiError(
        ErrorCodes.MISSING_FIELD,
        "Template and project name are required",
        400,
        { required: ["template", "projectName"] },
        "Provide both template and projectName in the request body"
      );
    }

    const zip = new JSZip();
    const templatesPath = getTemplatesPath();
    const templatePath = path.join(templatesPath, template === "ecommerce" ? "saas" : template);

    // Get template component manifest
    const templateManifest = TEMPLATE_COMPONENTS[template] || TEMPLATE_COMPONENTS.saas;

    // Verify template files are accessible - check a few key files
    const keyFiles = [
      path.join(templatePath, "app/page.tsx"),
      path.join(templatePath, "app/layout.tsx"),
    ];
    
    const templateFilesAccessible = keyFiles.some(f => fs.existsSync(f));
    
    if (!templateFilesAccessible) {
      console.log(`Template path not accessible, using generator: ${templatePath}`);
      // In production (Vercel), templates folder may not be bundled
      // Use the new generator system instead
      return await generateZipWithGenerator(body);
    }

    // 1. Add .dd/ directory with project context
    const ddFolder = zip.folder(".dd")!;
    
    ddFolder.file("template-manifest.json", JSON.stringify({
      template,
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      generatedBy: "dawson-does-framework-configurator",
      integrations: Object.entries(integrations)
        .filter(([, v]) => v)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
    }, null, 2));

    if (vision?.trim()) {
      ddFolder.file("vision.md", `# Project Vision\n\n${vision.trim()}\n\n---\n*Generated by dawson-does-framework configurator*\n`);
    }
    
    if (mission?.trim()) {
      ddFolder.file("mission.md", `# Project Mission\n\n${mission.trim()}\n\n---\n*Generated by dawson-does-framework configurator*\n`);
    }
    
    if (successCriteria?.trim()) {
      ddFolder.file("goals.md", `# Success Criteria\n\n${successCriteria.trim()}\n\n---\n*Generated by dawson-does-framework configurator*\n`);
    }

    if (inspiration?.description || (inspiration?.urls && inspiration.urls.length > 0)) {
      let inspirationContent = "# Project Inspiration\n\n";
      if (inspiration.description) {
        inspirationContent += `## Description\n\n${inspiration.description}\n\n`;
      }
      if (inspiration.urls && inspiration.urls.length > 0) {
        inspirationContent += `## Reference URLs\n\n${inspiration.urls.map(url => `- ${url}`).join("\n")}\n\n`;
      }
      inspirationContent += "---\n*Generated by dawson-does-framework configurator*\n";
      ddFolder.file("inspiration.md", inspirationContent);
    }

    // 2. Copy template files
    const allFiles = [
      ...templateManifest.pages,
      ...templateManifest.components,
      ...templateManifest.lib,
      ...templateManifest.styles,
      ...templateManifest.config,
    ];

    for (const relativePath of allFiles) {
      const fullPath = path.join(templatePath, relativePath);
      const content = safeReadFile(fullPath);
      if (content) {
        // Replace template placeholders with project name
        const processedContent = content
          .replace(/{{PROJECT_NAME}}/g, projectName)
          .replace(/"name": "[^"]*"/, `"name": "${projectName.toLowerCase().replace(/\s+/g, "-")}"`)
          .replace(/title: '[^']*'/, `title: '${projectName}'`)
          .replace(/title: "[^"]*"/, `title: "${projectName}"`);
        zip.file(relativePath, processedContent);
      }
    }

    // 3. Add integration files
    const saasPath = path.join(templatesPath, "saas");
    
    for (const [type, provider] of Object.entries(integrations)) {
      if (!provider) continue;
      
      const integrationKey = `${type}:${provider}`;
      const integrationPaths = INTEGRATION_PATHS[integrationKey] || [];
      
      for (const integrationRelPath of integrationPaths) {
        const fullPath = path.join(saasPath, integrationRelPath);
        const content = safeReadFile(fullPath);
        if (content) {
          // Map integration paths to output paths
          // e.g., "integrations/auth/supabase/lib/supabase.ts" -> "lib/supabase.ts"
          const outputPath = integrationRelPath.replace(/^integrations\/[^/]+\/[^/]+\//, "");
          zip.file(outputPath, content);
        }
      }
      
      // Generate R2/S3 storage code if selected (no template files exist)
      if (integrationKey === "storage:r2" || integrationKey === "storage:s3") {
        const storageCode = generateR2StorageCode();
        for (const [filePath, content] of Object.entries(storageCode)) {
          zip.file(filePath, content);
        }
      }
    }

    // 4. Generate package.json with all dependencies
    const baseDeps: Record<string, string> = {
      "next": "^15.0.0",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      // Required by lib/utils.ts (cn function) used by all components
      "clsx": "^2.1.1",
      "tailwind-merge": "^2.6.0",
    };
    
    const integrationDeps = getIntegrationDependencies(integrations);
    const allDeps = { ...baseDeps, ...integrationDeps };
    
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: allDeps,
      devDependencies: {
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        "typescript": "^5.0.0",
        "tailwindcss": "^3.4.0",
        "postcss": "^8.0.0",
        "autoprefixer": "^10.0.0",
      },
    };
    
    zip.file("package.json", JSON.stringify(packageJson, null, 2) + "\n");

    // 5. Generate .env.local.example
    const envVars = getRequiredEnvVars(integrations);
    if (envVars.length > 0) {
      const envContent = [
        "# Environment Variables",
        "# Copy this file to .env.local and fill in your values",
        "",
        ...envVars.map(v => `${v}=${envKeys?.[v] || "your_value_here"}`),
        "",
      ].join("\n");
      zip.file(".env.local.example", envContent);
    }

    // 6. Generate README
    const integrationsDesc = Object.entries(integrations)
      .filter(([, v]) => v)
      .map(([type, provider]) => `- **${type}**: ${provider}`)
      .join("\n");

    const readme = `# ${projectName}

Generated with [dawson-does-framework](https://github.com/jrdaws/dawson-does-framework)

## Template: ${template}

## Integrations

${integrationsDesc || "No integrations selected"}

## Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   Then edit \`.env.local\` and add your API keys.

3. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Context

See the \`.dd/\` directory for project vision, mission, and goals.

---

Generated on ${new Date().toLocaleDateString()}
`;
    zip.file("README.md", readme);

    // 7. Add .gitignore
    zip.file(".gitignore", `# Dependencies
node_modules
.pnpm-debug.log*

# Next.js
.next/
out/

# Production
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`);

    // Generate ZIP blob
    const blob = await zip.generateAsync({ type: "arraybuffer" });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${projectName.toLowerCase().replace(/\s+/g, "-")}.zip"`,
      },
    });
  } catch (error) {
    console.error("[Export ZIP Error]", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to generate project ZIP",
      500,
      process.env.NODE_ENV === "development" ? { details: errorMessage } : undefined,
      "Try again. If the issue persists, use the CLI command instead."
    );
  }
}

/**
 * Generate ZIP using the new generator system
 * Used when filesystem templates aren't available (e.g., Vercel deployment)
 */
async function generateZipWithGenerator(request: ExportRequest): Promise<NextResponse> {
  const { projectName, template, integrations, vision, mission, successCriteria, inspiration } = request;

  try {
    // Convert integrations to the format expected by the generator
    const typedIntegrations: Partial<Record<IntegrationCategory, string>> = {};
    for (const [key, value] of Object.entries(integrations)) {
      if (value) {
        typedIntegrations[key as IntegrationCategory] = value;
      }
    }

    // Build project config
    const config: ProjectConfig = {
      projectName,
      template: template || "saas",
      description: vision || "",
      vision,
      mission,
      integrations: typedIntegrations,
      features: [], // Will add feature support later
      branding: {
        primaryColor: "#000000",
        secondaryColor: "#666666",
      },
    };

    // Generate project
    const project = await generateProject(config);

    // Create ZIP
    const zip = new JSZip();

    // Add .dd/ context directory
    const ddFolder = zip.folder(".dd")!;
    ddFolder.file("template-manifest.json", JSON.stringify({
      template,
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      generatedBy: "dawson-does-framework-generator",
      integrations: typedIntegrations,
    }, null, 2));

    if (vision?.trim()) {
      ddFolder.file("vision.md", `# Project Vision\n\n${vision.trim()}\n`);
    }
    if (mission?.trim()) {
      ddFolder.file("mission.md", `# Project Mission\n\n${mission.trim()}\n`);
    }
    if (successCriteria?.trim()) {
      ddFolder.file("goals.md", `# Success Criteria\n\n${successCriteria.trim()}\n`);
    }
    if (inspiration?.description || (inspiration?.urls && inspiration.urls.length > 0)) {
      let content = "# Inspiration\n\n";
      if (inspiration.description) content += inspiration.description + "\n\n";
      if (inspiration.urls?.length) content += "## References\n\n" + inspiration.urls.map(u => `- ${u}`).join("\n") + "\n";
      ddFolder.file("inspiration.md", content);
    }

    // Add all generated files
    for (const file of project.files) {
      zip.file(file.path, file.content);
    }

    // Add package.json
    zip.file("package.json", JSON.stringify(project.packageJson, null, 2) + "\n");

    // Add .env.local.example
    if (project.envTemplate) {
      zip.file(".env.local.example", project.envTemplate);
    }

    // Add README
    zip.file("README.md", project.readme);

    // Add .gitignore
    zip.file(".gitignore", `# Dependencies
node_modules
.pnpm-debug.log*

# Next.js
.next/
out/

# Production
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`);

    // Add setup instructions if any warnings
    if (project.warnings.length > 0 || project.setupInstructions.length > 0) {
      const setupContent = [
        "# Setup Instructions\n",
        ...project.setupInstructions.map(s => `- ${s}`),
        "",
        project.warnings.length > 0 ? "## Warnings\n" : "",
        ...project.warnings.map(w => `⚠️ ${w}`),
      ].join("\n");
      ddFolder.file("SETUP.md", setupContent);
    }

    // Generate ZIP
    const blob = await zip.generateAsync({ type: "arraybuffer" });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${projectName.toLowerCase().replace(/\s+/g, "-")}.zip"`,
      },
    });
  } catch (error) {
    console.error("[Generator ZIP Error]", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to generate project",
      500,
      process.env.NODE_ENV === "development" ? { details: errorMessage } : undefined,
      "Try the CLI instead: npx @jrdaws/framework create " + template + " " + projectName
    );
  }
}

