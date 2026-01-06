"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { 
  ProjectComposition, 
  PageComposition, 
  SectionComposition,
  ColorScheme,
} from "@/lib/composer/types";
import { PreviewSection } from "./PreviewSection";
import { PatternSwapper } from "./PatternSwapper";

// Dynamically import pattern components
const Nav = dynamic(() => import("./Nav").then(m => ({ default: m.Nav })), {
  loading: () => <SectionLoader />,
});
const Hero = dynamic(() => import("./Hero").then(m => ({ default: m.Hero })), {
  loading: () => <SectionLoader height="400px" />,
});
const ProductGrid = dynamic(() => import("./ProductGrid").then(m => ({ default: m.ProductGrid })), {
  loading: () => <SectionLoader height="300px" />,
});
const FeatureCards = dynamic(() => import("./FeatureCards").then(m => ({ default: m.FeatureCards })), {
  loading: () => <SectionLoader height="250px" />,
});
const PricingTable = dynamic(() => import("./PricingTable").then(m => ({ default: m.PricingTable })), {
  loading: () => <SectionLoader height="400px" />,
});
const Testimonials = dynamic(() => import("./Testimonials").then(m => ({ default: m.Testimonials })), {
  loading: () => <SectionLoader height="250px" />,
});
const CTA = dynamic(() => import("./CTA").then(m => ({ default: m.CTA })), {
  loading: () => <SectionLoader height="150px" />,
});
const Footer = dynamic(() => import("./Footer").then(m => ({ default: m.Footer })), {
  loading: () => <SectionLoader height="150px" />,
});
const FAQ = dynamic(() => import("./FAQ").then(m => ({ default: m.FAQ })), {
  loading: () => <SectionLoader height="300px" />,
});
const BlogPostList = dynamic(() => import("./BlogPostList").then(m => ({ default: m.BlogPostList })), {
  loading: () => <SectionLoader height="300px" />,
});
const DashboardPreview = dynamic(() => import("./DashboardPreview").then(m => ({ default: m.DashboardPreview })), {
  loading: () => <SectionLoader height="500px" />,
});

// Pattern ID to Component mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PATTERN_MAP: Record<string, React.ComponentType<any>> = {
  "nav-standard": Nav,
  "hero-centered": Hero,
  "hero-split-image": Hero,
  "features-grid": FeatureCards,
  "features-alternating": FeatureCards,
  "pricing-three-tier": PricingTable,
  "testimonials-grid": Testimonials,
  "testimonials-carousel": Testimonials,
  "cta-simple": CTA,
  "faq-accordion": FAQ,
  "footer-multi-column": Footer,
  "stats-simple": DashboardPreview,
  // Legacy component names
  "Nav": Nav,
  "Hero": Hero,
  "FeatureCards": FeatureCards,
  "PricingTable": PricingTable,
  "Testimonials": Testimonials,
  "CTA": CTA,
  "FAQ": FAQ,
  "Footer": Footer,
  "ProductGrid": ProductGrid,
  "BlogPostList": BlogPostList,
  "DashboardPreview": DashboardPreview,
};

function SectionLoader({ height = "100px" }: { height?: string }) {
  return (
    <div 
      className="w-full bg-[#111111] flex items-center justify-center"
      style={{ height }}
    >
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
    </div>
  );
}

// ============================================================================
// Props & Types
// ============================================================================

interface ColorOverrides {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  muted?: string;
}

interface ComposedPreviewProps {
  composition: ProjectComposition;
  onRegenerateSection?: (pageId: string, sectionIndex: number, feedback?: string) => Promise<void>;
  onSwapPattern?: (pageId: string, sectionIndex: number, newPatternId: string) => Promise<void>;
  editable?: boolean;
  scale?: number;
  className?: string;
  /** Color overrides extracted from inspiration URL */
  colorOverrides?: ColorOverrides;
}

// ============================================================================
// Global Styles Application
// ============================================================================

function applyGlobalStyles(
  colorScheme: ColorScheme, 
  overrides?: ColorOverrides
): React.CSSProperties {
  // Merge composition colors with any overrides (overrides take precedence)
  const colors = {
    primary: overrides?.primary || colorScheme.primary,
    secondary: overrides?.secondary || colorScheme.secondary,
    accent: overrides?.accent || colorScheme.accent,
    background: overrides?.background || colorScheme.background,
    foreground: overrides?.foreground || colorScheme.foreground,
    muted: overrides?.muted || colorScheme.muted,
  };

  return {
    '--preview-primary': colors.primary,
    '--preview-secondary': colors.secondary,
    '--preview-accent': colors.accent,
    '--preview-background': colors.background,
    '--preview-foreground': colors.foreground,
    '--preview-muted': colors.muted,
    backgroundColor: colors.background,
    color: colors.foreground,
  } as React.CSSProperties;
}

// ============================================================================
// Page Navigation
// ============================================================================

interface PreviewNavProps {
  pages: PageComposition[];
  current: PageComposition;
  onChange: (page: PageComposition) => void;
}

function PreviewNav({ pages, current, onChange }: PreviewNavProps) {
  const currentIndex = pages.findIndex(p => p.pageId === current.pageId);
  
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm border-b border-white/10">
      {/* Page tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {pages.map((page) => (
          <button
            key={page.pageId}
            onClick={() => onChange(page)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap",
              page.pageId === current.pageId
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {page.path === "/" ? "Home" : page.path.replace(/^\//, "")}
          </button>
        ))}
      </div>
      
      {/* Navigation arrows */}
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={() => currentIndex > 0 && onChange(pages[currentIndex - 1])}
          disabled={currentIndex === 0}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-white/50 min-w-[3rem] text-center">
          {currentIndex + 1} / {pages.length}
        </span>
        <button
          onClick={() => currentIndex < pages.length - 1 && onChange(pages[currentIndex + 1])}
          disabled={currentIndex === pages.length - 1}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Preview Page Component
// ============================================================================

interface PreviewPageProps {
  page: PageComposition;
  editable?: boolean;
  onRegenerateSection?: (sectionIndex: number, feedback?: string) => Promise<void>;
  onSwapPattern?: (sectionIndex: number, newPatternId: string) => Promise<void>;
}

function PreviewPage({ page, editable, onRegenerateSection, onSwapPattern }: PreviewPageProps) {
  const [swapperOpen, setSwapperOpen] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  
  const handleRegenerate = useCallback(async (index: number, feedback?: string) => {
    if (!onRegenerateSection) return;
    setRegenerating(index);
    try {
      await onRegenerateSection(index, feedback);
    } finally {
      setRegenerating(null);
    }
  }, [onRegenerateSection]);
  
  return (
    <div className="w-full">
      {page.sections.map((section, index) => {
        const Component = PATTERN_MAP[section.patternId];
        
        if (!Component) {
          console.warn(`[ComposedPreview] Unknown pattern: ${section.patternId}`);
          return (
            <div 
              key={index}
              className="w-full py-8 bg-red-500/10 border border-red-500/30 text-center"
            >
              <p className="text-red-400 text-sm">Unknown pattern: {section.patternId}</p>
            </div>
          );
        }
        
        const isRegenerating = regenerating === index;
        
        return (
          <PreviewSection
            key={`${section.patternId}-${index}`}
            section={section}
            index={index}
            editable={editable}
            isRegenerating={isRegenerating}
            onRegenerate={editable ? (feedback) => handleRegenerate(index, feedback) : undefined}
            onSwap={editable ? () => setSwapperOpen(index) : undefined}
          >
            <Component 
              {...section.props} 
              variant={section.variant}
              previewMode={true}
            />
            
            {/* Pattern Swapper Modal */}
            {swapperOpen === index && (
              <PatternSwapper
                currentPatternId={section.patternId}
                category={getCategoryFromPatternId(section.patternId)}
                onSwap={async (newPatternId) => {
                  setSwapperOpen(null);
                  if (onSwapPattern) {
                    await onSwapPattern(index, newPatternId);
                  }
                }}
                onClose={() => setSwapperOpen(null)}
              />
            )}
          </PreviewSection>
        );
      })}
    </div>
  );
}

function getCategoryFromPatternId(patternId: string): string {
  const categoryMap: Record<string, string> = {
    "nav": "navigation",
    "hero": "hero",
    "features": "features",
    "pricing": "pricing",
    "testimonials": "testimonials",
    "cta": "cta",
    "faq": "faq",
    "footer": "footer",
    "stats": "stats",
  };
  
  for (const [prefix, category] of Object.entries(categoryMap)) {
    if (patternId.startsWith(prefix)) return category;
  }
  
  return "unknown";
}

// ============================================================================
// Main Component
// ============================================================================

export function ComposedPreview({
  composition,
  onRegenerateSection,
  onSwapPattern,
  editable = false,
  scale = 1,
  className = "",
  colorOverrides,
}: ComposedPreviewProps) {
  const { pages, globalStyles } = composition;
  const [currentPage, setCurrentPage] = useState<PageComposition>(pages[0]);
  
  // Update current page if pages change
  if (!pages.find(p => p.pageId === currentPage.pageId)) {
    setCurrentPage(pages[0]);
  }
  
  const handleRegenerateSection = useCallback(async (sectionIndex: number, feedback?: string) => {
    if (onRegenerateSection) {
      await onRegenerateSection(currentPage.pageId, sectionIndex, feedback);
    }
  }, [onRegenerateSection, currentPage.pageId]);
  
  const handleSwapPattern = useCallback(async (sectionIndex: number, newPatternId: string) => {
    if (onSwapPattern) {
      await onSwapPattern(currentPage.pageId, sectionIndex, newPatternId);
    }
  }, [onSwapPattern, currentPage.pageId]);
  
  return (
    <div 
      className={cn("w-full min-h-screen", className)}
      style={{
        ...applyGlobalStyles(globalStyles.colorScheme, colorOverrides),
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        width: scale !== 1 ? `${100 / scale}%` : undefined,
      }}
    >
      {/* Multi-page navigation */}
      {pages.length > 1 && (
        <PreviewNav 
          pages={pages} 
          current={currentPage} 
          onChange={setCurrentPage} 
        />
      )}
      
      {/* Current page content */}
      <PreviewPage 
        page={currentPage}
        editable={editable}
        onRegenerateSection={handleRegenerateSection}
        onSwapPattern={handleSwapPattern}
      />
      
      {/* Composition metadata */}
      {editable && (
        <div className="fixed bottom-4 right-4 z-50 text-[10px] text-white/40 bg-black/60 px-2 py-1 rounded">
          Confidence: {composition.metadata.confidence}% | 
          Generated in {composition.metadata.generationTime}ms
        </div>
      )}
    </div>
  );
}

export default ComposedPreview;

