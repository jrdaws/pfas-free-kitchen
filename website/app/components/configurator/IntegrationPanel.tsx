"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TEMPLATES, INTEGRATION_INFO, type IntegrationType } from "@/lib/templates";
import { Check, ChevronRight, AlertCircle, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  auth: "/images/configurator/categories/auth.svg",
  payments: "/images/configurator/categories/payments.svg",
  email: "/images/configurator/categories/email.svg",
  db: "/images/configurator/categories/database.svg",
  ai: "/images/configurator/categories/ai.svg",
  analytics: "/images/configurator/categories/analytics.svg",
  storage: "/images/configurator/categories/storage.svg",
  other: "/images/configurator/categories/other.svg",
};

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  auth: "Authentication",
  payments: "Payments",
  email: "Email",
  db: "Database",
  ai: "AI / LLM",
  analytics: "Analytics",
  storage: "Storage",
  other: "Other",
};

// Provider info type
interface IntegrationProviderInfo {
  name: string;
  description: string;
}

interface IntegrationPanelProps {
  template: string;
  integrations: Record<string, string>;
  onIntegrationChange: (type: string, provider: string) => void;
  mode: "beginner" | "advanced";
}

export function IntegrationPanel({
  template,
  integrations,
  onIntegrationChange,
  mode,
}: IntegrationPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];

  // Calculate category states
  const categoryStates = useMemo(() => {
    if (!selectedTemplate) return {};
    
    const states: Record<string, { configured: boolean; required: boolean; provider?: string }> = {};
    
    Object.keys(selectedTemplate.supportedIntegrations).forEach((type) => {
      const requiredIntegrations = selectedTemplate.requiredIntegrations as readonly string[];
      states[type] = {
        configured: !!integrations[type],
        required: requiredIntegrations.includes(type),
        provider: integrations[type],
      };
    });
    
    return states;
  }, [selectedTemplate, integrations]);

  // Get categories from template
  const categories = useMemo(() => {
    if (!selectedTemplate) return [];
    return Object.keys(selectedTemplate.supportedIntegrations);
  }, [selectedTemplate]);

  // Get providers for selected category
  const providers = useMemo(() => {
    if (!selectedTemplate || !selectedCategory) return [];
    return selectedTemplate.supportedIntegrations[selectedCategory as keyof typeof selectedTemplate.supportedIntegrations] || [];
  }, [selectedTemplate, selectedCategory]);

  // Auto-select first category
  useMemo(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Invalid template selected</span>
      </div>
    );
  }

  const selectedProvider = selectedCategory ? integrations[selectedCategory] : null;
  const defaultIntegrations = selectedTemplate.defaultIntegrations as Record<string, string>;

  // Count configured integrations
  const configuredCount = Object.values(integrations).filter(Boolean).length;
  const totalCount = categories.length;

  return (
    <div className="h-[calc(100vh-16rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Select Integrations
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose services for your project
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {configuredCount}/{totalCount} configured
        </Badge>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex rounded-xl border border-border overflow-hidden bg-card/30">
        {/* Panel 1: Categories */}
        <div className="w-48 border-r border-border bg-card/50 flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Categories
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {categories.map((category) => {
                const state = categoryStates[category];
                const isActive = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                      "hover:bg-accent/10",
                      isActive && "bg-primary/10 text-primary",
                      !isActive && "text-foreground"
                    )}
                  >
                    {/* Category icon */}
                    {CATEGORY_ICONS[category] && (
                      <Image
                        src={CATEGORY_ICONS[category]}
                        alt={category}
                        width={20}
                        height={20}
                        className={cn(
                          "opacity-60 transition-opacity",
                          isActive && "opacity-100"
                        )}
                      />
                    )}
                    
                    {/* Category label */}
                    <span className="flex-1 text-sm font-medium">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                    
                    {/* Status indicators */}
                    {state?.configured && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                    {state?.required && !state?.configured && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Panel 2: Providers */}
        <div className={cn(
          "w-56 border-r border-border bg-card/30 flex flex-col transition-all duration-200",
          !selectedCategory && "opacity-50"
        )}>
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Providers
            </span>
            {selectedCategory && categoryStates[selectedCategory]?.required && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Required
              </Badge>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {providers.map((provider) => {
                const typeInfo = INTEGRATION_INFO[selectedCategory as IntegrationType] as Record<string, IntegrationProviderInfo> | undefined;
                const info = typeInfo?.[provider];
                if (!info) return null;

                const isSelected = selectedProvider === provider;
                const isDefault = defaultIntegrations?.[selectedCategory!] === provider;
                const showRecommended = mode === "beginner" && isDefault;

                return (
                  <button
                    key={provider}
                    onClick={() => onIntegrationChange(selectedCategory!, provider)}
                    onMouseEnter={() => setHoveredProvider(provider)}
                    onMouseLeave={() => setHoveredProvider(null)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all",
                      "hover:bg-accent/10 border border-transparent",
                      isSelected && "bg-primary/10 border-primary/30 shadow-sm",
                      !isSelected && "text-foreground"
                    )}
                  >
                    {/* Radio indicator */}
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/50"
                    )}>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-50" />
                      )}
                    </div>
                    
                    {/* Provider name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {info.name}
                        </span>
                        {showRecommended && (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">
                            ★
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {/* Skip option for non-required */}
              {selectedCategory && !categoryStates[selectedCategory]?.required && (
                <button
                  onClick={() => onIntegrationChange(selectedCategory!, "")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                    "hover:bg-muted/30 text-muted-foreground text-sm",
                    !selectedProvider && "bg-muted/20"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    !selectedProvider ? "border-muted-foreground bg-muted-foreground/20" : "border-muted-foreground/30"
                  )}>
                    {!selectedProvider && (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                  <span>Skip (none)</span>
                </button>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Panel 3: Configuration/Details */}
        <div className="flex-1 flex flex-col bg-background/50">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Details
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              {selectedCategory && selectedProvider ? (
                <ProviderDetails
                  category={selectedCategory}
                  provider={selectedProvider}
                  isDefault={defaultIntegrations?.[selectedCategory] === selectedProvider}
                />
              ) : selectedCategory ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Info className="h-10 w-10 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Select a provider to see details
                  </p>
                  {categoryStates[selectedCategory]?.required && (
                    <p className="text-sm text-destructive mt-2">
                      This integration is required
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Info className="h-10 w-10 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Select a category to get started
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="mt-4 p-3 rounded-lg bg-card/50 border border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-muted-foreground">Selected:</span>
          {Object.entries(integrations)
            .filter(([, provider]) => provider)
            .map(([type, provider]) => (
              <Badge key={type} variant="secondary" className="gap-1.5">
                <span className="text-muted-foreground text-xs">{CATEGORY_LABELS[type] || type}:</span>
                <span className="font-medium">{provider}</span>
              </Badge>
            ))}
          {configuredCount === 0 && (
            <span className="text-sm text-muted-foreground italic">
              No integrations selected yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Provider Details Component
function ProviderDetails({
  category,
  provider,
  isDefault,
}: {
  category: string;
  provider: string;
  isDefault: boolean;
}) {
  const typeInfo = INTEGRATION_INFO[category as IntegrationType] as Record<string, IntegrationProviderInfo> | undefined;
  const info = typeInfo?.[provider];

  if (!info) {
    return (
      <div className="text-muted-foreground">
        No details available for this provider.
      </div>
    );
  }

  // Provider-specific features (can be expanded)
  const features: Record<string, string[]> = {
    supabase: ["Email/Password Auth", "OAuth (Google, GitHub)", "Row Level Security", "Real-time Subscriptions"],
    clerk: ["Pre-built UI Components", "Multi-factor Auth", "User Management Dashboard", "Webhooks"],
    auth0: ["Enterprise SSO", "Universal Login", "Passwordless", "Bot Detection"],
    stripe: ["Subscriptions", "One-time Payments", "Invoicing", "Customer Portal"],
    lemonsqueezy: ["Digital Products", "License Keys", "EU VAT Handling", "Affiliate Program"],
    resend: ["React Email Templates", "High Deliverability", "Analytics", "Webhooks"],
    sendgrid: ["Email API", "Marketing Campaigns", "Templates", "Analytics"],
    openai: ["GPT-4 / GPT-4o", "Embeddings", "DALL-E", "Whisper"],
    anthropic: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Long Context", "Vision"],
    posthog: ["Product Analytics", "Feature Flags", "Session Replay", "A/B Testing"],
    uploadthing: ["File Uploads", "Image Optimization", "CDN Delivery", "Type-safe API"],
  };

  const providerFeatures = features[provider] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-display font-semibold text-foreground">
            {info.name}
          </h3>
          {isDefault && (
            <Badge variant="success">Recommended</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {info.description}
        </p>
      </div>

      {/* Features */}
      {providerFeatures.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Features</h4>
          <div className="grid grid-cols-2 gap-2">
            {providerFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentation Link */}
      <div className="pt-4 border-t border-border">
        <a
          href={`https://docs.${provider}.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          View {info.name} Documentation
        </a>
      </div>
    </div>
  );
}

