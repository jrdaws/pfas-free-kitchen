"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ExternalLink, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { getRequiredEnvVars } from "@/lib/command-builder";

interface EnvironmentKeysProps {
  integrations: Record<string, string>;
  envKeys: Record<string, string>;
  onEnvKeyChange: (key: string, value: string) => void;
}

// Documentation links for each service
const ENV_VAR_DOCS: Record<string, { label: string; url: string; instructions: string }> = {
  NEXT_PUBLIC_SUPABASE_URL: {
    label: "Supabase Project URL",
    url: "https://supabase.com/dashboard/project/_/settings/api",
    instructions: "Go to Project Settings → API → Project URL",
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    label: "Supabase Anon Key",
    url: "https://supabase.com/dashboard/project/_/settings/api",
    instructions: "Go to Project Settings → API → anon/public key",
  },
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
    label: "Clerk Publishable Key",
    url: "https://dashboard.clerk.com",
    instructions: "Go to API Keys → Copy Publishable key",
  },
  CLERK_SECRET_KEY: {
    label: "Clerk Secret Key",
    url: "https://dashboard.clerk.com",
    instructions: "Go to API Keys → Copy Secret key (keep private!)",
  },
  STRIPE_SECRET_KEY: {
    label: "Stripe Secret Key",
    url: "https://dashboard.stripe.com/apikeys",
    instructions: "Go to Developers → API keys → Secret key (starts with sk_)",
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    label: "Stripe Publishable Key",
    url: "https://dashboard.stripe.com/apikeys",
    instructions: "Go to Developers → API keys → Publishable key (starts with pk_)",
  },
  STRIPE_WEBHOOK_SECRET: {
    label: "Stripe Webhook Secret",
    url: "https://dashboard.stripe.com/webhooks",
    instructions: "Create webhook endpoint → Copy signing secret (starts with whsec_)",
  },
  PADDLE_SECRET_KEY: {
    label: "Paddle Secret API Key",
    url: "https://vendors.paddle.com/authentication",
    instructions: "Go to Developer Tools → Authentication → Generate API Key",
  },
  PADDLE_WEBHOOK_SECRET: {
    label: "Paddle Webhook Secret",
    url: "https://vendors.paddle.com/alerts-webhooks",
    instructions: "Go to Alerts/Webhooks → Create webhook → Copy secret",
  },
  RESEND_API_KEY: {
    label: "Resend API Key",
    url: "https://resend.com/api-keys",
    instructions: "Go to API Keys → Create API Key",
  },
  SENDGRID_API_KEY: {
    label: "SendGrid API Key",
    url: "https://app.sendgrid.com/settings/api_keys",
    instructions: "Go to Settings → API Keys → Create API Key",
  },
  DATABASE_URL: {
    label: "Database Connection String",
    url: "https://planetscale.com",
    instructions: "Go to your database → Connect → Copy connection string",
  },
  OPENAI_API_KEY: {
    label: "OpenAI API Key",
    url: "https://platform.openai.com/api-keys",
    instructions: "Go to API keys → Create new secret key",
  },
  ANTHROPIC_API_KEY: {
    label: "Anthropic API Key",
    url: "https://console.anthropic.com/settings/keys",
    instructions: "Go to Settings → API Keys → Create Key",
  },
  NEXT_PUBLIC_POSTHOG_KEY: {
    label: "PostHog Project API Key",
    url: "https://app.posthog.com/project/settings",
    instructions: "Go to Project Settings → Copy Project API Key",
  },
  NEXT_PUBLIC_POSTHOG_HOST: {
    label: "PostHog Host URL",
    url: "https://app.posthog.com/project/settings",
    instructions: "Usually https://app.posthog.com (or your self-hosted URL)",
  },
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: {
    label: "Plausible Domain",
    url: "https://plausible.io/settings",
    instructions: "Your website domain (e.g., example.com)",
  },
  R2_ACCESS_KEY_ID: {
    label: "Cloudflare R2 Access Key ID",
    url: "https://dash.cloudflare.com/?to=/:account/r2",
    instructions: "Go to R2 → Manage R2 API Tokens → Create API Token",
  },
  R2_SECRET_ACCESS_KEY: {
    label: "Cloudflare R2 Secret Access Key",
    url: "https://dash.cloudflare.com/?to=/:account/r2",
    instructions: "Created with Access Key ID (keep secure!)",
  },
  R2_BUCKET_NAME: {
    label: "R2 Bucket Name",
    url: "https://dash.cloudflare.com/?to=/:account/r2",
    instructions: "Your R2 bucket name",
  },
  AWS_ACCESS_KEY_ID: {
    label: "AWS Access Key ID",
    url: "https://console.aws.amazon.com/iam/home#/security_credentials",
    instructions: "Go to IAM → Users → Security credentials → Create access key",
  },
  AWS_SECRET_ACCESS_KEY: {
    label: "AWS Secret Access Key",
    url: "https://console.aws.amazon.com/iam/home#/security_credentials",
    instructions: "Created with Access Key ID (save immediately, cannot view again!)",
  },
  AWS_BUCKET_NAME: {
    label: "S3 Bucket Name",
    url: "https://s3.console.aws.amazon.com/s3/buckets",
    instructions: "Your S3 bucket name",
  },
};

export function EnvironmentKeys({
  integrations,
  envKeys,
  onEnvKeyChange,
}: EnvironmentKeysProps) {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const requiredEnvVars = getRequiredEnvVars(integrations);

  const toggleVisibility = (key: string) => {
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyEnvFile = () => {
    const envContent = requiredEnvVars
      .map((varName) => `${varName}=${envKeys[varName] || ""}`)
      .join("\n");

    navigator.clipboard.writeText(envContent);
    setCopiedKey("__all__");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const completedCount = requiredEnvVars.filter((key) => envKeys[key]?.trim()).length;
  const allCompleted = completedCount === requiredEnvVars.length;

  if (requiredEnvVars.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
            Environment Variables
          </h2>
          <p className="text-terminal-dim">
            No environment variables required for your selected integrations
          </p>
        </div>

        <div className="max-w-2xl mx-auto terminal-window border-terminal-accent/30">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-accent ml-2">
              <CheckCircle2 className="inline h-3 w-3 mr-1" />
              All Set!
            </span>
          </div>
          <div className="terminal-content text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-terminal-accent mx-auto mb-4" />
            <p className="text-terminal-text">
              You can proceed to the next step. Environment variables can be added later if needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
          Configure Environment Variables
        </h2>
        <p className="text-terminal-dim mb-4">
          Add API keys for your selected integrations
        </p>
        <div className="inline-flex items-center gap-2 text-sm">
          <span className="text-terminal-dim">Progress:</span>
          <span className="font-mono text-terminal-accent font-bold">
            {completedCount}/{requiredEnvVars.length}
          </span>
          {allCompleted && <CheckCircle2 className="h-4 w-4 text-terminal-accent" />}
        </div>
        <p className="text-xs text-terminal-accent mt-2">
          Optional: You can skip this and add keys later in your .env.local file
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {requiredEnvVars.map((envVar) => {
          const doc = ENV_VAR_DOCS[envVar];
          const value = envKeys[envVar] || "";
          const isVisible = visibleKeys[envVar];
          const isFilled = value.trim().length > 0;

          return (
            <div key={envVar} className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot bg-terminal-error"></div>
                <div className="terminal-dot bg-terminal-warning"></div>
                <div className="terminal-dot bg-terminal-text"></div>
                <span className="text-xs ml-2 flex items-center gap-2">
                  <span className={isFilled ? "text-terminal-accent" : "text-terminal-dim"}>
                    {doc?.label || envVar}
                  </span>
                  {isFilled && <CheckCircle2 className="h-3 w-3 text-terminal-accent" />}
                </span>
              </div>
              <div className="terminal-content space-y-3">
                {/* Instructions */}
                {doc && (
                  <div className="text-xs text-terminal-dim space-y-1">
                    <p className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{doc.instructions}</span>
                    </p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-terminal-accent hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Dashboard
                    </a>
                  </div>
                )}

                {/* Input Field */}
                <div className="space-y-2">
                  <Label htmlFor={envVar} className="text-terminal-text font-mono text-xs">
                    {envVar}
                  </Label>
                  <div className="relative">
                    <Input
                      id={envVar}
                      type={isVisible ? "text" : "password"}
                      value={value}
                      onChange={(e) => onEnvKeyChange(envVar, e.target.value)}
                      placeholder="Paste your key here..."
                      className="bg-terminal-bg border-terminal-text/30 text-terminal-text font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(envVar)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-terminal-dim hover:text-terminal-text"
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Copy All Button */}
        {requiredEnvVars.length > 0 && (
          <div className="terminal-window border-terminal-accent/30">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-accent ml-2">
                .env.local File Content
              </span>
            </div>
            <div className="terminal-content space-y-4">
              <p className="text-xs text-terminal-dim">
                Copy all environment variables to create your .env.local file:
              </p>
              <pre className="text-xs bg-terminal-bg/50 p-4 rounded border border-terminal-text/20 overflow-x-auto font-mono text-terminal-text">
                {requiredEnvVars.map((varName) => (
                  <div key={varName}>
                    {varName}={envKeys[varName] || "your_value_here"}
                  </div>
                ))}
              </pre>
              <Button
                onClick={handleCopyEnvFile}
                className="w-full bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg"
              >
                {copiedKey === "__all__" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All to Clipboard
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
