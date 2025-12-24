"use client";

import dynamic from "next/dynamic";
import { useConfiguratorStore, Step, ModelTier } from "@/lib/configurator-state";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { useState } from "react";

// Dynamically import components to avoid SSR issues
const PhaseIndicator = dynamic(() => import("@/app/components/configurator/PhaseIndicator").then(mod => ({ default: mod.PhaseIndicator })), { ssr: false });
const ModeToggle = dynamic(() => import("@/app/components/configurator/ModeToggle").then(mod => ({ default: mod.ModeToggle })), { ssr: false });
const TemplateSelector = dynamic(() => import("@/app/components/configurator/TemplateSelector").then(mod => ({ default: mod.TemplateSelector })), { ssr: false });
const InspirationUpload = dynamic(() => import("@/app/components/configurator/InspirationUpload").then(mod => ({ default: mod.InspirationUpload })), { ssr: false });
const ProjectDetails = dynamic(() => import("@/app/components/configurator/ProjectDetails").then(mod => ({ default: mod.ProjectDetails })), { ssr: false });
const IntegrationSelector = dynamic(() => import("@/app/components/configurator/IntegrationSelector").then(mod => ({ default: mod.IntegrationSelector })), { ssr: false });
const EnvironmentKeys = dynamic(() => import("@/app/components/configurator/EnvironmentKeys").then(mod => ({ default: mod.EnvironmentKeys })), { ssr: false });
const AIPreview = dynamic(() => import("@/app/components/configurator/AIPreview").then(mod => ({ default: mod.AIPreview })), { ssr: false });
const ProjectGenerator = dynamic(() => import("@/app/components/configurator/ProjectGenerator").then(mod => ({ default: mod.ProjectGenerator })), { ssr: false });
const ContextFields = dynamic(() => import("@/app/components/configurator/ContextFields").then(mod => ({ default: mod.ContextFields })), { ssr: false });
const ExportView = dynamic(() => import("@/app/components/configurator/ExportView").then(mod => ({ default: mod.ExportView })), { ssr: false });

export default function ConfigurePage() {
  const [aiTab, setAiTab] = useState<"preview" | "generate">("preview");

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
    <div className="min-h-screen bg-brand-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-4">
            <span className="gradient-text">Project Configurator</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-6">
            Configure your project and generate the CLI command
          </p>

          {/* Mode Toggle */}
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        {/* Phase Indicator */}
        <PhaseIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onPhaseClick={(step) => {
            // Navigate to first step of clicked phase
            setStep(step);
          }}
          onStepClick={(step) => {
            // Only allow clicking on completed steps or current step
            if (completedSteps.has(step) || step === currentStep) {
              setStep(step);
            }
          }}
        />

        {/* Main Content */}
        <div className="min-h-[600px]">
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
            <IntegrationSelector
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
            <div className="max-w-7xl mx-auto">
              {/* Tab Selector */}
              <div className="flex gap-2 mb-6 border-b border-zinc-700">
                <button
                  onClick={() => setAiTab("preview")}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    aiTab === "preview"
                      ? "text-brand-primary border-b-2 border-brand-primary"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Visual Preview
                </button>
                <button
                  onClick={() => setAiTab("generate")}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    aiTab === "generate"
                      ? "text-brand-primary border-b-2 border-brand-primary"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Full Project Generator
                </button>
              </div>

              {/* Model Tier Selector - Only show for Full Project Generator tab */}
              {aiTab === "generate" && (
                <div className="flex items-center gap-4 mb-6 p-4 border border-zinc-700 rounded-xl bg-zinc-800/50">
                  <label className="text-sm font-medium text-zinc-400">Model Quality:</label>
                  <select
                    value={modelTier}
                    onChange={(e) => setModelTier(e.target.value as ModelTier)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-100 px-3 py-2 rounded-lg text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                  >
                    <option value="fast">⚡ Fast (~$0.02) - Quickest, uses Haiku</option>
                    <option value="balanced">⚖️ Balanced (~$0.08) - Best value</option>
                    <option value="quality">✨ Quality (~$0.18) - Most reliable, uses Sonnet</option>
                  </select>
                  <span className="text-xs text-zinc-500">
                    {modelTier === 'fast' && 'Fastest generation, may have occasional issues'}
                    {modelTier === 'balanced' && 'Recommended for most projects'}
                    {modelTier === 'quality' && 'Best for complex or critical projects'}
                  </span>
                </div>
              )}

              {/* Tab Content */}
              {aiTab === "preview" ? (
                <AIPreview
                  template={template}
                  integrations={integrations}
                  inspirations={inspirations}
                  description={description}
                />
              ) : (
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

        {/* Navigation Buttons */}
        <div className="mt-12 flex items-center justify-between max-w-4xl mx-auto">
          <Button
            onClick={handlePrevious}
            disabled={isFirstStep}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-center">
            {!canProceed() && currentStep !== 8 && (
              <p className="text-red-400 text-sm font-medium">
                Complete this step to continue
              </p>
            )}
          </div>

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
