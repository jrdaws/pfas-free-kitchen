"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ExternalLink, AlertCircle, CheckCircle2, Copy, Check, Key, BookOpen, Terminal } from "lucide-react";
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
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Environment Variables
          </h2>
          <p className="text-muted-foreground">
            No environment variables required for your selected integrations
          </p>
        </div>

        <Card className="max-w-2xl mx-auto border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              All Set!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-foreground">
              You can proceed to the next step. Environment variables can be added later if needed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Configure Environment Variables
        </h2>
        <p className="text-muted-foreground mb-4">
          Add API keys for your selected integrations
        </p>
        <div className="inline-flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Progress:</span>
          <span className="font-mono text-primary font-bold">
            {completedCount}/{requiredEnvVars.length}
          </span>
          {allCompleted && <CheckCircle2 className="h-4 w-4 text-primary" />}
        </div>
        <p className="text-xs text-primary mt-2">
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
            <Card key={envVar}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className={`h-4 w-4 ${isFilled ? "text-primary" : "text-muted-foreground"}`} />
                    {doc?.label || envVar}
                  {isFilled && <Badge variant="success" className="ml-auto">Filled</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Instructions */}
                {doc && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{doc.instructions}</span>
                    </p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Dashboard
                    </a>
                  </div>
                )}

                {/* Input Field */}
                <div className="space-y-2">
                  <Label htmlFor={envVar} className="text-foreground font-mono text-xs">
                    {envVar}
                  </Label>
                  <div className="relative">
                    <Input
                      id={envVar}
                      type={isVisible ? "text" : "password"}
                      value={value}
                      onChange={(e) => onEnvKeyChange(envVar, e.target.value)}
                      placeholder="Paste ONLY the value (not the variable name)"
                      className="font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(envVar)}
                      className="absolute right-2 top-1/2 -transtone-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Installation Instructions & Commands */}
        {requiredEnvVars.length > 0 && (
          <>
            {/* Step-by-step instructions for beginners */}
            <Card className="border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
                  <BookOpen className="h-4 w-4" />
                  How to Install Environment Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-xs text-muted-foreground">
                  <p className="text-foreground font-bold">After exporting your project, you need to create a <code className="text-primary">.env.local</code> file:</p>
                  
                  <div className="space-y-2 ml-4">
                    <p><span className="text-primary font-bold">Step 1:</span> Open a terminal and navigate to your exported project folder</p>
                    <p><span className="text-primary font-bold">Step 2:</span> Create the <code className="text-primary">.env.local</code> file in the <span className="underline">root of your project</span> (same folder as <code>package.json</code>)</p>
                    <p><span className="text-primary font-bold">Step 3:</span> Paste the environment variables inside the file</p>
                    <p><span className="text-primary font-bold">Step 4:</span> Replace placeholder values with your actual API keys</p>
                    <p><span className="text-primary font-bold">Step 5:</span> Run <code className="text-primary">npm run dev</code> to start your app</p>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/30 rounded p-3 mt-4">
                    <p className="text-destructive flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Important:</strong> The <code>.env.local</code> file should NEVER be committed to git. It&apos;s already in the <code>.gitignore</code> file.</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terminal command to create .env.local automatically */}
            <Card className="border-primary/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-primary">
                  <Terminal className="h-4 w-4" />
                  Quick Install Command (Copy & Run in Terminal)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Run this command in your project folder to automatically create your <code className="text-primary">.env.local</code> file:
                </p>
                <div className="relative">
                  <pre className="text-xs bg-black p-4 rounded border border-primary/30 overflow-x-auto font-mono text-foreground">
                    <span className="text-muted-foreground"># Navigate to your project (replace with your project path)</span>{"\n"}
                    <span className="text-primary">cd</span> ./your-project-name{"\n\n"}
                    <span className="text-muted-foreground"># Create .env.local with your API keys</span>{"\n"}
                    <span className="text-primary">cat</span> {">"} .env.local {"<<"} &apos;EOF&apos;{"\n"}
                    {requiredEnvVars.map((varName) => (
                      <span key={varName}>{varName}={envKeys[varName] || "YOUR_VALUE_HERE"}{"\n"}</span>
                    ))}
                    EOF
                  </pre>
                  <Button
                    onClick={() => {
                      const command = `cat > .env.local << 'EOF'\n${requiredEnvVars.map((varName) => `${varName}=${envKeys[varName] || "YOUR_VALUE_HERE"}`).join("\n")}\nEOF`;
                      navigator.clipboard.writeText(command);
                      setCopiedKey("__command__");
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                  >
                    {copiedKey === "__command__" ? (
                      <><Check className="mr-1 h-3 w-3" /> Copied!</>
                    ) : (
                      <><Copy className="mr-1 h-3 w-3" /> Copy Command</>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Windows users:</strong> Use PowerShell and run:{" "}
                  <code className="text-primary">notepad .env.local</code> then paste the content below.
                </p>
              </CardContent>
            </Card>

            {/* Copy env content for manual paste */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Copy className="h-4 w-4" />
                  .env.local File Content (Copy & Paste Manually)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  If you prefer, copy this content and paste it into a new file called <code className="text-primary">.env.local</code> in your project root:
              </p>
                <pre className="text-xs bg-muted p-4 rounded border border-border overflow-x-auto font-mono text-foreground">
                {requiredEnvVars.map((varName) => (
                  <div key={varName}>
                    {varName}={envKeys[varName] || "your_value_here"}
                  </div>
                ))}
              </pre>
              <Button
                onClick={handleCopyEnvFile}
                  className="w-full"
              >
                {copiedKey === "__all__" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                      Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                      Copy .env.local Content
                  </>
                )}
              </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-primary" />
                    <a href="https://nextjs.org/docs/app/building-your-application/configuring/environment-variables" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Next.js Environment Variables Guide
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-primary" />
                    <a href="https://github.com/jrdaws/dawson-does-framework#environment-setup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Framework Documentation
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-primary" />
                    <a href="https://vercel.com/docs/environment-variables" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Vercel Deployment Environment Variables
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
