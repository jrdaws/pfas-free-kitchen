"use client";

import dynamic from "next/dynamic";
import { getTemplateComposition } from "@/lib/preview/template-compositions";
import { Loader2 } from "lucide-react";

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
}: PreviewRendererProps) {
  const composition = getTemplateComposition(template);
  
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
  const brandingStyles: Record<string, string> = {};
  if (branding?.customColors?.primary) {
    brandingStyles['--preview-primary'] = branding.customColors.primary;
  }
  if (branding?.customColors?.secondary) {
    brandingStyles['--preview-secondary'] = branding.customColors.secondary;
  }
  if (branding?.customColors?.accent) {
    brandingStyles['--preview-accent'] = branding.customColors.accent;
  }
  if (branding?.customColors?.background) {
    brandingStyles['--preview-background'] = branding.customColors.background;
  }

  return (
    <div 
      className={`w-full min-h-screen bg-[#0A0A0A] ${className}`}
      style={{
        ...(brandingStyles as React.CSSProperties),
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        width: scale !== 1 ? `${100 / scale}%` : undefined,
      }}
    >
      {composition.sections.map((section, index) => {
        const Component = COMPONENT_MAP[section.component];
        
        if (!Component) {
          console.warn(`Unknown component: ${section.component}`);
          return null;
        }

        // Merge props: defaults < template < AI-generated
        const props = {
          ...composition.defaultProps[section.component],
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
 * Wraps the preview in a device-like frame for display in the configurator.
 */
export function PreviewFrame({
  template,
  componentProps,
  integrations = {},
  selectedFeatures = {},
  branding,
  title = "Preview",
}: PreviewRendererProps & { title?: string }) {
  const activeCount = Object.values(integrations).filter(Boolean).length;
  const featureCount = Object.values(selectedFeatures).flat().length;
  
  return (
    <div className="rounded-xl overflow-hidden bg-[#111111] border border-white/10 shadow-2xl">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0A0A0A] border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-[#1a1a1a] rounded-lg px-4 py-1.5 text-center">
            <span className="text-foreground-muted text-xs font-mono">
              localhost:3000
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {featureCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
              {featureCount} features
            </span>
          )}
          {activeCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {activeCount} services
            </span>
          )}
          <span className="text-foreground-muted text-xs">{title}</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-h-[600px] overflow-y-auto">
        <PreviewRenderer
          template={template}
          componentProps={componentProps}
          integrations={integrations}
          selectedFeatures={selectedFeatures}
          branding={branding}
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
 */
export function MobilePreviewFrame({
  template,
  componentProps,
  integrations = {},
  selectedFeatures = {},
  branding,
}: PreviewRendererProps) {
  return (
    <div className="w-[375px] mx-auto">
      {/* Phone Frame */}
      <div className="rounded-[40px] bg-[#1a1a1a] p-3 border-4 border-[#333]">
        {/* Notch */}
        <div className="flex justify-center mb-2">
          <div className="w-24 h-6 bg-black rounded-full" />
        </div>
        
        {/* Screen */}
        <div className="rounded-[28px] overflow-hidden bg-[#0A0A0A] aspect-[9/19.5] overflow-y-auto">
          <PreviewRenderer
            template={template}
            componentProps={componentProps}
            integrations={integrations}
            selectedFeatures={selectedFeatures}
            branding={branding}
            scale={0.4}
          />
        </div>
        
        {/* Home Indicator */}
        <div className="flex justify-center mt-2">
          <div className="w-32 h-1 bg-stone-50/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

