"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ExternalLink,
  Info,
  Shuffle,
  Check,
  Layers,
  GripVertical,
} from "lucide-react";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { PreviewFrame, MobilePreviewFrame } from "@/components/preview/PreviewRenderer";
import { generateFallbackProps, UserConfig } from "@/lib/ai/preview-generator";
import { getTemplateComposition, TemplateComposition } from "@/lib/preview/template-compositions";

interface ComponentAwarePreviewProps {
  template: string;
  integrations: Record<string, string>;
  inspirations: Array<{ type: string; value: string; preview?: string }>;
  description: string;
}

export function ComponentAwarePreview({
  template,
  integrations,
  inspirations,
  description,
}: ComponentAwarePreviewProps) {
  const {
    projectName,
    vision,
    mission,
  } = useConfiguratorStore();

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [componentProps, setComponentProps] = useState<Record<string, Record<string, unknown>>>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [isCustomOrder, setIsCustomOrder] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);

  // Get template composition
  const composition = getTemplateComposition(template);

  // Initialize with fallback props on mount or when config changes
  useEffect(() => {
    const userConfig: UserConfig = {
      template,
      projectName: projectName || "My Project",
      vision: vision || undefined,
      mission: mission || undefined,
      description: description || undefined,
      inspiration: inspirations[0]?.value || undefined,
      integrations,
    };

    const fallbackProps = generateFallbackProps(userConfig);
    setComponentProps(fallbackProps);

    // Set default section order from composition
    if (!isCustomOrder) {
      setSectionOrder(composition.sections.map(s => s.component));
    }
  }, [template, projectName, vision, mission, description, inspirations, integrations, composition, isCustomOrder]);

  // Handle AI enhancement
  const handleAIEnhance = async () => {
    setIsGenerating(true);

    try {
      // Call AI to generate enhanced props
      const response = await fetch("/api/preview/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          projectName,
          vision,
          mission,
          description,
          inspiration: inspirations[0]?.value,
          integrations,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.componentProps) {
          setComponentProps(prev => ({
            ...prev,
            ...data.componentProps,
          }));
        }
        if (data.sectionOrder) {
          setSectionOrder(data.sectionOrder);
          setIsCustomOrder(true);
        }
      }
    } catch (error) {
      console.error("AI enhancement failed:", error);
      // Keep using fallback props
    } finally {
      setIsGenerating(false);
    }
  };

  // Move section up/down
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...sectionOrder];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    
    if (swapIndex >= 0 && swapIndex < newOrder.length) {
      [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
      setSectionOrder(newOrder);
      setIsCustomOrder(true);
    }
  };

  // Toggle section visibility
  const toggleSection = (componentName: string) => {
    if (sectionOrder.includes(componentName)) {
      setSectionOrder(prev => prev.filter(s => s !== componentName));
    } else {
      setSectionOrder(prev => [...prev, componentName]);
    }
    setIsCustomOrder(true);
  };

  // Get reordered composition for rendering
  const getOrderedComposition = (): TemplateComposition => {
    const orderedSections = sectionOrder
      .map(name => composition.sections.find(s => s.component === name))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);

    return {
      ...composition,
      sections: orderedSections,
    };
  };

  // Available sections not currently in order
  const availableSections = composition.sections
    .filter(s => !sectionOrder.includes(s.component))
    .map(s => s.component);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Component-Aware Preview
        </h2>
        <p className="text-muted-foreground">
          Real components, AI-customized content
        </p>
        <div className="flex justify-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
            <Check className="h-3 w-3" /> Same components as export
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded">
            <Layers className="h-3 w-3" /> Customizable sections
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Viewport Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewport("desktop")}
                className={`p-2 rounded transition-colors ${
                  viewport === "desktop"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/10"
                }`}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`p-2 rounded transition-colors ${
                  viewport === "tablet"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/10"
                }`}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`p-2 rounded transition-colors ${
                  viewport === "mobile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/10"
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSectionEditor(!showSectionEditor)}
                variant={showSectionEditor ? "default" : "outline"}
                size="sm"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Reorder Sections
              </Button>
              <Button
                onClick={handleAIEnhance}
                disabled={isGenerating}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Enhance Content
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsCustomOrder(false);
                  setSectionOrder(composition.sections.map(s => s.component));
                }}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Section Reorder Editor */}
        {showSectionEditor && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Customize Page Layout
              </h3>
              <p className="text-xs text-muted-foreground">
                Use ↑↓ arrows to reorder • Preview updates automatically
              </p>
            </div>
            
            {/* Instructions banner */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-orange-300">
                <strong>How it works:</strong> Click the up/down arrows to move sections. 
                Required sections (Nav, Footer) stay in the layout. 
                Click × to hide optional sections, or click items on the right to add them back.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Sections */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active Sections ({sectionOrder.length})
                </p>
                <div className="space-y-1.5">
                  {sectionOrder.map((componentName, index) => {
                    const section = composition.sections.find(s => s.component === componentName);
                    const isFirst = index === 0;
                    const isLast = index === sectionOrder.length - 1;
                    
                    return (
                      <div
                        key={componentName}
                        className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2.5 group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-muted text-xs font-mono text-muted-foreground">
                          {index + 1}
                        </div>
                        <span className="text-sm flex-1 font-medium">{componentName}</span>
                        {section?.required && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                            required
                          </span>
                        )}
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => moveSection(index, "up")}
                            disabled={isFirst}
                            className="p-1.5 hover:bg-primary/10 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title={isFirst ? "Already at top" : "Move up"}
                          >
                            <span className="text-sm">↑</span>
                          </button>
                          <button
                            onClick={() => moveSection(index, "down")}
                            disabled={isLast}
                            className="p-1.5 hover:bg-primary/10 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title={isLast ? "Already at bottom" : "Move down"}
                          >
                            <span className="text-sm">↓</span>
                          </button>
                          {!section?.required ? (
                            <button
                              onClick={() => toggleSection(componentName)}
                              className="p-1.5 hover:bg-destructive/20 text-destructive/70 hover:text-destructive rounded transition-colors"
                              title="Remove section"
                            >
                              <span className="text-sm">×</span>
                            </button>
                          ) : (
                            <div className="w-7" /> // Spacer for alignment
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Sections */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                  Hidden Sections ({availableSections.length})
                </p>
                <div className="space-y-1.5">
                  {availableSections.length === 0 ? (
                    <div className="bg-background/50 border border-dashed border-border rounded-lg px-3 py-6 text-center">
                      <p className="text-xs text-muted-foreground">All sections are visible</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">Remove sections to see them here</p>
                    </div>
                  ) : (
                    availableSections.map(componentName => (
                      <button
                        key={componentName}
                        onClick={() => toggleSection(componentName)}
                        className="w-full flex items-center gap-2 bg-background/50 border border-dashed border-border rounded-lg px-3 py-2.5 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <span className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">+</span>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{componentName}</span>
                        <span className="text-[10px] text-muted-foreground/50 ml-auto group-hover:text-muted-foreground transition-colors">click to add</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Frame */}
        <div className="flex justify-center">
          {viewport === "mobile" ? (
            <MobilePreviewFrame
              template={template}
              componentProps={componentProps}
            />
          ) : (
            <div
              className="w-full transition-all duration-300"
              style={{
                maxWidth: viewport === "tablet" ? "768px" : "100%",
              }}
            >
              <PreviewFrame
                template={template}
                componentProps={componentProps}
                title={`${projectName || template} Preview`}
              />
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-card border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">What you see is what you get.</strong>{" "}
                These are the exact components that will be in your exported project.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Click "AI Enhance" to customize content based on your vision</li>
                <li>Use "Reorder Sections" to change the page layout</li>
                <li>All styling uses your selected template&apos;s design system</li>
                <li>{sectionOrder.length} sections active for {template} template</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

