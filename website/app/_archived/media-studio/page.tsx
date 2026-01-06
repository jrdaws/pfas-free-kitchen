"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, HelpCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaStudioStore, MediaStudioStep } from "@/lib/media-studio-state";
import { useConfiguratorStore } from "@/lib/configurator-state";

// Dynamically import components to avoid SSR issues
const MediaStudioStepIndicator = dynamic(
  () => import("@/app/components/media-studio/MediaStudioStepIndicator").then((mod) => mod.MediaStudioStepIndicator),
  { ssr: false }
);
const AssetPlannerForm = dynamic(
  () => import("@/app/components/media-studio/AssetPlannerForm").then((mod) => mod.AssetPlannerForm),
  { ssr: false }
);
const PromptBuilder = dynamic(
  () => import("@/app/components/media-studio/PromptBuilder").then((mod) => mod.PromptBuilder),
  { ssr: false }
);
const GenerationProgress = dynamic(
  () => import("@/app/components/media-studio/GenerationProgress").then((mod) => mod.GenerationProgress),
  { ssr: false }
);
const QualityReviewer = dynamic(
  () => import("@/app/components/media-studio/QualityReviewer").then((mod) => mod.QualityReviewer),
  { ssr: false }
);

const STEPS = [
  { number: 1, label: "Plan Assets", description: "Define what images you need" },
  { number: 2, label: "Build Prompts", description: "Configure photorealistic settings" },
  { number: 3, label: "Generate", description: "Create images with AI" },
  { number: 4, label: "Review", description: "Approve or reject results" },
] as const;

// Inner component that uses useSearchParams
function MediaStudioContent() {
  const searchParams = useSearchParams();
  
  const {
    currentStep,
    completedSteps,
    projectName,
    assets,
    setStep,
    completeStep,
    setProjectContext,
    canProceedToStep,
  } = useMediaStudioStore();

  // Get context from configurator if available
  const configuratorProjectName = useConfiguratorStore((s) => s.projectName);
  const configuratorTemplate = useConfiguratorStore((s) => s.template);

  // Initialize from URL params or configurator state
  useEffect(() => {
    const urlProject = searchParams.get("project");
    const urlTemplate = searchParams.get("template");
    
    if (urlProject || urlTemplate) {
      setProjectContext(
        urlProject || configuratorProjectName || "my-project",
        urlTemplate || configuratorTemplate || "saas"
      );
    } else if (configuratorProjectName) {
      setProjectContext(configuratorProjectName, configuratorTemplate);
    }
  }, [searchParams, configuratorProjectName, configuratorTemplate, setProjectContext]);

  const handleStepClick = (step: MediaStudioStep) => {
    // Allow navigation to completed steps or current step
    if (completedSteps.has(step) || step === currentStep || step < currentStep) {
      setStep(step);
    }
  };

  const handleNext = () => {
    const nextStep = (currentStep + 1) as MediaStudioStep;
    if (nextStep <= 4 && canProceedToStep(nextStep)) {
      completeStep(currentStep);
      setStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = (currentStep - 1) as MediaStudioStep;
    if (prevStep >= 1) {
      setStep(prevStep);
    }
  };

  const canProceed = canProceedToStep((currentStep + 1) as MediaStudioStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 4;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/configure">
              <Button variant="ghost" size="sm" className="text-terminal-dim hover:text-terminal-text">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Configurator
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <ImageIcon className="h-6 w-6 text-terminal-accent" />
            <h1 className="text-2xl font-display font-bold glow-text">
              Media Studio
            </h1>
          </div>

          <Button variant="ghost" size="sm" className="text-terminal-dim hover:text-terminal-text">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        </div>

        {/* Project Context Banner */}
        {projectName && (
          <div className="mb-6 px-4 py-3 bg-terminal-text/5 border border-terminal-text/20 rounded-lg">
            <p className="text-sm text-terminal-dim">
              <span className="text-terminal-text font-medium">Project:</span> {projectName}
              {assets.length > 0 && (
                <span className="ml-4">
                  <span className="text-terminal-text font-medium">Assets:</span> {assets.length} planned
                </span>
              )}
            </p>
          </div>
        )}

        {/* Step Indicator */}
        <MediaStudioStepIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Main Content */}
        <div className="min-h-[600px] mt-8">
          {currentStep === 1 && <AssetPlannerForm />}
          {currentStep === 2 && <PromptBuilder />}
          {currentStep === 3 && <GenerationProgress />}
          {currentStep === 4 && <QualityReviewer />}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-12 flex items-center justify-between max-w-4xl mx-auto">
          <Button
            onClick={handlePrevious}
            disabled={isFirstStep}
            variant="outline"
            className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent hover:text-terminal-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-center">
            {!canProceed && !isLastStep && assets.length === 0 && currentStep === 1 && (
              <p className="text-terminal-dim text-sm font-mono">
                Add at least one asset to continue
              </p>
            )}
            {!canProceed && !isLastStep && currentStep === 2 && (
              <p className="text-terminal-dim text-sm font-mono">
                Configure prompts for all assets
              </p>
            )}
            {!canProceed && !isLastStep && currentStep === 3 && (
              <p className="text-terminal-dim text-sm font-mono">
                Wait for generation to complete
              </p>
            )}
          </div>

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          ) : (
            <Link href="/configure">
              <Button className="bg-terminal-text hover:bg-terminal-text/80 text-terminal-bg">
                Finish & Return
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary for useSearchParams
export default function MediaStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-brand-primary text-xl font-mono">Loading Media Studio...</div>
        </div>
      </div>
    }>
      <MediaStudioContent />
    </Suspense>
  );
}

