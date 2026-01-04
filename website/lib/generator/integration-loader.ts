/**
 * Integration Loader
 * 
 * Loads integration templates from the packages/templates directory.
 */

import { IntegrationManifest, GeneratedFile, IntegrationCategory } from "./types";

// Integration manifests - these would ideally be loaded from the filesystem
// but for Next.js we import them statically
const INTEGRATION_MANIFESTS: Record<string, Record<string, IntegrationManifest>> = {
  auth: {
    supabase: {
      id: "supabase",
      name: "Supabase Auth",
      category: "auth",
      version: "1.0.0",
      description: "Authentication with Supabase",
      files: [
        { path: "lib/supabase/client.ts", template: "auth/supabase/lib/client.ts" },
        { path: "lib/supabase/server.ts", template: "auth/supabase/lib/server.ts" },
        { path: "lib/supabase/index.ts", template: "auth/supabase/lib/index.ts" },
        { path: "lib/supabase/middleware.ts", template: "auth/supabase/lib/middleware.ts" },
        { path: "middleware.ts", template: "auth/supabase/middleware.ts" },
        { path: "components/auth/LoginForm.tsx", template: "auth/supabase/components/LoginForm.tsx" },
        { path: "components/auth/SignupForm.tsx", template: "auth/supabase/components/SignupForm.tsx" },
        { path: "components/auth/UserMenu.tsx", template: "auth/supabase/components/UserMenu.tsx" },
        { path: "components/auth/AuthProvider.tsx", template: "auth/supabase/components/AuthProvider.tsx" },
        { path: "hooks/useAuth.ts", template: "auth/supabase/hooks/useAuth.ts" },
        { path: "app/(auth)/login/page.tsx", template: "auth/supabase/app/login/page.tsx", transform: "mustache" },
        { path: "app/(auth)/signup/page.tsx", template: "auth/supabase/app/signup/page.tsx", transform: "mustache" },
        { path: "app/(auth)/layout.tsx", template: "auth/supabase/app/auth-layout.tsx" },
        { path: "app/auth/callback/route.ts", template: "auth/supabase/app/callback/route.ts" },
      ],
      dependencies: {
        npm: {
          "@supabase/supabase-js": "^2.45.0",
          "@supabase/ssr": "^0.5.0",
        },
        env: [
          { name: "NEXT_PUBLIC_SUPABASE_URL", description: "Supabase project URL", required: true, public: true },
          { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", description: "Supabase anon key", required: true, public: true },
          { name: "SUPABASE_SERVICE_ROLE_KEY", description: "Supabase service role key", required: false },
        ],
      },
      postInstall: [
        "Create a Supabase project at https://supabase.com/dashboard",
        "Copy your project URL and anon key to .env.local",
        "Enable Email Auth in Authentication > Providers",
      ],
    },
    clerk: {
      id: "clerk",
      name: "Clerk",
      category: "auth",
      version: "1.0.0",
      description: "Drop-in authentication with Clerk",
      files: [
        { path: "components/auth/ClerkProvider.tsx", template: "auth/clerk/components/ClerkProvider.tsx" },
        { path: "components/auth/UserButton.tsx", template: "auth/clerk/components/UserButton.tsx" },
        { path: "components/auth/SignInButton.tsx", template: "auth/clerk/components/SignInButton.tsx" },
        { path: "middleware.ts", template: "auth/clerk/middleware.ts" },
        { path: "app/sign-in/[[...sign-in]]/page.tsx", template: "auth/clerk/app/sign-in/page.tsx" },
        { path: "app/sign-up/[[...sign-up]]/page.tsx", template: "auth/clerk/app/sign-up/page.tsx", transform: "mustache" },
      ],
      dependencies: {
        npm: {
          "@clerk/nextjs": "^5.0.0",
        },
        env: [
          { name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", description: "Clerk publishable key", required: true, public: true },
          { name: "CLERK_SECRET_KEY", description: "Clerk secret key", required: true },
        ],
      },
      postInstall: [
        "Create a Clerk account at https://clerk.com",
        "Create an application and get your API keys",
        "Wrap your app with ClerkProvider in layout.tsx",
      ],
    },
  },
  email: {
    resend: {
      id: "resend",
      name: "Resend",
      category: "email",
      version: "1.0.0",
      description: "Transactional email with React Email templates",
      files: [
        { path: "lib/email/resend.ts", template: "email/resend/lib/resend.ts" },
        { path: "lib/email/send.ts", template: "email/resend/lib/send.ts" },
        { path: "emails/WelcomeEmail.tsx", template: "email/resend/emails/WelcomeEmail.tsx", transform: "mustache" },
        { path: "emails/PasswordResetEmail.tsx", template: "email/resend/emails/PasswordResetEmail.tsx", transform: "mustache" },
        { path: "emails/InvoiceEmail.tsx", template: "email/resend/emails/InvoiceEmail.tsx", transform: "mustache" },
        { path: "app/api/email/send/route.ts", template: "email/resend/app/api/send/route.ts" },
      ],
      dependencies: {
        npm: {
          "resend": "^3.0.0",
          "@react-email/components": "^0.0.15",
          "react-email": "^2.0.0",
        },
        env: [
          { name: "RESEND_API_KEY", description: "Resend API key", required: true },
          { name: "EMAIL_FROM", description: "Default sender email", required: true, example: "noreply@yourdomain.com" },
        ],
      },
      postInstall: [
        "Sign up at https://resend.com",
        "Get your API key from the dashboard",
        "Add and verify your domain for production emails",
      ],
    },
  },
  analytics: {
    posthog: {
      id: "posthog",
      name: "PostHog",
      category: "analytics",
      version: "1.0.0",
      description: "Product analytics with feature flags",
      files: [
        { path: "lib/analytics/posthog.ts", template: "analytics/posthog/lib/posthog.ts" },
        { path: "components/analytics/PostHogProvider.tsx", template: "analytics/posthog/components/PostHogProvider.tsx" },
        { path: "components/analytics/PostHogPageView.tsx", template: "analytics/posthog/components/PostHogPageView.tsx" },
        { path: "hooks/useAnalytics.ts", template: "analytics/posthog/hooks/useAnalytics.ts" },
        { path: "hooks/useFeatureFlag.ts", template: "analytics/posthog/hooks/useFeatureFlag.ts" },
      ],
      dependencies: {
        npm: {
          "posthog-js": "^1.100.0",
        },
        env: [
          { name: "NEXT_PUBLIC_POSTHOG_KEY", description: "PostHog project API key", required: true, public: true },
          { name: "NEXT_PUBLIC_POSTHOG_HOST", description: "PostHog host URL", required: false, example: "https://app.posthog.com", public: true },
        ],
      },
      postInstall: [
        "Sign up at https://posthog.com",
        "Create a project and copy your API key",
        "Add PostHogProvider to your root layout",
      ],
    },
  },
  payments: {
    stripe: {
      id: "stripe",
      name: "Stripe",
      category: "payments",
      version: "1.0.0",
      description: "Stripe payments and subscriptions",
      files: [
        { path: "lib/stripe/client.ts", template: "payments/stripe/lib/client.ts" },
        { path: "lib/stripe/server.ts", template: "payments/stripe/lib/server.ts" },
        { path: "lib/stripe/config.ts", template: "payments/stripe/lib/config.ts", transform: "mustache" },
        { path: "components/billing/PricingTable.tsx", template: "payments/stripe/components/PricingTable.tsx" },
        { path: "components/billing/CheckoutButton.tsx", template: "payments/stripe/components/CheckoutButton.tsx" },
        { path: "components/billing/BillingPortalButton.tsx", template: "payments/stripe/components/BillingPortalButton.tsx" },
        { path: "components/billing/SubscriptionStatus.tsx", template: "payments/stripe/components/SubscriptionStatus.tsx" },
        { path: "hooks/useSubscription.ts", template: "payments/stripe/hooks/useSubscription.ts" },
        { path: "app/api/stripe/checkout/route.ts", template: "payments/stripe/app/api/checkout/route.ts" },
        { path: "app/api/stripe/portal/route.ts", template: "payments/stripe/app/api/portal/route.ts" },
        { path: "app/api/webhooks/stripe/route.ts", template: "payments/stripe/app/api/webhooks/route.ts" },
      ],
      dependencies: {
        npm: {
          "stripe": "^14.0.0",
          "@stripe/stripe-js": "^2.0.0",
        },
        env: [
          { name: "STRIPE_SECRET_KEY", description: "Stripe secret key", required: true },
          { name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", description: "Stripe publishable key", required: true, public: true },
          { name: "STRIPE_WEBHOOK_SECRET", description: "Stripe webhook secret", required: true },
          { name: "STRIPE_PRICE_ID_PRO", description: "Pro plan price ID", required: true },
        ],
        integrations: ["auth"],
      },
      postInstall: [
        "Get your API keys from https://dashboard.stripe.com",
        "Create products and prices in Stripe Dashboard",
        "Set up webhook endpoint: /api/webhooks/stripe",
        "For local dev: stripe listen --forward-to localhost:3000/api/webhooks/stripe",
      ],
    },
  },
  ai: {
    openai: {
      id: "openai",
      name: "OpenAI",
      category: "ai",
      version: "1.0.0",
      description: "AI chat and completions with GPT models",
      files: [
        { path: "lib/ai/openai.ts", template: "ai/openai/lib/openai.ts" },
        { path: "lib/ai/embeddings.ts", template: "ai/openai/lib/embeddings.ts" },
        { path: "components/ai/ChatInterface.tsx", template: "ai/openai/components/ChatInterface.tsx" },
        { path: "components/ai/ChatMessage.tsx", template: "ai/openai/components/ChatMessage.tsx" },
        { path: "components/ai/ChatInput.tsx", template: "ai/openai/components/ChatInput.tsx" },
        { path: "hooks/useChat.ts", template: "ai/openai/hooks/useChat.ts" },
        { path: "app/api/ai/chat/route.ts", template: "ai/openai/app/api/chat/route.ts" },
        { path: "app/api/ai/completion/route.ts", template: "ai/openai/app/api/completion/route.ts" },
      ],
      dependencies: {
        npm: {
          "openai": "^4.50.0",
          "ai": "^3.2.0",
        },
        env: [
          { name: "OPENAI_API_KEY", description: "OpenAI API key", required: true },
          { name: "OPENAI_MODEL", description: "Default model (optional)", required: false, example: "gpt-4o" },
        ],
      },
      postInstall: [
        "Get your API key from https://platform.openai.com/api-keys",
        "Add OPENAI_API_KEY to your .env.local",
      ],
    },
  },
  storage: {
    uploadthing: {
      id: "uploadthing",
      name: "Uploadthing",
      category: "storage",
      version: "1.0.0",
      description: "File uploads with Uploadthing",
      files: [
        { path: "lib/uploadthing.ts", template: "storage/uploadthing/lib/uploadthing.ts" },
        { path: "app/api/uploadthing/core.ts", template: "storage/uploadthing/app/api/uploadthing/core.ts" },
        { path: "app/api/uploadthing/route.ts", template: "storage/uploadthing/app/api/uploadthing/route.ts" },
        { path: "components/upload/UploadButton.tsx", template: "storage/uploadthing/components/UploadButton.tsx" },
        { path: "components/upload/UploadDropzone.tsx", template: "storage/uploadthing/components/UploadDropzone.tsx" },
        { path: "components/upload/FilePreview.tsx", template: "storage/uploadthing/components/FilePreview.tsx" },
        { path: "hooks/useUpload.ts", template: "storage/uploadthing/hooks/useUpload.ts" },
      ],
      dependencies: {
        npm: {
          "uploadthing": "^6.13.0",
          "@uploadthing/react": "^6.7.0",
        },
        env: [
          { name: "UPLOADTHING_SECRET", description: "Uploadthing secret key", required: true },
          { name: "UPLOADTHING_APP_ID", description: "Uploadthing app ID", required: true },
        ],
      },
      postInstall: [
        "Create an account at https://uploadthing.com",
        "Create an app and get your API keys",
        "Configure file types in app/api/uploadthing/core.ts",
      ],
    },
  },
  search: {
    algolia: {
      id: "algolia",
      name: "Algolia",
      category: "search",
      version: "1.0.0",
      description: "Lightning-fast search with Algolia",
      files: [
        { path: "lib/search/algolia.ts", template: "search/algolia/lib/algolia.ts" },
        { path: "lib/search/indexer.ts", template: "search/algolia/lib/indexer.ts" },
        { path: "components/search/SearchBox.tsx", template: "search/algolia/components/SearchBox.tsx" },
        { path: "components/search/SearchResults.tsx", template: "search/algolia/components/SearchResults.tsx" },
        { path: "components/search/SearchModal.tsx", template: "search/algolia/components/SearchModal.tsx" },
        { path: "hooks/useSearch.ts", template: "search/algolia/hooks/useSearch.ts" },
      ],
      dependencies: {
        npm: {
          "algoliasearch": "^4.23.0",
          "react-instantsearch": "^7.6.0",
        },
        env: [
          { name: "NEXT_PUBLIC_ALGOLIA_APP_ID", description: "Algolia App ID", required: true, public: true },
          { name: "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY", description: "Algolia Search Key", required: true, public: true },
          { name: "ALGOLIA_ADMIN_KEY", description: "Algolia Admin Key (for indexing)", required: true },
          { name: "NEXT_PUBLIC_ALGOLIA_INDEX_NAME", description: "Index name", required: true, public: true },
        ],
      },
      postInstall: [
        "Create an Algolia account at https://www.algolia.com",
        "Create an application and index",
        "Add all API keys to .env.local",
      ],
    },
  },
};

/**
 * Get manifest for an integration
 */
export function getIntegrationManifest(
  category: IntegrationCategory,
  provider: string
): IntegrationManifest | null {
  return INTEGRATION_MANIFESTS[category]?.[provider] || null;
}

/**
 * Get all files for selected integrations
 */
export async function getIntegrationFiles(
  integrations: Partial<Record<IntegrationCategory, string>>,
  config: { projectName: string }
): Promise<{
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  envVars: { name: string; description: string; required: boolean; example?: string }[];
  postInstall: string[];
}> {
  const files: GeneratedFile[] = [];
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const envVars: { name: string; description: string; required: boolean; example?: string }[] = [];
  const postInstall: string[] = [];

  for (const [category, provider] of Object.entries(integrations)) {
    if (!provider) continue;

    const manifest = getIntegrationManifest(category as IntegrationCategory, provider);
    if (!manifest) {
      console.warn(`No manifest found for ${category}/${provider}`);
      continue;
    }

    // Collect files
    for (const file of manifest.files) {
      // In a real implementation, we'd read the template files
      // For now, we'll mark them for loading
      files.push({
        path: file.path,
        content: `// Template: ${file.template}\n// This file would be loaded from packages/templates/integrations/${file.template}`,
        overwrite: file.overwrite ?? true,
      });
    }

    // Collect dependencies
    Object.assign(dependencies, manifest.dependencies.npm);
    if (manifest.dependencies.npmDev) {
      Object.assign(devDependencies, manifest.dependencies.npmDev);
    }

    // Collect env vars
    envVars.push(...manifest.dependencies.env);

    // Collect post-install instructions
    if (manifest.postInstall) {
      postInstall.push(`\n## ${manifest.name} Setup`, ...manifest.postInstall);
    }
  }

  return { files, dependencies, devDependencies, envVars, postInstall };
}

/**
 * Check if required integrations are satisfied
 */
export function checkIntegrationDependencies(
  integrations: Partial<Record<IntegrationCategory, string>>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const [category, provider] of Object.entries(integrations)) {
    if (!provider) continue;

    const manifest = getIntegrationManifest(category as IntegrationCategory, provider);
    if (!manifest) continue;

    if (manifest.dependencies.integrations) {
      for (const requiredIntegration of manifest.dependencies.integrations) {
        if (!integrations[requiredIntegration as IntegrationCategory]) {
          missing.push(`${manifest.name} requires ${requiredIntegration}`);
        }
      }
    }
  }

  return { valid: missing.length === 0, missing };
}

