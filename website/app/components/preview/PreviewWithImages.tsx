"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ComposedPreview } from "./ComposedPreview";
import {
  generatePreviewImages,
  type PreviewImageRequest,
} from "@/lib/preview-image-generator";
import type { PreviewComposition } from "./types";
import type { WebsiteAnalysis } from "./analysis-types";
import { Loader2, Sparkles, Image as ImageIcon, RefreshCw, CheckCircle } from "lucide-react";
import type { SectionType, ImageSlot } from "@/lib/image-prompt-builder";

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
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  generatedCount: number;
  cachedCount: number;
  errors: string[];
}

export function PreviewWithImages({
  composition,
  websiteAnalysis,
  vision,
  currentPath,
  onNavigate,
  autoGenerate = false,
  className,
}: PreviewWithImagesProps) {
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    generatedCount: 0,
    cachedCount: 0,
    errors: [],
  });

  // Extract sections needing images from composition
  const getSectionsNeedingImages = useCallback(() => {
    const sections: PreviewImageRequest["sections"] = [];

    for (const page of composition.pages) {
      for (const component of page.components) {
        const needsImage = componentNeedsImage(component.type);
        if (needsImage) {
          sections.push({
            type: componentToSectionType(component.type),
            needsImage: true,
            imageSlot: inferImageSlot(component.type),
          });
        }
      }
    }

    return sections;
  }, [composition.pages]);

  const handleGenerateImages = useCallback(async () => {
    setState((s) => ({
      ...s,
      isGenerating: true,
      progress: 0,
      errors: [],
    }));

    try {
      const sections = getSectionsNeedingImages();

      const result = await generatePreviewImages({
        sections,
        websiteAnalysis,
        vision,
      });

      setImages(result.images);
      setState({
        isGenerating: false,
        progress: 100,
        generatedCount: result.generatedCount,
        cachedCount: result.cachedCount,
        errors: result.errors,
      });
    } catch (error) {
      setState((s) => ({
        ...s,
        isGenerating: false,
        errors: [error instanceof Error ? error.message : "Generation failed"],
      }));
    }
  }, [getSectionsNeedingImages, websiteAnalysis, vision]);

  // Get image for a component
  const getImageForComponent = (componentType: string): string | undefined => {
    const sectionType = componentToSectionType(componentType);
    const slot = inferImageSlot(componentType);
    return images.get(`${sectionType}-${slot}`);
  };

  // Add images to composition
  const compositionWithImages: PreviewComposition = {
    ...composition,
    pages: composition.pages.map((page) => ({
      ...page,
      components: page.components.map((component) => {
        const imageUrl = getImageForComponent(component.type);
        if (imageUrl && componentNeedsImage(component.type)) {
          return {
            ...component,
            props: {
              ...component.props,
              backgroundImage: imageUrl,
              heroImage: imageUrl,
              image: imageUrl,
            },
          };
        }
        return component;
      }),
    })),
  };

  const hasImages = images.size > 0;
  const sectionsCount = getSectionsNeedingImages().length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Image Generation Controls */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">
            {hasImages
              ? `${images.size} images generated`
              : `${sectionsCount} sections need images`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasImages && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">
                {state.generatedCount} new, {state.cachedCount} cached
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
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            )}
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
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
        />
      </div>
    </div>
  );
}

// Helper functions

// Extract base type from pattern ID (e.g., "hero-split-image" -> "hero")
function getBaseType(type: string): string {
  const prefixes = ["hero", "features", "pricing", "testimonials", "cta", "footer", "faq", "navigation", "stats", "team", "product", "blog", "about"];
  
  for (const prefix of prefixes) {
    if (type.startsWith(prefix)) {
      return prefix;
    }
  }
  
  return type.split("-")[0];
}

function componentNeedsImage(componentType: string): boolean {
  const baseType = getBaseType(componentType);
  const imageComponents = ["hero", "features", "testimonials", "product", "about", "team"];
  return imageComponents.includes(baseType);
}

function componentToSectionType(componentType: string): SectionType {
  const baseType = getBaseType(componentType);
  const mapping: Record<string, SectionType> = {
    hero: "hero",
    features: "features",
    testimonials: "testimonials",
    product: "product",
    pricing: "pricing",
    cta: "cta",
    about: "about",
    team: "team",
  };
  return mapping[baseType] || "features";
}

function inferImageSlot(componentType: string): ImageSlot {
  const baseType = getBaseType(componentType);
  const mapping: Record<string, ImageSlot> = {
    hero: "hero",
    features: "feature",
    testimonials: "avatar",
    product: "product",
    about: "feature",
    team: "avatar",
    pricing: "background",
    cta: "background",
  };
  return mapping[baseType] || "feature";
}

