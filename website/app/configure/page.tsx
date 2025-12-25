"use client";

import dynamic from "next/dynamic";
import { useConfiguratorStore, Step, ModelTier } from "@/lib/configurator-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { useState, useEffect, useRef } from "react";

// Dynamically import components to avoid SSR issues
const ConfiguratorSidebar = dynamic(() => import("@/app/components/configurator/ConfiguratorSidebar").then(mod => ({ default: mod.ConfiguratorSidebar })), { ssr: false });
const MobileSidebar = dynamic(() => import("@/app/components/configurator/MobileSidebar").then(mod => ({ default: mod.MobileSidebar })), { ssr: false });
const ModeToggle = dynamic(() => import("@/app/components/configurator/ModeToggle").then(mod => ({ default: mod.ModeToggle })), { ssr: false });
const TemplateSelector = dynamic(() => import("@/app/components/configurator/TemplateSelector").then(mod => ({ default: mod.TemplateSelector })), { ssr: false });
const InspirationUpload = dynamic(() => import("@/app/components/configurator/InspirationUpload").then(mod => ({ default: mod.InspirationUpload })), { ssr: false });
const ProjectDetails = dynamic(() => import("@/app/components/configurator/ProjectDetails").then(mod => ({ default: mod.ProjectDetails })), { ssr: false });
const IntegrationSelector = dynamic(() => import("@/app/components/configurator/IntegrationSelector").then(mod => ({ default: mod.IntegrationSelector })), { ssr: false });
const IntegrationPanel = dynamic(() => import("@/app/components/configurator/IntegrationPanel").then(mod => ({ default: mod.IntegrationPanel })), { ssr: false });
const EnvironmentKeys = dynamic(() => import("@/app/components/configurator/EnvironmentKeys").then(mod => ({ default: mod.EnvironmentKeys })), { ssr: false });
const AIPreview = dynamic(() => import("@/app/components/configurator/AIPreview").then(mod => ({ default: mod.AIPreview })), { ssr: false });
const ComponentAwarePreview = dynamic(() => import("@/app/components/configurator/ComponentAwarePreview").then(mod => ({ default: mod.ComponentAwarePreview })), { ssr: false });
const ProjectGenerator = dynamic(() => import("@/app/components/configurator/ProjectGenerator").then(mod => ({ default: mod.ProjectGenerator })), { ssr: false });
const ContextFields = dynamic(() => import("@/app/components/configurator/ContextFields").then(mod => ({ default: mod.ContextFields })), { ssr: false });
const ExportView = dynamic(() => import("@/app/components/configurator/ExportView").then(mod => ({ default: mod.ExportView })), { ssr: false });

// Step titles for breadcrumb
const STEP_TITLES: Record<number, string> = {
  1: "Template Selection",
  2: "Inspiration & Vision",
  3: "Project Details",
  4: "Integrations",
  5: "Environment Keys",
  6: "AI Preview",
  7: "Context Fields",
  8: "Export",
};

// Phase names for breadcrumb
const getPhaseForStep = (step: number): string => {
  if (step <= 3) return "Setup";
  if (step <= 5) return "Configure";
  return "Launch";
};

export default function ConfigurePage() {
  const [aiTab, setAiTab] = useState<"component" | "preview" | "generate">("component");
  
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

  // Calculate progress
  const progress = (completedSteps.size / 8) * 100;

  // Validation for each step
  const canProceed = () => {
    switch (currentStep) {
      case 1: // Template selection
        return template !== "";
      case 2: // Inspiration (optional step)
        return true;
      case 3: // Project details
        const slugifiedName = projectName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return (
          projectName.length > 0 &&
          /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slugifiedName) &&
          outputDir.length > 0 &&
          outputDir.startsWith("./")
        );
      case 4: // Integrations
        // Check if all required integrations are selected
        if (!selectedTemplate) return false;
        const missingRequired = selectedTemplate.requiredIntegrations.filter(
          (type) => !integrations[type]
        );
        return missingRequired.length === 0;
      case 5: // Environment (optional step)
        return true;
      case 6: // AI Preview (optional step)
        return true;
      case 7: // Context (optional step)
        return true;
      case 8: // Export
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    completeStep(currentStep);

    // All steps are now active
    const nextStep = (currentStep + 1) as Step;

    if (nextStep <= 8) {
      setStep(nextStep);
    }
  };

  const handlePrevious = () => {
    // All steps are now active
    const prevStep = (currentStep - 1) as Step;

    if (prevStep >= 1) {
      setStep(prevStep);
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 8;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <ConfiguratorSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={setStep}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card/50">
          {/* Mobile menu */}
          <MobileSidebar
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepChange={setStep}
          />

          {/* Breadcrumb */}
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">
              {getPhaseForStep(currentStep)} › {STEP_TITLES[currentStep]}
            </div>
            <h1 className="text-lg font-display font-semibold text-foreground">
              {STEP_TITLES[currentStep]}
            </h1>
          </div>

          {/* Mode Toggle */}
          <ModeToggle mode={mode} onChange={setMode} />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto">
          <div 
            key={animationKey}
            className={`max-w-6xl mx-auto px-6 py-8 ${
              animationDirection === "right" ? "slide-in-right" : "slide-in-left"
            }`}
          >
            {currentStep === 1 && (
              <TemplateSelector
                selectedTemplate={template}
                onSelect={setTemplate}
              />
            )}

            {currentStep === 2 && (
              <InspirationUpload
                inspirations={inspirations}
                description={description}
                onAddInspiration={addInspiration}
                onRemoveInspiration={removeInspiration}
                onDescriptionChange={setDescription}
              />
            )}

            {currentStep === 3 && (
              <ProjectDetails
                projectName={projectName}
                outputDir={outputDir}
                onProjectNameChange={setProjectName}
                onOutputDirChange={setOutputDir}
              />
            )}

            {currentStep === 4 && (
              <IntegrationPanel
                template={template}
                integrations={integrations}
                onIntegrationChange={setIntegration}
                mode={mode}
              />
            )}

            {currentStep === 5 && (
              <EnvironmentKeys
                integrations={integrations}
                envKeys={envKeys}
                onEnvKeyChange={setEnvKey}
              />
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                {/* Tab Selector */}
                <div className="flex gap-2 border-b border-border">
                  <button
                    onClick={() => setAiTab("component")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      aiTab === "component"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Component Preview ✨
                  </button>
                  <button
                    onClick={() => setAiTab("preview")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      aiTab === "preview"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    AI HTML Preview
                  </button>
                  <button
                    onClick={() => setAiTab("generate")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      aiTab === "generate"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Full Project Generator
                  </button>
                </div>

                {/* Model Tier Selector - Only show for Full Project Generator tab */}
                {aiTab === "generate" && (
                  <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card">
                    <label className="text-sm font-medium text-muted-foreground">Model Quality:</label>
                    <select
                      value={modelTier}
                      onChange={(e) => setModelTier(e.target.value as ModelTier)}
                      className="bg-background border border-border text-foreground px-3 py-2 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value="fast">⚡ Fast (~$0.02) - Quickest, uses Haiku</option>
                      <option value="balanced">⚖️ Balanced (~$0.08) - Best value</option>
                      <option value="quality">✨ Quality (~$0.18) - Most reliable, uses Sonnet</option>
                    </select>
                    <span className="text-xs text-muted-foreground">
                      {modelTier === 'fast' && 'Fastest generation, may have occasional issues'}
                      {modelTier === 'balanced' && 'Recommended for most projects'}
                      {modelTier === 'quality' && 'Best for complex or critical projects'}
                    </span>
                  </div>
                )}

                {/* Tab Content */}
                {aiTab === "component" && (
                  <ComponentAwarePreview
                    template={template}
                    integrations={integrations}
                    inspirations={inspirations}
                    description={description}
                  />
                )}
                {aiTab === "preview" && (
                  <AIPreview
                    template={template}
                    integrations={integrations}
                    inspirations={inspirations}
                    description={description}
                  />
                )}
                {aiTab === "generate" && (
                  <ProjectGenerator
                    template={template}
                    integrations={integrations}
                    inspirations={inspirations}
                    description={description}
                    modelTier={modelTier}
                  />
                )}
              </div>
            )}

            {currentStep === 7 && (
              <ContextFields
                vision={vision}
                mission={mission}
                successCriteria={successCriteria}
                onVisionChange={setVision}
                onMissionChange={setMission}
                onSuccessCriteriaChange={setSuccessCriteria}
              />
            )}

            {currentStep === 8 && (
              <ExportView
                template={template}
                projectName={projectName}
                outputDir={outputDir}
                integrations={integrations}
                vision={vision}
                mission={mission}
                successCriteria={successCriteria}
                envKeys={envKeys}
              />
            )}
          </div>
        </main>

        {/* Footer with Navigation */}
        <footer className="flex items-center gap-4 px-6 py-4 border-t border-border bg-card/50">
          {/* Progress */}
          <div className="flex-1 flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-2 max-w-xs" />
            <span className="text-sm text-muted-foreground">
              {completedSteps.size}/8 complete
            </span>
          </div>

          {/* Validation message */}
          {!canProceed() && currentStep !== 8 && (
            <p className="text-destructive text-sm font-medium">
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
                className="disabled:opacity-50"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // Reset configurator or provide option to start over
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
    </div>
  );
}
