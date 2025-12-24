"use client";

import { Check } from "lucide-react";
import { Step } from "@/lib/configurator-state";

// Step definition type
interface StepDef {
  number: number;
  label: string;
}

// Phase definition type
interface PhaseDef {
  name: string;
  steps: StepDef[];
}

// Phase definitions with their associated steps
const PHASES: PhaseDef[] = [
  {
    name: "Configure",
    steps: [
      { number: 1, label: "Template" },
      { number: 2, label: "Inspiration" },
      { number: 3, label: "Project" },
      { number: 4, label: "Integrations" },
    ],
  },
  {
    name: "Customize",
    steps: [
      { number: 5, label: "Environment" },
      { number: 6, label: "Preview" },
    ],
  },
  {
    name: "Finalize",
    steps: [
      { number: 7, label: "Context" },
      { number: 8, label: "Export" },
    ],
  },
];

// Flat list of all steps for backwards compatibility
const ALL_STEPS: StepDef[] = PHASES.flatMap((phase) => phase.steps);

interface StepIndicatorProps {
  currentStep: Step;
  completedSteps: Set<Step>;
  onStepClick?: (step: Step) => void;
}

export function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  // Determine which phase is active
  const getCurrentPhase = () => {
    for (let i = 0; i < PHASES.length; i++) {
      const phase = PHASES[i];
      if (phase.steps.some((s) => s.number === currentStep)) {
        return i;
      }
    }
    return 0;
  };

  const currentPhaseIndex = getCurrentPhase();

  // Check if a phase is complete (all its steps are completed)
  const isPhaseComplete = (phaseIndex: number) => {
    return PHASES[phaseIndex].steps.every((s) =>
      completedSteps.has(s.number as Step)
    );
  };

  // Check if phase is accessible (current or completed)
  const isPhaseAccessible = (phaseIndex: number) => {
    if (phaseIndex === currentPhaseIndex) return true;
    if (phaseIndex < currentPhaseIndex) return true;
    // Can access next phase if current phase is complete
    if (phaseIndex === currentPhaseIndex + 1 && isPhaseComplete(currentPhaseIndex)) {
      return true;
    }
    return false;
  };

  return (
    <div className="w-full mb-8">
      {/* Phase headers - Desktop */}
      <div className="hidden lg:flex items-center justify-center gap-2 mb-4">
        {PHASES.map((phase, phaseIndex) => {
          const isActive = phaseIndex === currentPhaseIndex;
          const isComplete = isPhaseComplete(phaseIndex);
          const isPast = phaseIndex < currentPhaseIndex;

          return (
            <div key={phase.name} className="flex items-center">
              <div
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                      : isComplete || isPast
                      ? "bg-brand-success/10 text-brand-success border border-brand-success/20"
                      : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50"
                  }
                `}
              >
                {isComplete && <Check className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5" />}
                {phase.name}
              </div>
              {phaseIndex < PHASES.length - 1 && (
                <div
                  className={`
                    w-8 h-0.5 mx-2 transition-colors
                    ${isPast || isComplete ? "bg-brand-success/50" : "bg-zinc-700/50"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Steps within current phase - Desktop */}
      <div className="hidden md:block">
        <div className="flex items-center justify-center gap-1 max-w-5xl mx-auto">
          {PHASES.map((phase, phaseIndex) => {
            const isActivePhase = phaseIndex === currentPhaseIndex;
            const isPastPhase = phaseIndex < currentPhaseIndex;
            const isAccessible = isPhaseAccessible(phaseIndex);

            return (
              <div
                key={phase.name}
                className={`
                  flex items-center px-3 py-2 rounded-xl transition-all
                  ${
                    isActivePhase
                      ? "bg-zinc-800/80 border border-brand-primary/20"
                      : isPastPhase
                      ? "bg-zinc-800/40 border border-zinc-700/30"
                      : "bg-zinc-900/30 border border-zinc-800/30"
                  }
                `}
              >
                {phase.steps.map((step, stepIndex) => {
                  const isCompleted = completedSteps.has(step.number as Step);
                  const isCurrent = currentStep === step.number;
                  const isClickable = (isCompleted || isCurrent) && isAccessible;

                  return (
                    <div key={step.number} className="flex items-center">
                      {/* Step circle */}
                      <button
                        onClick={() =>
                          isClickable && onStepClick?.(step.number as Step)
                        }
                        disabled={!isClickable}
                        className={`
                          relative flex items-center justify-center w-8 h-8 rounded-full
                          text-xs font-medium transition-all duration-200
                          ${
                            isCurrent
                              ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                              : isCompleted
                              ? "bg-brand-success text-white hover:scale-110"
                              : isAccessible
                              ? "bg-zinc-700 text-zinc-400 border border-zinc-600"
                              : "bg-zinc-800/50 text-zinc-600 border border-zinc-700/50"
                          }
                          ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}
                        `}
                        title={step.label}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          step.number
                        )}
                      </button>

                      {/* Step label - only show for current step or on hover via tooltip */}
                      {isCurrent && (
                        <span className="ml-2 text-xs font-medium text-brand-primary whitespace-nowrap">
                          {step.label}
                        </span>
                      )}

                      {/* Connector within phase */}
                      {stepIndex < phase.steps.length - 1 && (
                        <div
                          className={`
                            w-4 h-0.5 mx-1 transition-colors
                            ${
                              isCompleted
                                ? "bg-brand-success"
                                : "bg-zinc-700"
                            }
                          `}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Phase connector */}
                {phaseIndex < PHASES.length - 1 && (
                  <div
                    className={`
                      w-6 h-0.5 mx-2 transition-colors
                      ${
                        isPastPhase || isPhaseComplete(phaseIndex)
                          ? "bg-brand-success/50"
                          : "bg-zinc-700/30"
                      }
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile view - Simplified */}
      <div className="md:hidden">
        {/* Phase indicator */}
        <div className="flex justify-center gap-1 mb-3">
          {PHASES.map((phase, phaseIndex) => {
            const isActive = phaseIndex === currentPhaseIndex;
            const isComplete = isPhaseComplete(phaseIndex);

            return (
              <div
                key={phase.name}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${
                    isActive
                      ? "bg-brand-primary w-6"
                      : isComplete
                      ? "bg-brand-success"
                      : "bg-zinc-700"
                  }
                `}
              />
            );
          })}
        </div>

        {/* Current step display */}
        <div className="text-center">
          <div className="text-xs text-zinc-500 mb-1">
            {PHASES[currentPhaseIndex].name}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white text-sm font-medium">
              {currentStep}
            </span>
            <span className="text-brand-primary font-medium">
              {ALL_STEPS[currentStep - 1].label}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-2">
            Step {currentStep} of {ALL_STEPS.length}
          </div>
        </div>

        {/* Step dots for current phase */}
        <div className="flex justify-center gap-1 mt-4">
          {PHASES[currentPhaseIndex].steps.map((step) => {
            const isCompleted = completedSteps.has(step.number as Step);
            const isCurrent = currentStep === step.number;

            return (
              <button
                key={step.number}
                onClick={() => {
                  if (isCompleted || isCurrent) {
                    onStepClick?.(step.number as Step);
                  }
                }}
                disabled={!isCompleted && !isCurrent}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${
                    isCurrent
                      ? "bg-brand-primary w-4"
                      : isCompleted
                      ? "bg-brand-success cursor-pointer hover:scale-125"
                      : "bg-zinc-700"
                  }
                `}
                title={step.label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
