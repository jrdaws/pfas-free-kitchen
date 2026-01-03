"use client";

import { Check, ExternalLink, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthProvider {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricingNote: string;
  docsUrl: string;
  signupUrl: string;
  difficulty: "Easy" | "Medium" | "Advanced";
}

const AUTH_PROVIDERS: AuthProvider[] = [
  {
    id: "clerk",
    name: "Clerk",
    description: "Drop-in authentication with beautiful UI",
    features: ["Pre-built UI", "Social login", "MFA", "User management"],
    pricingNote: "Free: 10K MAUs, then $0.02/MAU",
    docsUrl: "https://clerk.com/docs",
    signupUrl: "https://dashboard.clerk.com/sign-up",
    difficulty: "Easy",
  },
  {
    id: "supabase-auth",
    name: "Supabase Auth",
    description: "Auth included with Supabase (already in stack)",
    features: ["Email/password", "OAuth", "Magic links", "Row-level security"],
    pricingNote: "Included with Supabase (free tier)",
    docsUrl: "https://supabase.com/docs/guides/auth",
    signupUrl: "https://supabase.com/dashboard",
    difficulty: "Easy",
  },
  {
    id: "auth0",
    name: "Auth0",
    description: "Enterprise-grade identity platform",
    features: ["SSO", "MFA", "Social login", "Enterprise connections"],
    pricingNote: "Free: 7K MAUs, then $23/mo",
    docsUrl: "https://auth0.com/docs",
    signupUrl: "https://auth0.com/signup",
    difficulty: "Medium",
  },
  {
    id: "nextauth",
    name: "NextAuth.js (Auth.js)",
    description: "Self-hosted, open-source auth for Next.js",
    features: ["Open source", "Self-hosted", "Many providers", "Database adapters"],
    pricingNote: "Free (self-hosted)",
    docsUrl: "https://authjs.dev",
    signupUrl: "https://authjs.dev/getting-started",
    difficulty: "Medium",
  },
];

interface AuthProviderSectionProps {
  selectedProvider?: string;
  onProviderChange: (providerId: string | undefined) => void;
}

export function AuthProviderSection({
  selectedProvider,
  onProviderChange,
}: AuthProviderSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/50">
          Choose an auth provider
        </p>
        {selectedProvider && (
          <button
            onClick={() => onProviderChange(undefined)}
            className="text-[10px] text-white/40 hover:text-white"
          >
            Skip
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {AUTH_PROVIDERS.map((provider) => {
          const isSelected = selectedProvider === provider.id;

          return (
            <button
              key={provider.id}
              onClick={() => onProviderChange(provider.id)}
              className={cn(
                "w-full text-left p-2 rounded-md border transition-all",
                isSelected
                  ? "bg-[var(--primary)]/15 border-[var(--primary)]/40"
                  : "bg-black/20 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-2">
                <Shield className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isSelected ? "text-[var(--primary)]" : "text-white/50"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "font-medium text-xs",
                      isSelected ? "text-[var(--primary)]" : "text-white/90"
                    )}>
                      {provider.name}
                    </span>
                    <span className={cn(
                      "text-[9px] px-1 py-0.5 rounded",
                      provider.difficulty === "Easy" 
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    )}>
                      {provider.difficulty}
                    </span>
                    {isSelected && (
                      <Check className="h-3 w-3 text-[var(--primary)] shrink-0 ml-auto" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 truncate">
                    {provider.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {provider.features.slice(0, 3).map((feature) => (
                      <span key={feature} className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <p className="text-[9px] text-white/40">{provider.pricingNote}</p>
                  <div className="flex gap-2">
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] text-[var(--primary)] hover:underline flex items-center gap-0.5"
                    >
                      Docs <ExternalLink className="h-2 w-2" />
                    </a>
                    <a
                      href={provider.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] text-[var(--primary)] hover:underline flex items-center gap-0.5"
                    >
                      Sign Up <ExternalLink className="h-2 w-2" />
                    </a>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!selectedProvider && (
        <p className="text-[9px] text-white/30 italic">
          Optional: Skip if using Supabase Auth in Tools
        </p>
      )}
    </div>
  );
}

