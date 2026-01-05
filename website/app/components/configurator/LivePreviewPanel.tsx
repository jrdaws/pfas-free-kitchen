"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";
import { PreviewFrame, MobilePreviewFrame } from "@/components/preview/PreviewRenderer";
import { generateFallbackProps, UserConfig } from "@/lib/ai/preview-generator";
import type { ProjectComposition } from "@/lib/composer/types";
import { 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  Smartphone, 
  RefreshCw,
  ChevronRight,
  Sparkles,
  Loader2,
  Wand2
} from "lucide-react";

interface LivePreviewPanelProps {
  template: string;
  integrations: Record<string, string>;
  selectedFeatures?: Record<string, string[]>;
  projectName: string;
  description?: string;
  vision?: string;
  mission?: string;
  inspirations?: Array<{ type: string; value: string; preview?: string }>;
  branding?: {
    colorScheme?: string;
    customColors?: Record<string, string>;
  };
  isVisible: boolean;
  onToggle: () => void;
}

export function LivePreviewPanel({
  template,
  integrations,
  selectedFeatures = {},
  projectName,
  description,
  vision,
  mission,
  inspirations = [],
  branding,
  isVisible,
  onToggle,
}: LivePreviewPanelProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [componentProps, setComponentProps] = useState<Record<string, Record<string, unknown>>>({});
  const [composition, setComposition] = useState<ProjectComposition | null>(null);
  
  // Track last rendered values to detect changes
  const [lastRendered, setLastRendered] = useState({
    template: "",
    integrations: {} as Record<string, string>,
    projectName: "",
    featureCount: 0,
  });

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];
  
  // Count configured integrations and features
  const configuredIntegrations = Object.values(integrations).filter(Boolean).length;
  const featureCount = Object.values(selectedFeatures).flat().length;

  // Build user config for preview generator
  const buildUserConfig = useCallback((): UserConfig => ({
    template,
    projectName: projectName || "My Project",
    vision: vision || undefined,
    mission: mission || undefined,
    description: description || undefined,
    inspiration: inspirations[0]?.value || undefined,
    integrations,
  }), [template, projectName, vision, mission, description, inspirations, integrations]);

  // Initialize with fallback props on mount or when config changes
  useEffect(() => {
    const userConfig = buildUserConfig();
    const fallbackProps = generateFallbackProps(userConfig);
    setComponentProps(fallbackProps);
  }, [buildUserConfig]);

  // Detect when config changes (don't auto-update, let user trigger it)
  useEffect(() => {
    const hasChanges = 
      template !== lastRendered.template ||
      projectName !== lastRendered.projectName ||
      featureCount !== lastRendered.featureCount ||
      JSON.stringify(integrations) !== JSON.stringify(lastRendered.integrations);
    
    if (hasChanges && lastRendered.template !== "") {
      setHasPendingChanges(true);
    }
  }, [template, integrations, projectName, featureCount, lastRendered]);

  // Handle update preview with fallback props
  const handleUpdatePreview = useCallback(() => {
    const userConfig = buildUserConfig();
    const fallbackProps = generateFallbackProps(userConfig);
    setComponentProps(fallbackProps);
    setLastRendered({ template, integrations, projectName, featureCount });
    setHasPendingChanges(false);
  }, [buildUserConfig, template, integrations, projectName, featureCount]);

  // Handle AI enhancement (legacy)
  const handleAIEnhance = useCallback(async () => {
    setIsEnhancing(true);
    
    try {
      const response = await fetch("/api/preview/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildUserConfig()),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.componentProps) {
          setComponentProps(data.componentProps);
          setLastRendered({ template, integrations, projectName, featureCount });
          setHasPendingChanges(false);
        }
      }
    } catch (error) {
      console.error("AI enhancement failed:", error);
    } finally {
      setIsEnhancing(false);
    }
  }, [buildUserConfig, template, integrations, projectName, featureCount]);

  // Handle AI Composition (new pattern-based approach)
  const handleCompose = useCallback(async () => {
    setIsComposing(true);
    
    try {
      const response = await fetch("/api/compose/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vision: {
            projectName: projectName || "My Project",
            description: description || vision || "A modern web application",
            audience: undefined,
            tone: "professional",
            goals: [],
          },
          template,
          pages: [
            { path: "/", name: "Home", type: "home" },
          ],
          integrations,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.composition) {
          setComposition(data.data.composition);
          setLastRendered({ template, integrations, projectName, featureCount });
          setHasPendingChanges(false);
        }
      }
    } catch (error) {
      console.error("AI composition failed:", error);
    } finally {
      setIsComposing(false);
    }
  }, [projectName, description, vision, template, integrations, featureCount]);

  // Handle section regeneration
  const handleRegenerateSection = useCallback(async (pageId: string, sectionIndex: number, feedback?: string) => {
    if (!composition) return;
    
    try {
      const response = await fetch("/api/compose/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          composition,
          pageId,
          sectionIndex,
          feedback,
          context: {
            vision: {
              projectName: projectName || "My Project",
              description: description || vision || "",
            },
            template,
            pages: [],
            integrations,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Update the section in the composition
          setComposition(prev => {
            if (!prev) return prev;
            const newPages = prev.pages.map(page => {
              if (page.pageId === pageId) {
                const newSections = [...page.sections];
                newSections[sectionIndex] = data.data;
                return { ...page, sections: newSections };
              }
              return page;
            });
            return { ...prev, pages: newPages };
          });
        }
      }
    } catch (error) {
      console.error("Section regeneration failed:", error);
    }
  }, [composition, projectName, description, vision, template, integrations]);

  // Initial render - set lastRendered
  useEffect(() => {
    if (isVisible && lastRendered.template === "") {
      setLastRendered({ template, integrations, projectName, featureCount });
    }
  }, [isVisible, template, integrations, projectName, featureCount, lastRendered.template]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-20 z-50 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
      >
        <Eye className="h-4 w-4" />
        <span className="text-sm font-medium">Preview</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-screen bg-card border-l border-border flex flex-col z-40 transition-all duration-300",
        isExpanded ? "w-[60vw]" : "w-[450px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur overflow-hidden">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm whitespace-nowrap">Live Preview</span>
          </div>
          <Badge variant="secondary" className="text-xs flex-shrink-0 hidden sm:inline-flex">
            {featureCount + configuredIntegrations} integration{(featureCount + configuredIntegrations) !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* AI Compose Button (new pattern-based) */}
          <Button
            variant={composition ? "secondary" : "default"}
            size="sm"
            onClick={handleCompose}
            disabled={isComposing}
            className="h-8 px-3 text-xs gap-1.5"
          >
            {isComposing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            {isComposing ? "Composing..." : composition ? "Recompose" : "AI Compose"}
          </Button>

          {/* AI Enhance Button (legacy) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIEnhance}
            disabled={isEnhancing || !!composition}
            className="h-8 px-3 text-xs gap-1.5"
            title={composition ? "Using composed preview" : "Enhance with AI"}
          >
            {isEnhancing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {isEnhancing ? "Enhancing..." : "Enhance"}
          </Button>

          {/* Viewport Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            <button
              onClick={() => setViewport("desktop")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewport === "desktop" ? "bg-background shadow-sm" : "hover:bg-muted"
              )}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewport === "mobile" ? "bg-background shadow-sm" : "hover:bg-muted"
              )}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Update Preview */}
          <button
            onClick={handleUpdatePreview}
            className={cn(
              "p-1.5 rounded transition-colors relative",
              hasPendingChanges 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-muted"
            )}
            title={hasPendingChanges ? "Update preview with latest changes" : "Refresh preview"}
          >
            <RefreshCw className="h-4 w-4" />
            {hasPendingChanges && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview Frame - Using PreviewRenderer */}
      <div className="flex-1 bg-stone-900 p-4 overflow-auto">
        {viewport === "mobile" ? (
          <div className="flex justify-center">
            <MobilePreviewFrame
              template={template}
              componentProps={componentProps}
              integrations={integrations}
              selectedFeatures={selectedFeatures}
              branding={branding}
              composition={composition || undefined}
            />
          </div>
        ) : (
          <PreviewFrame
            template={template}
            componentProps={componentProps}
            integrations={integrations}
            selectedFeatures={selectedFeatures}
            branding={branding}
            composition={composition || undefined}
            editable={!!composition}
            onRegenerateSection={composition ? handleRegenerateSection : undefined}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/80 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Template: {selectedTemplate?.name || "None"}</span>
          <span>•</span>
          <span>Project: {projectName || "Untitled"}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasPendingChanges ? (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-500">Changes pending</span>
              <button 
                onClick={handleUpdatePreview}
                className="text-primary hover:underline"
              >
                Update
              </button>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Up to date</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Toggle button component for the main layout
export function PreviewToggleButton({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="gap-2"
    >
      {isVisible ? (
        <>
          <EyeOff className="h-4 w-4" />
          <span className="hidden sm:inline">Hide Preview</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Show Preview</span>
        </>
      )}
    </Button>
  );
}
