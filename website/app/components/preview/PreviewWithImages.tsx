"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ComposedPreview } from "./ComposedPreview";
import {
  generatePatternImages,
  patternNeedsImages,
  type ImageGenerationContext,
} from "@/lib/patterns/image-generator";
import type { PreviewComposition, PreviewComponent } from "./types";
import type { WebsiteAnalysis } from "./analysis-types";
import { Loader2, Sparkles, Image as ImageIcon, RefreshCw, CheckCircle } from "lucide-react";

interface ProjectVision {
  projectName: string;
  description: string;
  audience: string;
  tone?: string;
}

interface PreviewWithImagesProps {
  composition: PreviewComposition;
  websiteAnalysis?: WebsiteAnalysis;
  vision: ProjectVision;
  currentPath: string;
  onNavigate: (path: string) => void;
  autoGenerate?: boolean;
  className?: string;
  editable?: boolean;
  onComponentEdit?: (componentId: string, updates: Record<string, unknown>) => void;
}

interface GenerationState {
  isGenerating: boolean;
  progress: { current: number; total: number };
  generatedCount: number;
  cachedCount: number;
  failedCount: number;
  errors: string[];
}

// Store enhanced components with generated images
interface EnhancedComponents {
  [componentId: string]: Record<string, unknown>;
}

export function PreviewWithImages({
  composition,
  websiteAnalysis,
  vision,
  currentPath,
  onNavigate,
  editable = false,
  onComponentEdit,
  autoGenerate = false,
  className,
}: PreviewWithImagesProps) {
  const [enhancedProps, setEnhancedProps] = useState<EnhancedComponents>({});
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: { current: 0, total: 0 },
    generatedCount: 0,
    cachedCount: 0,
    failedCount: 0,
    errors: [],
  });

  // Count components needing images
  const componentsNeedingImages = composition.pages.flatMap(page =>
    page.components.filter(c => patternNeedsImages(c.type))
  );

  const handleGenerateImages = useCallback(async () => {
    setState(s => ({
      ...s,
      isGenerating: true,
      progress: { current: 0, total: componentsNeedingImages.length },
      errors: [],
    }));

    const context: ImageGenerationContext = {
      projectName: vision.projectName,
      domain: vision.description,
      industry: extractIndustry(vision.description),
      primaryColor: websiteAnalysis?.visual?.colorPalette?.primary,
      audience: vision.audience,
    };

    const newEnhancedProps: EnhancedComponents = {};
    let generatedCount = 0;
    let cachedCount = 0;
    let failedCount = 0;
    const allErrors: string[] = [];

    let componentIndex = 0;

    for (const page of composition.pages) {
      for (const component of page.components) {
        if (patternNeedsImages(component.type)) {
          componentIndex++;
          setState(s => ({
            ...s,
            progress: { current: componentIndex, total: componentsNeedingImages.length },
          }));

          try {
            const result = await generatePatternImages(
              component.type,
              component.props,
              context,
              {
                skipLowPriority: false,
                maxConcurrent: 2,
              }
            );

            newEnhancedProps[component.id] = result.props;

            // Count stats
            for (const img of result.generatedImages) {
              if (img.cached) {
                cachedCount++;
              } else {
                generatedCount++;
              }
            }
            if (result.errors.length > 0) {
              failedCount += result.errors.length;
              allErrors.push(...result.errors);
            }
          } catch (error) {
            failedCount++;
            allErrors.push(
              `${component.type}: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }
      }
    }

    setEnhancedProps(newEnhancedProps);
    setState({
      isGenerating: false,
      progress: { current: componentsNeedingImages.length, total: componentsNeedingImages.length },
      generatedCount,
      cachedCount,
      failedCount,
      errors: allErrors,
    });
  }, [composition, vision, websiteAnalysis, componentsNeedingImages.length]);

  // Auto-generate images when composition changes and autoGenerate is true
  const compositionIdRef = useRef<string>("");
  
  useEffect(() => {
    // Create a stable ID for this composition
    const compositionId = composition.pages.map(p => p.components.map(c => c.type).join("-")).join("|");
    
    // Only auto-generate once per composition and when autoGenerate is enabled
    if (autoGenerate && compositionId !== compositionIdRef.current && !state.isGenerating) {
      compositionIdRef.current = compositionId;
      handleGenerateImages();
    }
  }, [autoGenerate, composition, state.isGenerating, handleGenerateImages]);

  // Add enhanced props (with generated images) to composition
  const compositionWithImages: PreviewComposition = {
    ...composition,
    pages: composition.pages.map((page) => ({
      ...page,
      components: page.components.map((component) => {
        const enhanced = enhancedProps[component.id];
        if (enhanced) {
          return {
            ...component,
            props: { ...component.props, ...enhanced },
          };
        }
        return component;
      }),
    })),
  };

  const hasImages = Object.keys(enhancedProps).length > 0;
  const totalImagesGenerated = state.generatedCount + state.cachedCount;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Image Generation Controls */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">
            {state.isGenerating
              ? `Generating ${state.progress.current}/${state.progress.total}...`
              : hasImages
              ? `${totalImagesGenerated} images generated`
              : `${componentsNeedingImages.length} sections need images`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasImages && !state.isGenerating && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">
                {state.generatedCount} new, {state.cachedCount} cached
                {state.failedCount > 0 && (
                  <span className="text-amber-400">, {state.failedCount} failed</span>
                )}
              </span>
            </div>
          )}

          <button
            onClick={handleGenerateImages}
            disabled={state.isGenerating}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              state.isGenerating
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : hasImages
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {state.progress.current}/{state.progress.total}
              </>
            ) : hasImages ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Images
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error messages with actionable guidance */}
      {state.errors.length > 0 && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/30 space-y-1">
          {state.errors.map((error, i) => {
            // Check for specific error codes and provide helpful actions
            const isRateLimit = error.includes("Rate limit") || error.includes("429");
            const isCredits = error.includes("credit") || error.includes("billing") || error.includes("402");
            const isApiKey = error.includes("API key") || error.includes("401") || error.includes("unauthorized");
            
            return (
              <div key={i} className="text-xs">
                <p className="text-red-400 font-medium">{error}</p>
                {isRateLimit && (
                  <p className="text-amber-400 mt-1">
                    💡 Wait 1-2 minutes, then click Regenerate. For higher limits, upgrade at{" "}
                    <a href="https://replicate.com/account/billing" target="_blank" rel="noopener" className="underline hover:text-amber-300">
                      replicate.com/account/billing
                    </a>
                  </p>
                )}
                {isCredits && (
                  <p className="text-amber-400 mt-1">
                    💳 Add credits to continue generating images:{" "}
                    <a href="https://replicate.com/account/billing" target="_blank" rel="noopener" className="underline hover:text-amber-300">
                      replicate.com/account/billing
                    </a>
                  </p>
                )}
                {isApiKey && (
                  <p className="text-amber-400 mt-1">
                    🔑 Check your REPLICATE_API_TOKEN in .env.local or get a new key at{" "}
                    <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener" className="underline hover:text-amber-300">
                      replicate.com/account/api-tokens
                    </a>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview with injected images */}
      <div className="flex-1 overflow-auto">
        <ComposedPreview
          composition={compositionWithImages}
          currentPath={currentPath}
          onNavigate={onNavigate}
          websiteAnalysis={websiteAnalysis}
          editable={editable}
          onComponentEdit={onComponentEdit}
        />
      </div>
    </div>
  );
}

// Helper functions

/**
 * Extract industry from project description
 */
function extractIndustry(description: string): string {
  const industries: Record<string, string[]> = {
    ecommerce: ["shop", "store", "sell", "product", "cart", "checkout", "retail", "commerce"],
    saas: ["software", "platform", "app", "tool", "service", "dashboard", "analytics"],
    finance: ["bank", "finance", "money", "payment", "invest", "trading", "crypto"],
    health: ["health", "medical", "doctor", "patient", "clinic", "fitness", "wellness"],
    education: ["learn", "course", "school", "teach", "education", "training", "tutor"],
    food: ["food", "restaurant", "recipe", "cook", "menu", "delivery", "catering"],
    travel: ["travel", "hotel", "booking", "vacation", "trip", "tour", "flight"],
    real_estate: ["property", "real estate", "house", "apartment", "rent", "mortgage"],
    technology: ["tech", "software", "digital", "ai", "data", "cloud", "automation"],
  };

  const lowerDesc = description.toLowerCase();
  
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      return industry;
    }
  }
  
  return "technology"; // Default
}

