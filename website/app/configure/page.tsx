"use client";

import dynamic from "next/dynamic";
import { useConfiguratorStore, Step, ModelTier } from "@/lib/configurator-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { useState, useEffect, useRef, useMemo } from "react";

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

// Import section components for inline sidebar content
const ResearchSection = dynamic(() => import("@/app/components/configurator/sections/ResearchSection").then(mod => ({ default: mod.ResearchSection })), { ssr: false });
const CoreFeaturesSection = dynamic(() => import("@/app/components/configurator/sections/CoreFeaturesSection").then(mod => ({ default: mod.CoreFeaturesSection })), { ssr: false });
const IntegrateAISection = dynamic(() => import("@/app/components/configurator/sections/IntegrateAISection").then(mod => ({ default: mod.IntegrateAISection })), { ssr: false });
const ToolSetupSection = dynamic(() => import("@/app/components/configurator/sections/ToolSetupSection").then(mod => ({ default: mod.ToolSetupSection })), { ssr: false });
const SupabaseSetup = dynamic(() => import("@/app/components/configurator/setup/SupabaseSetup").then(mod => ({ default: mod.SupabaseSetup })), { ssr: false });

// Map section IDs to step numbers (for the new 8-section layout)
const SECTION_TO_STEP: Record<string, number> = {
  "research": 1,
  "core-features": 2,
  "integrate-ai": 3,
  "cursor": 4,
  "github": 5,
  "claude-code": 6,
  "supabase": 7,
  "vercel": 8,
};

const STEP_TO_SECTION: Record<number, string> = {
  1: "research",
  2: "core-features",
  3: "integrate-ai",
  4: "cursor",
  5: "github",
  6: "claude-code",
  7: "supabase",
  8: "vercel",
};

// Step titles for breadcrumb
const STEP_TITLES: Record<number, string> = {
  1: "Research",
  2: "Core Features",
  3: "Integrate AI",
  4: "Cursor Setup",
  5: "GitHub Setup",
  6: "Claude Code",
  7: "Supabase",
  8: "Vercel Deploy",
};

// Phase names for breadcrumb
const getPhaseForStep = (step: number): string => {
  if (step <= 1) return "Research";
  if (step <= 3) return "Features";
  return "Tools";
};

export default function ConfigurePage() {
  const [aiTab, setAiTab] = useState<"component" | "preview" | "generate">("component");
  const [showLivePreview, setShowLivePreview] = useState(false);
  
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
  } = useConfiguratorStore();

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];

  // Track step changes and set animation direction
  useEffect(() => {
    if (prevStepRef.current !== null && prevStepRef.current !== currentStep) {
      setAnimationDirection(currentStep > prevStepRef.current ? "right" : "left");
      setAnimationKey((k) => k + 1);
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // Calculate section badges (e.g., feature count)
  const sectionBadges = useMemo(() => {
    const totalFeatures = Object.values(selectedFeatures).flat().length;
    return {
      "core-features": totalFeatures > 0 ? totalFeatures : undefined,
    };
  }, [selectedFeatures]);

  // Calculate progress
  const progress = (completedSteps.size / 8) * 100;

  // Validation for each step
  const canProceed = () => {
    switch (currentStep) {
      case 1: // Research
        return researchDomain.length > 0 || description.length > 0;
      case 2: // Core Features
        return Object.values(selectedFeatures).flat().length > 0;
      case 3: // Integrate AI
        return aiProvider !== "";
      case 4: // Cursor
        return toolStatus.cursor;
      case 5: // GitHub
        return toolStatus.github;
      case 6: // Claude Code
        return true; // Optional
      case 7: // Supabase
        return true; // Optional
      case 8: // Vercel
        return true; // Optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    completeStep(currentStep);
    const nextStep = (currentStep + 1) as Step;
    if (nextStep <= 8) {
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
  const isLastStep = currentStep === 8;

  // Render inline section content for accordion
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "research":
        return (
          <ResearchSection
            domain={researchDomain}
            onDomainChange={setResearchDomain}
            inspirationUrls={inspirationUrls}
            onInspirationUrlsChange={setInspirationUrls}
            onStartResearch={() => {
              completeStep(1);
              setStep(2);
            }}
            onShowMe={() => {
              // Show documentation or tutorial
            }}
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

          {/* Mode Toggle */}
          <ModeToggle mode={mode} onChange={setMode} />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto">
          <div 
            key={animationKey}
            className={`max-w-4xl mx-auto px-6 py-8 ${
              animationDirection === "right" ? "slide-in-right" : "slide-in-left"
            }`}
          >
            {renderMainContent()}
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
