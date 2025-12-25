"use client";

import dynamic from "next/dynamic";
import { getTemplateComposition } from "@/lib/preview/template-compositions";
import { Loader2 } from "lucide-react";

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
  scale?: number;
  className?: string;
}

/**
 * PreviewRenderer
 * 
 * Renders a preview using polished components with AI-generated props.
 * This is the core component for the "Component-Aware Preview" architecture.
 */
export function PreviewRenderer({
  template,
  componentProps,
  scale = 1,
  className = "",
}: PreviewRendererProps) {
  const composition = getTemplateComposition(template);

  return (
    <div 
      className={`w-full min-h-screen bg-[#0A0A0A] ${className}`}
      style={{
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

        const props = {
          ...composition.defaultProps[section.component],
          ...componentProps[section.component],
        };

        // Skip optional sections without props
        if (!section.required && !componentProps[section.component]) {
          return null;
        }

        return <Component key={`${section.component}-${index}`} {...props} />;
      })}
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
  title = "Preview",
}: PreviewRendererProps & { title?: string }) {
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
            <span className="text-gray-500 text-xs font-mono">
              localhost:3000
            </span>
          </div>
        </div>
        <span className="text-gray-500 text-xs">{title}</span>
      </div>

      {/* Preview Content */}
      <div className="max-h-[600px] overflow-y-auto">
        <PreviewRenderer
          template={template}
          componentProps={componentProps}
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

