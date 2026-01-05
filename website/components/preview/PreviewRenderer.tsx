"use client";

import dynamic from "next/dynamic";
import { getTemplateComposition } from "@/lib/preview/template-compositions";
import { Loader2 } from "lucide-react";
import type { ProjectComposition } from "@/lib/composer/types";
import { ComposedPreview } from "./ComposedPreview";

// Feature preview components - show selected integrations visually
import { IntegrationStack } from "./features/IntegrationBadge";
import { CartIcon } from "./features/CartIcon";
import { SearchBar } from "./features/SearchBar";
import { AIAssistant } from "./features/AIAssistant";
import { SubscriptionBadge } from "./features/SubscriptionBadge";

// Dynamically import components to reduce initial bundle
const Nav = dynamic(() => import("./Nav").then(m => ({ default: m.Nav })), {
  loading: () => <ComponentLoader />,
});
const Hero = dynamic(() => import("./Hero").then(m => ({ default: m.Hero })), {
  loading: () => <ComponentLoader height="600px" />,
});
const ProductGrid = dynamic(() => import("./ProductGrid").then(m => ({ default: m.ProductGrid })), {
  loading: () => <ComponentLoader height="400px" />,
});
const FeatureCards = dynamic(() => import("./FeatureCards").then(m => ({ default: m.FeatureCards })), {
  loading: () => <ComponentLoader height="300px" />,
});
const PricingTable = dynamic(() => import("./PricingTable").then(m => ({ default: m.PricingTable })), {
  loading: () => <ComponentLoader height="500px" />,
});
const Testimonials = dynamic(() => import("./Testimonials").then(m => ({ default: m.Testimonials })), {
  loading: () => <ComponentLoader height="300px" />,
});
const CTA = dynamic(() => import("./CTA").then(m => ({ default: m.CTA })), {
  loading: () => <ComponentLoader height="200px" />,
});
const Footer = dynamic(() => import("./Footer").then(m => ({ default: m.Footer })), {
  loading: () => <ComponentLoader height="200px" />,
});
const FAQ = dynamic(() => import("./FAQ").then(m => ({ default: m.FAQ })), {
  loading: () => <ComponentLoader height="400px" />,
});
const BlogPostList = dynamic(() => import("./BlogPostList").then(m => ({ default: m.BlogPostList })), {
  loading: () => <ComponentLoader height="400px" />,
});
const DashboardPreview = dynamic(() => import("./DashboardPreview").then(m => ({ default: m.DashboardPreview })), {
  loading: () => <ComponentLoader height="600px" />,
});

// Component map for dynamic rendering
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  Nav,
  Hero,
  ProductGrid,
  FeatureCards,
  PricingTable,
  Testimonials,
  CTA,
  Footer,
  FAQ,
  BlogPostList,
  DashboardPreview,
};

function ComponentLoader({ height = "100px" }: { height?: string }) {
  return (
    <div 
      className="w-full bg-[#111111] flex items-center justify-center"
      style={{ height }}
    >
      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
    </div>
  );
}

interface PreviewRendererProps {
  template: string;
  componentProps: Record<string, Record<string, unknown>>;
  integrations?: Record<string, string>;
  selectedFeatures?: Record<string, string[]>;
  branding?: {
    colorScheme?: string;
    customColors?: Record<string, string>;
  };
  scale?: number;
  className?: string;
  // NEW: Support for composed previews
  composition?: ProjectComposition;
  editable?: boolean;
  onRegenerateSection?: (pageId: string, sectionIndex: number, feedback?: string) => Promise<void>;
  onSwapPattern?: (pageId: string, sectionIndex: number, newPatternId: string) => Promise<void>;
}

/**
 * PreviewRenderer
 * 
 * Renders a preview using polished components with AI-generated props.
 * This is the core component for the "Component-Aware Preview" architecture.
 */
// Helper to check if a feature category has selected features
function hasFeature(selectedFeatures: Record<string, string[]>, category: string): boolean {
  return (selectedFeatures[category]?.length || 0) > 0;
}

// Helper to check if any e-commerce feature is selected
function hasEcommerceFeatures(selectedFeatures: Record<string, string[]>): boolean {
  const ecommerceCategories = ["ecommerce", "shopping-cart", "checkout", "product-catalog"];
  return ecommerceCategories.some(cat => hasFeature(selectedFeatures, cat));
}

// Helper to check if search features are selected
function hasSearchFeatures(selectedFeatures: Record<string, string[]>): boolean {
  return hasFeature(selectedFeatures, "search-filter") || hasFeature(selectedFeatures, "search");
}

// Helper to check if billing/subscription features are selected
function hasBillingFeatures(selectedFeatures: Record<string, string[]>): boolean {
  return hasFeature(selectedFeatures, "billing") || hasFeature(selectedFeatures, "subscription");
}

export function PreviewRenderer({
  template,
  componentProps,
  integrations = {},
  selectedFeatures = {},
  branding,
  scale = 1,
  className = "",
  composition,
  editable = false,
  onRegenerateSection,
  onSwapPattern,
}: PreviewRendererProps) {
  // NEW: If a composition is provided, render using ComposedPreview
  if (composition) {
    return (
      <ComposedPreview
        composition={composition}
        editable={editable}
        onRegenerateSection={onRegenerateSection}
        onSwapPattern={onSwapPattern}
        scale={scale}
        className={className}
      />
    );
  }
  
  // FALLBACK: Use template-based rendering
  const templateComposition = getTemplateComposition(template);
  
  // Filter out empty integrations for display
  const activeIntegrations = Object.fromEntries(
    Object.entries(integrations).filter(([_, v]) => v)
  );
  const hasIntegrations = Object.keys(activeIntegrations).length > 0;
  
  // Determine which feature indicators to show
  const showCart = hasEcommerceFeatures(selectedFeatures);
  const showSearch = hasSearchFeatures(selectedFeatures) || !!integrations.search;
  const showAI = !!integrations.ai;
  const showBilling = hasBillingFeatures(selectedFeatures) || !!integrations.payments;

  // Apply branding colors if provided (using CSS custom properties)
  // Default to orange theme if no custom colors provided
  const defaultColors = {
    primary: '#F97316',      // Orange-500
    secondary: '#EA580C',    // Orange-600
    accent: '#FB923C',       // Orange-400  
    background: '#0A0A0A',   // Dark background
    foreground: '#FFFFFF',   // White text
    muted: '#78716C',        // Stone-500
    card: '#1A1A1A',         // Slightly lighter dark
  };

  const brandingStyles: Record<string, string> = {
    '--preview-primary': branding?.customColors?.primary || defaultColors.primary,
    '--preview-secondary': branding?.customColors?.secondary || defaultColors.secondary,
    '--preview-accent': branding?.customColors?.accent || defaultColors.accent,
    '--preview-background': branding?.customColors?.background || defaultColors.background,
    '--preview-foreground': branding?.customColors?.foreground || defaultColors.foreground,
    '--preview-muted': defaultColors.muted,
    '--preview-card': defaultColors.card,
  };

  // Apply color scheme presets if selected
  if (branding?.colorScheme) {
    const presets: Record<string, Record<string, string>> = {
      'ocean': { primary: '#0EA5E9', secondary: '#0284C7', accent: '#38BDF8', background: '#0C1222' },
      'forest': { primary: '#22C55E', secondary: '#16A34A', accent: '#4ADE80', background: '#0A1A0F' },
      'sunset': { primary: '#F97316', secondary: '#EA580C', accent: '#FB923C', background: '#1A0A0A' },
      'lavender': { primary: '#A855F7', secondary: '#9333EA', accent: '#C084FC', background: '#0F0A1A' },
      'coral': { primary: '#F43F5E', secondary: '#E11D48', accent: '#FB7185', background: '#1A0A0F' },
      'midnight': { primary: '#6366F1', secondary: '#4F46E5', accent: '#818CF8', background: '#0A0A14' },
    };
    const preset = presets[branding.colorScheme];
    if (preset) {
      brandingStyles['--preview-primary'] = preset.primary;
      brandingStyles['--preview-secondary'] = preset.secondary;
      brandingStyles['--preview-accent'] = preset.accent;
      brandingStyles['--preview-background'] = preset.background;
    }
  }

  return (
    <div 
      className={`w-full min-h-screen ${className}`}
      style={{
        ...(brandingStyles as React.CSSProperties),
        backgroundColor: 'var(--preview-background)',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        width: scale !== 1 ? `${100 / scale}%` : undefined,
      }}
    >
      {templateComposition.sections.map((section, index) => {
        const Component = COMPONENT_MAP[section.component];
        
        if (!Component) {
          console.warn(`Unknown component: ${section.component}`);
          return null;
        }

        // Merge props: defaults < template < AI-generated
        const props = {
          ...templateComposition.defaultProps[section.component],
          ...componentProps[section.component],
          // Pass integrations to components that can use them
          integrations: activeIntegrations,
          // Pass feature flags
          showCart,
          showSearch,
        };

        // Skip optional sections without props
        if (!section.required && !componentProps[section.component]) {
          return null;
        }

        return <Component key={`${section.component}-${index}`} {...props} />;
      })}
      
      {/* Feature Indicators - Floating UI elements based on selected features */}
      <div className="fixed right-4 top-20 z-50 flex flex-col gap-2">
        {/* Cart Icon - shows when e-commerce selected */}
        {showCart && (
          <CartIcon variant="floating" itemCount={3} />
        )}
      </div>

      {/* AI Assistant FAB - shows when AI provider selected */}
      {showAI && (
        <div className="fixed right-4 bottom-20 z-50">
          <AIAssistant provider={integrations.ai} variant="fab" />
        </div>
      )}

      {/* Subscription badge - shows when billing features selected */}
      {showBilling && (
        <div className="fixed top-4 right-4 z-50">
          <SubscriptionBadge plan="pro" variant="badge" />
        </div>
      )}
      
      {/* Integration Stack - Shows what services are configured */}
      {hasIntegrations && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-[10px] text-white/50 mb-1.5">Configured Services</div>
          <IntegrationStack integrations={activeIntegrations} maxShow={6} />
        </div>
      )}
    </div>
  );
}

/**
 * PreviewFrame
 * 
 * Wraps the preview in a clean browser-like frame for display in the configurator.
 * Uses theme colors instead of hardcoded Mac window chrome.
 */
export function PreviewFrame({
  template,
  componentProps,
  integrations = {},
  selectedFeatures = {},
  branding,
  composition,
  editable,
  onRegenerateSection,
  onSwapPattern,
  title = "Preview",
}: PreviewRendererProps & { title?: string }) {
  const activeCount = Object.values(integrations).filter(Boolean).length;
  const featureCount = Object.values(selectedFeatures).flat().length;
  
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border shadow-2xl">
      {/* Clean Browser Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/50 border-b border-border">
        {/* URL Bar */}
        <div className="flex-1">
          <div className="bg-background rounded-lg px-3 py-1.5 flex items-center gap-2 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground text-xs font-mono">
              localhost:3000
            </span>
          </div>
        </div>
        
        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {composition && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              AI Composed
            </span>
          )}
          {featureCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              {featureCount} features
            </span>
          )}
          {activeCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {activeCount} services
            </span>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative max-h-[600px] overflow-y-auto bg-background">
        {/* Floating Integration Stack */}
        {activeCount > 0 && !composition && (
          <div className="absolute top-2 right-2 z-20">
            <IntegrationStack 
              integrations={integrations} 
              maxShow={4}
            />
          </div>
        )}
        <PreviewRenderer
          template={template}
          componentProps={componentProps}
          integrations={integrations}
          selectedFeatures={selectedFeatures}
          branding={branding}
          composition={composition}
          editable={editable}
          onRegenerateSection={onRegenerateSection}
          onSwapPattern={onSwapPattern}
          scale={0.6}
        />
      </div>
    </div>
  );
}

/**
 * MobilePreviewFrame
 * 
 * Mobile device preview for responsive testing.
 * Uses theme colors for consistency.
 */
export function MobilePreviewFrame({
  template,
  componentProps,
  integrations = {},
  selectedFeatures = {},
  branding,
  composition,
  editable,
  onRegenerateSection,
  onSwapPattern,
}: PreviewRendererProps) {
  return (
    <div className="w-[375px] mx-auto">
      {/* Phone Frame - using theme colors */}
      <div className="rounded-[40px] bg-muted p-3 border-4 border-border">
        {/* Notch */}
        <div className="flex justify-center mb-2">
          <div className="w-24 h-6 bg-background rounded-full border border-border" />
        </div>
        
        {/* Screen */}
        <div className="rounded-[28px] overflow-hidden bg-background aspect-[9/19.5] overflow-y-auto border border-border">
          <PreviewRenderer
            template={template}
            componentProps={componentProps}
            integrations={integrations}
            selectedFeatures={selectedFeatures}
            branding={branding}
            composition={composition}
            editable={editable}
            onRegenerateSection={onRegenerateSection}
            onSwapPattern={onSwapPattern}
            scale={0.4}
          />
        </div>
        
        {/* Home Indicator */}
        <div className="flex justify-center mt-2">
          <div className="w-32 h-1 bg-foreground/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

