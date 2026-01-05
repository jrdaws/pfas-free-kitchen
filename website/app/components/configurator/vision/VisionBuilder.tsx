"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProblemStep } from "./ProblemStep";
import { AudienceStep } from "./AudienceStep";
import { BusinessModelStep } from "./BusinessModelStep";
import { DesignStyleStep } from "./DesignStyleStep";
import { FeatureDiscovery } from "./FeatureDiscovery";
import { VisionSummary } from "./VisionSummary";
import type { VisionDocument, AudienceType, BusinessModel, DesignStyle } from "./types";
import { DEFAULT_VISION, FEATURE_SUGGESTIONS } from "./types";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

interface VisionBuilderProps {
  template?: string;
  initialVision?: Partial<VisionDocument>;
  onComplete: (vision: VisionDocument) => void;
  onVisionChange?: (vision: VisionDocument) => void;
  className?: string;
}

const STEPS = [
  { id: "problem", label: "Problem", icon: "🎯" },
  { id: "audience", label: "Audience", icon: "👥" },
  { id: "business", label: "Business Model", icon: "💳" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "features", label: "Features", icon: "✨" },
];

export function VisionBuilder({
  template,
  initialVision,
  onComplete,
  onVisionChange,
  className,
}: VisionBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [vision, setVision] = useState<VisionDocument>(() => {
    const base = { ...DEFAULT_VISION, ...initialVision };
    // Pre-select suggested required features
    const suggestions = FEATURE_SUGGESTIONS[template || "default"] || FEATURE_SUGGESTIONS.default;
    if (!initialVision?.requiredFeatures) {
      base.requiredFeatures = [...suggestions.required];
    }
    return base;
  });

  // Notify parent of changes
  useEffect(() => {
    onVisionChange?.(vision);
  }, [vision, onVisionChange]);

  const updateVision = useCallback(<K extends keyof VisionDocument>(
    key: K,
    value: VisionDocument[K]
  ) => {
    setVision((prev) => ({ ...prev, [key]: value }));
  }, []);

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete(vision);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  const isStepComplete = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return vision.problem.length >= 10;
      case 1:
        return !!vision.audience.type;
      case 2:
        return !!vision.businessModel;
      case 3:
        return !!vision.designStyle;
      case 4:
        return vision.requiredFeatures.length > 0;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;
  const canProceed = isStepComplete(currentStep);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="font-medium text-foreground">
            {STEPS[currentStep].icon} {STEPS[currentStep].label}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => goToStep(index)}
            disabled={index > currentStep && !isStepComplete(currentStep)}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              index === currentStep
                ? "text-primary font-medium"
                : index < currentStep || isStepComplete(index)
                ? "text-foreground hover:text-primary cursor-pointer"
                : "text-muted-foreground cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                index === currentStep
                  ? "bg-primary text-primary-foreground border-primary"
                  : isStepComplete(index)
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "border-muted-foreground/30"
              )}
            >
              {isStepComplete(index) && index !== currentStep ? (
                <Check className="w-3 h-3" />
              ) : (
                index + 1
              )}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px] py-4">
        {currentStep === 0 && (
          <ProblemStep
            value={vision.problem}
            onChange={(v) => updateVision("problem", v)}
            template={template}
          />
        )}
        {currentStep === 1 && (
          <AudienceStep
            type={vision.audience.type}
            description={vision.audience.description}
            onTypeChange={(t) =>
              updateVision("audience", { ...vision.audience, type: t })
            }
            onDescriptionChange={(d) =>
              updateVision("audience", { ...vision.audience, description: d })
            }
          />
        )}
        {currentStep === 2 && (
          <BusinessModelStep
            value={vision.businessModel}
            onChange={(v) => updateVision("businessModel", v)}
          />
        )}
        {currentStep === 3 && (
          <DesignStyleStep
            style={vision.designStyle}
            inspirations={vision.inspirations}
            onStyleChange={(s) => updateVision("designStyle", s)}
            onInspirationsChange={(urls) => updateVision("inspirations", urls)}
          />
        )}
        {currentStep === 4 && (
          <FeatureDiscovery
            template={template}
            requiredFeatures={vision.requiredFeatures}
            niceToHaveFeatures={vision.niceToHaveFeatures}
            onRequiredChange={(f) => updateVision("requiredFeatures", f)}
            onNiceToHaveChange={(f) => updateVision("niceToHaveFeatures", f)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          type="button"
          onClick={goNext}
          disabled={!canProceed}
          className="gap-2"
        >
          {isLastStep ? (
            <>
              <Sparkles className="w-4 h-4" />
              Complete Vision
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Summary Sidebar (optional - can show on desktop) */}
      <div className="hidden lg:block">
        <VisionSummary vision={vision} />
      </div>
    </div>
  );
}

export default VisionBuilder;

