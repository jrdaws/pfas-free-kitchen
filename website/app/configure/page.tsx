"use client";

import { useConfiguratorStore, Step } from "@/lib/configurator-state";
import { StepIndicator } from "@/app/components/configurator/StepIndicator";
import { ModeToggle } from "@/app/components/configurator/ModeToggle";
import { TemplateSelector } from "@/app/components/configurator/TemplateSelector";
import { InspirationUpload } from "@/app/components/configurator/InspirationUpload";
import { ProjectDetails } from "@/app/components/configurator/ProjectDetails";
import { IntegrationSelector } from "@/app/components/configurator/IntegrationSelector";
import { EnvironmentKeys } from "@/app/components/configurator/EnvironmentKeys";
import { AIPreview } from "@/app/components/configurator/AIPreview";
import { ContextFields } from "@/app/components/configurator/ContextFields";
import { ExportView } from "@/app/components/configurator/ExportView";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";

export default function ConfigurePage() {
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
    <div className="min-h-screen bg-terminal-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold glow-text mb-4">
            Project Configurator
          </h1>
          <p className="text-terminal-dim text-lg mb-6">
            Configure your project and generate the CLI command
          </p>

          {/* Mode Toggle */}
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
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
            <AIPreview
              template={template}
              integrations={integrations}
              inspirations={inspirations}
              description={description}
            />
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
            className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent hover:text-terminal-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-center">
            {!canProceed() && currentStep !== 8 && (
              <p className="text-terminal-error text-sm font-mono">
                Complete this step to continue
              </p>
            )}
          </div>

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-terminal-text hover:bg-terminal-text/80 text-terminal-bg"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
