"use client";

import dynamic from "next/dynamic";
import { useConfiguratorStore, Step, ModelTier } from "@/lib/configurator-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { analyzeProject, type ResearchResult } from "@/lib/research-client";

// Dynamically import components to avoid SSR issues
const AccordionSidebar = dynamic(() => import("@/app/components/configurator/AccordionSidebar").then(mod => ({ default: mod.AccordionSidebar })), { ssr: false });
const MobileSidebar = dynamic(() => import("@/app/components/configurator/MobileSidebar").then(mod => ({ default: mod.MobileSidebar })), { ssr: false });
const ModeToggle = dynamic(() => import("@/app/components/configurator/ModeToggle").then(mod => ({ default: mod.ModeToggle })), { ssr: false });
const TemplateSelector = dynamic(() => import("@/app/components/configurator/TemplateSelector").then(mod => ({ default: mod.TemplateSelector })), { ssr: false });
const InspirationUpload = dynamic(() => import("@/app/components/configurator/InspirationUpload").then(mod => ({ default: mod.InspirationUpload })), { ssr: false });
const ProjectDetails = dynamic(() => import("@/app/components/configurator/ProjectDetails").then(mod => ({ default: mod.ProjectDetails })), { ssr: false });
const IntegrationPanel = dynamic(() => import("@/app/components/configurator/IntegrationPanel").then(mod => ({ default: mod.IntegrationPanel })), { ssr: false });
const EnvironmentKeys = dynamic(() => import("@/app/components/configurator/EnvironmentKeys").then(mod => ({ default: mod.EnvironmentKeys })), { ssr: false });
const AIPreview = dynamic(() => import("@/app/components/configurator/AIPreview").then(mod => ({ default: mod.AIPreview })), { ssr: false });
const ComponentAwarePreview = dynamic(() => import("@/app/components/configurator/ComponentAwarePreview").then(mod => ({ default: mod.ComponentAwarePreview })), { ssr: false });
const ProjectGenerator = dynamic(() => import("@/app/components/configurator/ProjectGenerator").then(mod => ({ default: mod.ProjectGenerator })), { ssr: false });
const ContextFields = dynamic(() => import("@/app/components/configurator/ContextFields").then(mod => ({ default: mod.ContextFields })), { ssr: false });
const GenerateFramework = dynamic(() => import("@/app/components/configurator/GenerateFramework").then(mod => ({ default: mod.GenerateFramework })), { ssr: false });
const LivePreviewPanel = dynamic(() => import("@/app/components/configurator/LivePreviewPanel").then(mod => ({ default: mod.LivePreviewPanel })), { ssr: false });
const PreviewToggleButton = dynamic(() => import("@/app/components/configurator/LivePreviewPanel").then(mod => ({ default: mod.PreviewToggleButton })), { ssr: false });
const PreviewCard = dynamic(() => import("@/app/components/configurator/PreviewCard").then(mod => ({ default: mod.PreviewCard })), { ssr: false });
const ProjectOverviewBox = dynamic(() => import("@/app/components/configurator/ProjectOverviewBox").then(mod => ({ default: mod.ProjectOverviewBox })), { ssr: false });
const ThemeToggle = dynamic(() => import("@/components/ui/theme-toggle").then(mod => ({ default: mod.ThemeToggle })), { ssr: false });
const ResearchResults = dynamic(() => import("@/app/components/configurator/ResearchResults").then(mod => ({ default: mod.ResearchResults })), { ssr: false });

// Import section components for inline sidebar content
const ResearchSection = dynamic(() => import("@/app/components/configurator/sections/ResearchSection").then(mod => ({ default: mod.ResearchSection })), { ssr: false });
const CoreFeaturesSection = dynamic(() => import("@/app/components/configurator/sections/CoreFeaturesSection").then(mod => ({ default: mod.CoreFeaturesSection })), { ssr: false });
const IntegrateAISection = dynamic(() => import("@/app/components/configurator/sections/IntegrateAISection").then(mod => ({ default: mod.IntegrateAISection })), { ssr: false });
const ToolSetupSection = dynamic(() => import("@/app/components/configurator/sections/ToolSetupSection").then(mod => ({ default: mod.ToolSetupSection })), { ssr: false });
const SupabaseSetup = dynamic(() => import("@/app/components/configurator/setup/SupabaseSetup").then(mod => ({ default: mod.SupabaseSetup })), { ssr: false });
const TemplateSection = dynamic(() => import("@/app/components/configurator/sections/TemplateSection").then(mod => ({ default: mod.TemplateSection })), { ssr: false });
const ProjectSetupSection = dynamic(() => import("@/app/components/configurator/sections/ProjectSetupSection").then(mod => ({ default: mod.ProjectSetupSection })), { ssr: false });
const ExportSection = dynamic(() => import("@/app/components/configurator/sections/ExportSection").then(mod => ({ default: mod.ExportSection })), { ssr: false });
const BrandingSection = dynamic(() => import("@/app/components/configurator/sections/BrandingSection").then(mod => ({ default: mod.BrandingSection })), { ssr: false });

// Map section IDs to step numbers (11-section layout with Branding)
const SECTION_TO_STEP: Record<string, number> = {
  "template": 1,
  "research": 2,
  "branding": 3,
  "core-features": 4,
  "integrate-ai": 5,
  "project-setup": 6,
  "cursor": 7,
  "github": 8,
  "supabase": 9,
  "vercel": 10,
  "export": 11,
};

const STEP_TO_SECTION: Record<number, string> = {
  1: "template",
  2: "research",
  3: "branding",
  4: "core-features",
  5: "integrate-ai",
  6: "project-setup",
  7: "cursor",
  8: "github",
  9: "supabase",
  10: "vercel",
  11: "export",
};

// Step titles for breadcrumb
const STEP_TITLES: Record<number, string> = {
  1: "Template",
  2: "Research",
  3: "Branding",
  4: "Core Features",
  5: "AI Integration",
  6: "Project Setup",
  7: "Cursor",
  8: "GitHub",
  9: "Supabase",
  10: "Vercel",
  11: "Export",
};

// Phase names for breadcrumb
const getPhaseForStep = (step: number): string => {
  if (step <= 3) return "Setup";
  if (step <= 6) return "Configure";
  if (step <= 10) return "Tools";
  return "Export";
};

// Total number of steps
const TOTAL_STEPS = 11;

// Smart pre-fill prompts based on template selection (Option C UX improvement)
const DOMAIN_PROMPTS: Record<string, string> = {
  saas: "SaaS product for [describe your users and what problem you solve]",
  ecommerce: "Online store selling [describe your products and target customers]",
  blog: "Blog about [describe your topic and target audience]",
  dashboard: "Dashboard for managing [describe what data or operations]",
  "landing-page": "Landing page for [describe your product or service]",
  "api-backend": "API backend for [describe what service it provides]",
  "seo-directory": "Directory of [describe what you're listing and for whom]",
};

export default function ConfigurePage() {
  const [aiTab, setAiTab] = useState<"component" | "preview" | "generate">("component");
  const [showLivePreview, setShowLivePreview] = useState(false);
  
  // Research state
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  
  // Track navigation direction for slide animations
  const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right");
  const [animationKey, setAnimationKey] = useState(0);
  const prevStepRef = useRef<number | null>(null);

  const {
    currentStep,
    completedSteps,
    mode,
    template,
    inspirations,
    description,
    projectName,
    outputDir,
    integrations,
    envKeys,
    vision,
    mission,
    successCriteria,
    modelTier,
    selectedFeatures,
    toolStatus,
    researchDomain,
    inspirationUrls,
    aiProvider,
    aiApiKey,
    colorScheme,
    customColors,
    setStep,
    completeStep,
    setMode,
    setTemplate,
    addInspiration,
    removeInspiration,
    setDescription,
    setProjectName,
    setOutputDir,
    setIntegration,
    setEnvKey,
    setVision,
    setMission,
    setSuccessCriteria,
    setModelTier,
    toggleFeature,
    clearFeatures,
    setToolComplete,
    setResearchDomain,
    setInspirationUrls,
    setAiProvider,
    setAiApiKey,
    setColorScheme,
    setCustomColor,
  } = useConfiguratorStore();

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];

  // Smart pre-fill: When template changes, suggest a domain prompt (Option C)
  useEffect(() => {
    // Only pre-fill if:
    // 1. A template is selected
    // 2. Domain is empty OR domain matches an old pre-fill prompt
    const currentPrompt = DOMAIN_PROMPTS[template];
    const isOldPrefill = Object.values(DOMAIN_PROMPTS).includes(researchDomain);
    
    if (template && currentPrompt && (!researchDomain || isOldPrefill)) {
      setResearchDomain(currentPrompt);
    }
  }, [template]); // Only trigger when template changes

  // Track step changes and set animation direction
  useEffect(() => {
    if (prevStepRef.current !== null && prevStepRef.current !== currentStep) {
      setAnimationDirection(currentStep > prevStepRef.current ? "right" : "left");
      setAnimationKey((k) => k + 1);
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // Calculate section badges for all sections
  const sectionBadges = useMemo(() => {
    const totalFeatures = Object.values(selectedFeatures).flat().length;
    const integrationCount = Object.values(integrations).filter(Boolean).length;
    const toolsReady = Object.values(toolStatus).filter(Boolean).length;
    
    return {
      // Research - show if domain is set
      "research": researchDomain ? "✓" : undefined,
      // Branding - show scheme name or "Custom"
      "branding": colorScheme && colorScheme !== 'sunset-orange' ? (colorScheme === 'custom' ? 'Custom' : '✓') : undefined,
      // Core Features - show count
      "core-features": totalFeatures > 0 ? totalFeatures : undefined,
      // Integrate AI - show provider or count
      "integrate-ai": aiProvider ? "1" : (integrationCount > 0 ? integrationCount : undefined),
      // Tool sections - show "Ready" when complete
      "cursor": toolStatus.cursor ? "Ready" : undefined,
      "github": toolStatus.github ? "Ready" : undefined,
      "claude-code": toolStatus["claude-code"] ? "Ready" : undefined,
      "supabase": toolStatus.supabase ? "Ready" : undefined,
      "vercel": toolStatus.vercel ? "Ready" : undefined,
    };
  }, [selectedFeatures, integrations, toolStatus, researchDomain, aiProvider, colorScheme]);

  // Calculate progress
  const progress = (completedSteps.size / TOTAL_STEPS) * 100;

  // Handle research API call
  const handleStartResearch = useCallback(async () => {
    if (!researchDomain.trim()) return;
    
    setIsResearching(true);
    setResearchError(null);
    
    try {
      const result = await analyzeProject({
        domain: researchDomain,
        inspirationUrls: inspirationUrls.length > 0 ? inspirationUrls : undefined,
        vision: description || undefined,
      });
      
      if (result.success) {
        setResearchResult(result);
        completeStep(2);
      } else {
        setResearchError(result.error || "Research failed");
      }
    } catch (error) {
      setResearchError(error instanceof Error ? error.message : "Research failed");
    } finally {
      setIsResearching(false);
    }
  }, [researchDomain, inspirationUrls, description, completeStep]);

  // Handle applying research recommendations
  const handleApplyRecommendations = useCallback((recommendations: {
    template: string;
    features: Record<string, string[]>;
    integrations: string[];
  }) => {
    // Apply template if valid
    if (recommendations.template && TEMPLATES[recommendations.template as keyof typeof TEMPLATES]) {
      setTemplate(recommendations.template);
      completeStep(1);
    }
    
    // Apply features
    Object.entries(recommendations.features).forEach(([category, features]) => {
      features.forEach(feature => {
        // Only toggle if not already selected
        if (!selectedFeatures[category]?.includes(feature)) {
          toggleFeature(category, feature);
        }
      });
    });
    
    // Apply integrations
    recommendations.integrations.forEach(integration => {
      // Map integration names to our integration keys
      const integrationMap: Record<string, string> = {
        "stripe": "payments",
        "uploadthing": "storage",
        "resend": "email",
        "analytics": "analytics",
        "sentry": "monitoring",
      };
      const key = integrationMap[integration.toLowerCase()];
      if (key) {
        setIntegration(key, integration);
      }
    });
    
    completeStep(3); // Core features step
  }, [setTemplate, toggleFeature, setIntegration, completeStep, selectedFeatures]);

  // Validation for each step
  const canProceed = () => {
    switch (currentStep) {
      case 1: // Template
        return template !== "";
      case 2: // Research (optional)
        return true;
      case 3: // Branding (optional)
        return true;
      case 4: // Core Features
        return Object.values(selectedFeatures).flat().length > 0;
      case 5: // Integrate AI (optional)
        return true;
      case 6: // Project Setup
        return projectName.length > 0 && outputDir.length > 0;
      case 7: // Cursor
        return toolStatus.cursor;
      case 8: // GitHub
        return toolStatus.github;
      case 9: // Supabase (optional)
        return true;
      case 10: // Vercel (optional)
        return true;
      case 11: // Export
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    completeStep(currentStep);
    const nextStep = (currentStep + 1) as Step;
    if (nextStep <= TOTAL_STEPS) {
      setStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = (currentStep - 1) as Step;
    if (prevStep >= 1) {
      setStep(prevStep);
    }
  };

  const handleToolComplete = (toolId: string) => {
    setToolComplete(toolId, true);
    completeStep(SECTION_TO_STEP[toolId] as Step);
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  // Render inline section content for accordion
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "template":
        return (
          <TemplateSection
            selectedTemplate={template}
            onTemplateChange={(t) => {
              setTemplate(t);
              completeStep(1);
            }}
          />
        );
      case "research":
        return (
          <ResearchSection
            domain={researchDomain}
            onDomainChange={setResearchDomain}
            inspirationUrls={inspirationUrls}
            onInspirationUrlsChange={setInspirationUrls}
            onStartResearch={handleStartResearch}
            onShowMe={() => {
              // Open docs in new tab
              window.open("/docs/research", "_blank");
            }}
            isLoading={isResearching}
          />
        );
      case "branding":
        return (
          <BrandingSection
            selectedScheme={colorScheme}
            onSchemeChange={(schemeId) => {
              setColorScheme(schemeId);
              completeStep(3);
            }}
            customColors={customColors}
            onCustomColorChange={setCustomColor}
          />
        );
      case "core-features":
        return (
          <CoreFeaturesSection
            selectedFeatures={selectedFeatures}
            onToggleFeature={toggleFeature}
            onClearCategory={(category) => {
              // Clear features for a specific category
              const currentFeatures = selectedFeatures[category] || [];
              currentFeatures.forEach((featureId) => {
                toggleFeature(category, featureId);
              });
            }}
          />
        );
      case "integrate-ai":
        return (
          <IntegrateAISection
            selectedProvider={aiProvider}
            onProviderChange={setAiProvider}
            apiKey={aiApiKey}
            onApiKeyChange={setAiApiKey}
            isKeyValid={aiApiKey.length > 10}
          />
        );
      case "cursor":
        return (
          <ToolSetupSection
            toolId="cursor"
            isComplete={toolStatus.cursor}
            onMarkComplete={() => handleToolComplete("cursor")}
          />
        );
      case "github":
        return (
          <ToolSetupSection
            toolId="github"
            isComplete={toolStatus.github}
            onMarkComplete={() => handleToolComplete("github")}
          />
        );
      case "claude-code":
        return (
          <ToolSetupSection
            toolId="claude-code"
            isComplete={toolStatus["claude-code"]}
            onMarkComplete={() => handleToolComplete("claude-code")}
          />
        );
      case "supabase":
        return (
          <SupabaseSetup
            onComplete={(project) => {
              console.log("Supabase project connected:", project);
              handleToolComplete("supabase");
            }}
            onToolStatusChange={(complete) => {
              if (complete) {
                handleToolComplete("supabase");
              }
            }}
          />
        );
      case "vercel":
        return (
          <ToolSetupSection
            toolId="vercel"
            isComplete={toolStatus.vercel}
            onMarkComplete={() => handleToolComplete("vercel")}
          />
        );
      case "project-setup":
        return (
          <ProjectSetupSection
            projectName={projectName}
            onProjectNameChange={setProjectName}
            outputDir={outputDir}
            onOutputDirChange={setOutputDir}
            envKeys={envKeys}
            onEnvKeyChange={setEnvKey}
          />
        );
      case "export":
        return (
          <ExportSection
            projectName={projectName}
            template={template}
            featureCount={Object.values(selectedFeatures).flat().length}
            isReady={completedSteps.size >= 5}
            onExport={(method) => {
              console.log("Export with method:", method);
              completeStep(11);
            }}
          />
        );
      default:
        return null;
    }
  };

  // Render main content area based on current step
  const renderMainContent = () => {
    const currentSection = STEP_TO_SECTION[currentStep];
    
    switch (currentSection) {
      case "research":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">Define Your Project</h2>
              <p className="text-foreground-secondary">
                Start by describing your project domain and adding inspiration websites. 
                This helps us understand what you&apos;re building.
              </p>
            </div>
            
            <InspirationUpload
              inspirations={inspirations}
              description={description}
              onAddInspiration={addInspiration}
              onRemoveInspiration={removeInspiration}
              onDescriptionChange={setDescription}
            />

            {/* Research Error */}
            {researchError && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                {researchError}
              </div>
            )}

            {/* Research Results */}
            {researchResult && researchResult.success && (
              <ResearchResults
                result={researchResult}
                onApplyRecommendations={handleApplyRecommendations}
                appliedFeatures={selectedFeatures}
              />
            )}
          </div>
        );
        
      case "core-features":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select Features</h2>
              <p className="text-foreground-secondary">
                Choose the features you want in your project. You can always add more later.
              </p>
            </div>
            {/* Show feature preview or template info */}
            {selectedTemplate && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{selectedTemplate.name}</h3>
                <p className="text-sm text-foreground-secondary">{selectedTemplate.description}</p>
              </div>
            )}
          </div>
        );
        
      case "integrate-ai":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">AI Integration</h2>
              <p className="text-foreground-secondary">
                Configure your AI provider for intelligent features in your app.
              </p>
            </div>
            <ComponentAwarePreview
              template={template}
              integrations={integrations}
              inspirations={inspirations}
              description={description}
            />
          </div>
        );
        
      case "cursor":
      case "github":
      case "claude-code":
      case "supabase":
      case "vercel":
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {STEP_TITLES[currentStep]}
              </h2>
              <p className="text-foreground-secondary">
                Follow the steps in the sidebar to set up {STEP_TITLES[currentStep]}.
              </p>
            </div>
            
            {/* Show Generate Framework when on final step */}
            {currentSection === "vercel" && (
              <GenerateFramework />
            )}
            
            {/* Show progress overview for tool setup steps */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Setup Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(toolStatus).map(([tool, isComplete]) => (
                  <div
                    key={tool}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      isComplete ? "bg-success/10 text-success" : "bg-background-alt text-foreground-secondary"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isComplete ? "bg-success text-white" : "bg-border"
                      }`}
                    >
                      {isComplete ? "✓" : ""}
                    </div>
                    <span className="capitalize">{tool.replace("-", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Accordion Sidebar with inline section content */}
      <AccordionSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={(step) => setStep(step as Step)}
        sectionBadges={sectionBadges}
      >
        {renderSectionContent}
      </AccordionSidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background-alt">
          {/* Mobile menu */}
          <MobileSidebar
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepChange={(step) => setStep(step as Step)}
            sectionBadges={sectionBadges}
          >
            {renderSectionContent}
          </MobileSidebar>

          {/* Breadcrumb */}
          <div className="flex-1">
            <div className="text-sm text-foreground-muted">
              {getPhaseForStep(currentStep)} › {STEP_TITLES[currentStep]}
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              {STEP_TITLES[currentStep]}
            </h1>
          </div>

          {/* Preview Toggle */}
          <PreviewToggleButton 
            isVisible={showLivePreview} 
            onToggle={() => setShowLivePreview(!showLivePreview)} 
          />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mode Toggle */}
          <ModeToggle mode={mode} onChange={setMode} />
        </header>

        {/* Scrollable Content with Preview Card */}
        <main className="flex-1 overflow-auto">
          <div className="flex gap-6 px-6 py-8">
            {/* Main Content */}
            <div 
              key={animationKey}
              className={`flex-1 max-w-3xl ${
                animationDirection === "right" ? "slide-in-right" : "slide-in-left"
              }`}
            >
              {renderMainContent()}
            </div>

            {/* Right Panel - Preview Card & Overview (hidden on mobile) */}
            <div className="hidden xl:flex flex-col gap-4 w-80 shrink-0 sticky top-0 h-fit">
              <PreviewCard />
              <ProjectOverviewBox showAnalysis={currentStep > 2} />
            </div>
          </div>
        </main>

        {/* Footer with Navigation */}
        <footer className="flex items-center gap-4 px-6 py-4 border-t border-border bg-background-alt">
          {/* Progress */}
          <div className="flex-1 flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-2 max-w-xs" />
            <span className="text-sm text-foreground-muted">
              {completedSteps.size}/8 complete
            </span>
          </div>

          {/* Validation message */}
          {!canProceed() && currentStep !== 8 && (
            <p className="text-red-600 text-sm font-medium">
              Complete this step to continue
            </p>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              disabled={isFirstStep}
              variant="outline"
              className="disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {!isLastStep ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="disabled:opacity-50 bg-[#F97316] hover:bg-[#EA580C]"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="secondary"
              >
                Start Over
              </Button>
            )}
          </div>
        </footer>
      </div>

      {/* Live Preview Panel */}
      <LivePreviewPanel
        template={template}
        integrations={integrations}
        projectName={projectName}
        description={description}
        isVisible={showLivePreview}
        onToggle={() => setShowLivePreview(!showLivePreview)}
      />
    </div>
  );
}
