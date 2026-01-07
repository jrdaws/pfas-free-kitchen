"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";
import { generateFallbackProps, UserConfig } from "@/lib/ai/preview-generator";
import type { ProjectComposition } from "@/lib/composer/types";
import type { ResearchResult } from "@/lib/research-client";
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
  Wand2,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PreviewWithImages } from "@/app/components/preview";
import type { PreviewComposition } from "@/app/components/preview/types";
import type { WebsiteAnalysis } from "@/app/components/preview/analysis-types";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { ComposerModeToggle } from "./ComposerModeToggle";
import { useHistory } from "@/hooks/useHistory";
import { useUndoRedoShortcuts } from "@/hooks/useUndoRedoShortcuts";
import { HistoryControls } from "@/components/preview/HistoryControls";

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
  research?: ResearchResult | null;
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
  research,
}: LivePreviewPanelProps) {
  // Get composer config from store
  const { composerConfig } = useConfiguratorStore();
  
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [componentProps, setComponentProps] = useState<Record<string, Record<string, unknown>>>({});
  const [generateImages, setGenerateImages] = useState(false);
  
  // Use history for undo/redo on composition
  const {
    state: composition,
    setState: setComposition,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
    historyLength,
  } = useHistory<ProjectComposition | null>(null);
  
  // Enable keyboard shortcuts for undo/redo when in edit mode
  useUndoRedoShortcuts({
    undo,
    redo,
    canUndo,
    canRedo,
    enabled: isEditMode && !!composition,
  });
  const [showAIImagesPreview, setShowAIImagesPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPreviewPath, setCurrentPreviewPath] = useState("/");
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null);
  
  // Image generation progress state
  const [imageGenStats, setImageGenStats] = useState<{
    count: number;
    generated: number;
    cached: number;
    failed: number;
    timing: number;
  } | null>(null);
  
  // Track last rendered values to detect changes
  const [lastRendered, setLastRendered] = useState({
    template: "",
    integrations: {} as Record<string, string>,
    projectName: "",
    featureCount: 0,
  });

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];

  // Convert ProjectComposition to PreviewComposition for PreviewWithImages
  const convertToPreviewComposition = useCallback((comp: ProjectComposition): PreviewComposition => {
    const colors = comp.globalStyles?.colorScheme;
    
    // Extract page name from pageId (e.g., "home" -> "Home")
    const formatPageName = (pageId: string) => 
      pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g, ' ');
    
    // Infer page type from layout or pageId
    const inferPageType = (page: { pageId: string; layout: string }) => {
      if (page.layout?.includes("dashboard")) return "dashboard";
      if (page.layout?.includes("blog")) return "blog";
      if (page.pageId === "home" || page.pageId === "/") return "home";
      if (page.pageId.includes("pricing")) return "pricing";
      if (page.pageId.includes("about")) return "about";
      return "landing";
    };
    
    return {
      id: comp.projectId || "preview",
      projectName: projectName || "Preview",
      theme: {
        // Default colors match globals.css --primary (orange) for consistency
        primaryColor: colors?.primary || "#F97316",
        secondaryColor: colors?.secondary || "#EA580C",
        backgroundColor: colors?.background || "#ffffff",
        textColor: colors?.foreground || "#1e293b",
        fontFamily: comp.globalStyles?.fontFamily?.body || "Inter, system-ui, sans-serif",
        borderRadius: "0.5rem",
      },
      navigation: comp.pages?.map(p => ({
        label: formatPageName(p.pageId),
        path: p.path || `/${p.pageId}`,
      })) || [],
      pages: comp.pages?.map(p => ({
        id: p.pageId,
        path: p.path || `/${p.pageId}`,
        name: formatPageName(p.pageId),
        type: inferPageType(p),
        components: p.sections?.map((s, i) => ({
          id: `${p.pageId}-section-${i}`,
          type: s.patternId || "hero",
          props: s.props || {},
        })) || [],
      })) || [],
    };
  }, [projectName]);
  
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
      // Build research data from Firecrawl results
      const researchData = research?.success && research.analysis ? {
        domain: research.analysis.domainInsights?.overview,
        insights: [
          ...(research.analysis.domainInsights?.commonFeatures || []),
          ...(research.analysis.domainInsights?.competitorPatterns || []),
        ],
        recommendations: research.analysis.recommendations?.suggestedFeatures?.map(f => ({
          category: f.category,
          features: f.features,
          reason: f.reason,
        })) || [],
        targetAudience: research.analysis.domainInsights?.targetAudience,
        extractedContent: research.analysis.urlAnalysis?.map(u => 
          `${u.title}: ${u.keyTakeaways?.join(', ')}`
        ).join('\n'),
      } : undefined;

      console.log("[Preview] Sending research to composer:", researchData ? "Yes" : "No");

      const response = await fetch("/api/compose/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vision: {
            projectName: projectName || "My Project",
            description: description || vision || "A modern web application",
            audience: researchData?.targetAudience,
            tone: "professional",
            goals: [],
          },
          research: researchData,
          template,
          pages: [
            { path: "/", name: "Home", type: "home" },
          ],
          integrations,
          preferences: {
            generateImages,
          },
          composerConfig,
        }),
      });

      console.log("[Preview] Using composer mode:", composerConfig.mode);

      if (response.ok) {
        const data = await response.json();
        console.log("[Preview] Compose API response:", data);
        if (data.success && data.data?.composition) {
          console.log("[Preview] ✅ Composition received:", data.data.composition.pages?.length, "pages");
          // Reset history when a new composition is generated (starts fresh)
          resetHistory(data.data.composition);
          setLastRendered({ template, integrations, projectName, featureCount });
          setHasPendingChanges(false);
          
          // Update image generation stats if available
          if (data.data.imageGeneration) {
            const imgStats = data.data.imageGeneration;
            setImageGenStats({
              count: imgStats.count,
              generated: imgStats.timing?.generated || 0,
              cached: imgStats.timing?.cached || 0,
              failed: imgStats.errors?.length || 0,
              timing: imgStats.timing?.total || 0,
            });
            console.log("[Preview] 🖼️ Images generated:", imgStats.count, "in", imgStats.timing?.total, "ms");
          } else {
            setImageGenStats(null);
          }
        } else {
          console.warn("[Preview] ⚠️ Composition failed:", data.error || "Unknown error");
        }
      } else {
        const errorText = await response.text();
        console.error("[Preview] ❌ API error:", response.status, errorText);
      }
    } catch (error) {
      console.error("[Preview] ❌ AI composition failed:", error);
    } finally {
      setIsComposing(false);
    }
  }, [projectName, description, vision, template, integrations, featureCount, research, generateImages, composerConfig]);

  // Auto-compose when user has provided enough context
  const hasEnoughContext = projectName && projectName.length > 2 && template;
  const hasAutoComposedRef = useRef(false);
  
  useEffect(() => {
    // Auto-compose on first load when there's enough context
    console.log("[Preview] Auto-compose check:", { 
      hasEnoughContext, 
      hasAutoComposed: hasAutoComposedRef.current, 
      composition: !!composition, 
      isComposing, 
      isVisible 
    });
    
    if (hasEnoughContext && !hasAutoComposedRef.current && !composition && !isComposing && isVisible) {
      console.log("[Preview] 🚀 Triggering auto-compose...");
      hasAutoComposedRef.current = true;
      // Delay to let the panel render first
      const timer = setTimeout(() => {
        handleCompose();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasEnoughContext, composition, isComposing, isVisible, handleCompose]);

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
      {/* Header - Responsive with overflow handling */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-card/80 backdrop-blur min-h-[44px]">
        {/* Left: Toggle + Title - Always visible */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Hide preview"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="font-medium text-xs">Preview</span>
        </div>

        {/* Right: Controls - Scrollable on small screens */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {/* Mode Toggle - Shows current mode */}
          <ComposerModeToggle compact className="hidden md:flex flex-shrink-0" />

          {/* AI Compose Button */}
          <Button
            variant={composition ? "secondary" : "default"}
            size="sm"
            onClick={handleCompose}
            disabled={isComposing}
            className="h-6 px-2 text-xs gap-1 flex-shrink-0"
          >
            {isComposing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{isComposing ? "..." : composition ? "Redo" : "Compose"}</span>
          </Button>

          {/* AI Images Toggle */}
          <button
            onClick={() => {
              if (!showAIImagesPreview) {
                setGenerateImages(true);
              }
              setShowAIImagesPreview(!showAIImagesPreview);
            }}
            disabled={!composition}
            className={cn(
              "h-6 px-2 rounded text-xs font-medium transition-all flex items-center gap-1 flex-shrink-0",
              showAIImagesPreview
                ? "bg-primary text-primary-foreground"
                : composition
                  ? "bg-muted hover:bg-muted/80 text-muted-foreground"
                  : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
            )}
            title={!composition ? "Compose first" : showAIImagesPreview ? "AI Images ON" : "Enable AI Images"}
          >
            <ImageIcon className="h-3 w-3" />
            {showAIImagesPreview && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            disabled={!composition}
            className={cn(
              "h-6 px-2 rounded text-xs font-medium transition-all flex items-center gap-1 flex-shrink-0",
              isEditMode
                ? "bg-amber-500 text-white"
                : composition
                  ? "bg-muted hover:bg-muted/80 text-muted-foreground"
                  : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
            )}
            title={!composition ? "Compose first" : isEditMode ? "Exit Edit Mode" : "Edit Content"}
          >
            <Pencil className="h-3 w-3" />
            {isEditMode && <span className="hidden sm:inline">Edit</span>}
          </button>

          {/* Undo/Redo Controls - Only show in edit mode */}
          {isEditMode && composition && (
            <HistoryControls
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              historyLength={historyLength}
              className="flex-shrink-0"
            />
          )}

          {/* Viewport Toggle - Hidden on very small screens */}
          <div className="hidden sm:flex items-center p-0.5 rounded bg-muted/50 flex-shrink-0">
            <button
              onClick={() => setViewport("desktop")}
              className={cn(
                "p-0.5 rounded transition-colors",
                viewport === "desktop" ? "bg-background shadow-sm" : "hover:bg-muted"
              )}
            >
              <Monitor className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={cn(
                "p-0.5 rounded transition-colors",
                viewport === "mobile" ? "bg-background shadow-sm" : "hover:bg-muted"
              )}
            >
              <Smartphone className="h-3 w-3" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={handleUpdatePreview}
            className={cn(
              "p-1 rounded transition-colors flex-shrink-0",
              hasPendingChanges 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </button>

          {/* Expand - Always visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Preview Frame - Single unified preview system */}
      <div className="flex-1 p-4 overflow-auto" style={{ backgroundColor: 'hsl(var(--background-alt))' }}>
        {/* Show composing state */}
        {isComposing ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div>
                <p className="text-foreground font-medium">Creating your preview...</p>
                <p className="text-muted-foreground text-sm mt-1">AI is composing sections based on your inputs</p>
              </div>
            </div>
          </div>
        ) : composition ? (
          /* Use ComposedPreview-based system when composition exists */
          <PreviewWithImages
            composition={convertToPreviewComposition(composition)}
            websiteAnalysis={websiteAnalysis || undefined}
            vision={{
              projectName: projectName || "My Project",
              description: description || vision || "A modern web application",
              audience: "modern users",
              tone: "professional",
            }}
            currentPath={currentPreviewPath}
            onNavigate={setCurrentPreviewPath}
            autoGenerate={showAIImagesPreview}
            editable={isEditMode}
            onComponentEdit={(componentId, updates) => {
              // Update the composition with the edited props
              if (composition) {
                const updatedComposition = {
                  ...composition,
                  pages: composition.pages.map(page => ({
                    ...page,
                    sections: page.sections.map(section => 
                      section.patternId === componentId || section.patternId.includes(componentId.split('-')[0])
                        ? { ...section, props: { ...section.props, ...updates } }
                        : section
                    ),
                  })),
                };
                setComposition(updatedComposition);
              }
            }}
            className="h-full"
          />
        ) : (
          /* No composition yet - show prompt to compose */
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                <Wand2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Preview</h3>
                <p className="text-muted-foreground">
                  Click <span className="text-primary font-medium">Compose</span> to generate 
                  an AI-powered preview based on your project configuration.
                </p>
              </div>
              
              {/* Show mode selector in empty state */}
              <div className="flex flex-col items-center gap-3">
                <ComposerModeToggle className="mx-auto" />
                <Button
                  onClick={handleCompose}
                  disabled={isComposing}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/80 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Template: {selectedTemplate?.name || "None"}</span>
          <span>•</span>
          <span>Project: {projectName || "Untitled"}</span>
          {imageGenStats && imageGenStats.count > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {imageGenStats.count} images
                {imageGenStats.cached > 0 && (
                  <span className="text-muted-foreground">({imageGenStats.cached} cached)</span>
                )}
                {imageGenStats.failed > 0 && (
                  <span className="text-amber-500 flex items-center gap-0.5">
                    <AlertCircle className="h-3 w-3" />
                    {imageGenStats.failed} failed
                  </span>
                )}
              </span>
            </>
          )}
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
          ) : imageGenStats && imageGenStats.count > 0 ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">
                Generated in {(imageGenStats.timing / 1000).toFixed(1)}s
              </span>
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
