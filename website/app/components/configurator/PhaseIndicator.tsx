"use client";

import Image from "next/image";
import { PHASES, STEPS, Step, Phase } from "@/lib/configurator-state";

interface PhaseIndicatorProps {
  currentStep: Step;
  completedSteps: Set<Step>;
  onPhaseClick?: (step: Step) => void;
  onStepClick?: (step: Step) => void;
}

type PhaseStatus = "completed" | "current" | "partial" | "pending";

export function PhaseIndicator({
  currentStep,
  completedSteps,
  onPhaseClick,
  onStepClick,
}: PhaseIndicatorProps) {
  const getCurrentPhase = (): Phase | undefined => {
    return PHASES.find((phase) => phase.steps.includes(currentStep));
  };

  const getPhaseStatus = (phase: Phase): PhaseStatus => {
    const allCompleted = phase.steps.every((s) => completedSteps.has(s as Step));
    const anyCompleted = phase.steps.some((s) => completedSteps.has(s as Step));
    const isCurrent = phase.steps.includes(currentStep);

    if (allCompleted) return "completed";
    if (isCurrent) return "current";
    if (anyCompleted) return "partial";
    return "pending";
  };

  const getPhaseProgress = (phase: Phase): number => {
    const completedCount = phase.steps.filter((s) =>
      completedSteps.has(s as Step)
    ).length;
    return (completedCount / phase.steps.length) * 100;
  };

  const currentPhase = getCurrentPhase();
  const currentStepDef = STEPS.find((s) => s.number === currentStep);

  return (
    <div className="w-full mb-8">
      {/* Desktop: Horizontal phases with step details */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between max-w-4xl mx-auto">
          {PHASES.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const progress = getPhaseProgress(phase);
            const isActive = status === "current" || status === "partial";

            return (
              <div key={phase.id} className="flex items-start flex-1">
                <div className="flex flex-col items-center">
                  {/* Phase circle with icon */}
                  <button
                    onClick={() => onPhaseClick?.(phase.steps[0] as Step)}
                    className={`
                      relative flex items-center justify-center w-16 h-16 rounded-2xl
                      transition-all duration-300 cursor-pointer
                      ${status === "completed" ? "bg-brand-success shadow-lg shadow-brand-success/20" : ""}
                      ${status === "current" ? "bg-brand-primary shadow-lg shadow-brand-primary/30 phase-pulse" : ""}
                      ${status === "partial" ? "bg-brand-primary/80" : ""}
                      ${status === "pending" ? "bg-stone-800 border border-stone-700" : ""}
                    `}
                  >
                    {status === "completed" ? (
                      <Image
                        src="/images/configurator/steps/step-completed.svg"
                        alt="Completed"
                        width={28}
                        height={28}
                      />
                    ) : (
                      <Image
                        src={phase.icon}
                        alt={phase.label}
                        width={28}
                        height={28}
                        className={
                          isActive ? "brightness-0 invert" : "opacity-40"
                        }
                      />
                    )}
                  </button>

                  {/* Phase label */}
                  <div className="mt-3 text-center">
                    <div
                      className={`
                        text-sm font-semibold
                        ${status === "current" ? "text-brand-primary" : ""}
                        ${status === "completed" ? "text-brand-success" : ""}
                        ${status === "partial" ? "text-brand-primary/80" : ""}
                        ${status === "pending" ? "text-stone-500" : ""}
                      `}
                    >
                      {phase.label}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {phase.description}
                    </div>
                  </div>

                  {/* Steps within phase - show when active */}
                  {isActive && (
                    <div className="mt-4 flex gap-2">
                      {phase.steps.map((stepNum) => {
                        const stepDef = STEPS.find((s) => s.number === stepNum);
                        const isCompleted = completedSteps.has(stepNum as Step);
                        const isCurrent = currentStep === stepNum;

                        return (
                          <button
                            key={stepNum}
                            onClick={() => onStepClick?.(stepNum as Step)}
                            disabled={!isCompleted && !isCurrent}
                            className={`
                              w-8 h-8 rounded-full flex items-center justify-center
                              text-xs font-medium transition-all duration-200
                              ${isCurrent ? "bg-brand-primary text-white scale-110" : ""}
                              ${isCompleted ? "bg-brand-success text-white hover:scale-110" : ""}
                              ${!isCompleted && !isCurrent ? "bg-stone-800 text-stone-500 border border-stone-700" : ""}
                              ${isCompleted || isCurrent ? "cursor-pointer" : "cursor-not-allowed"}
                            `}
                            title={stepDef?.label}
                          >
                            {isCompleted ? "✓" : stepNum}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Connector between phases */}
                {index < PHASES.length - 1 && (
                  <div className="flex-1 flex items-center px-4 mt-8">
                    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
                        style={{
                          width:
                            status === "completed"
                              ? "100%"
                              : status === "current" || status === "partial"
                                ? `${progress}%`
                                : "0%",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current step indicator */}
        <div className="text-center mt-6">
          <span className="text-sm text-stone-400">
            <span className="text-brand-primary font-medium">
              {currentPhase?.label}
            </span>
            <span className="mx-2">›</span>
            <span className="text-stone-300">{currentStepDef?.label}</span>
            <span className="mx-2 text-stone-600">•</span>
            <span className="text-stone-500">Step {currentStep} of 8</span>
          </span>
        </div>
      </div>

      {/* Tablet: Compact horizontal */}
      <div className="hidden md:flex lg:hidden items-center justify-center max-w-xl mx-auto">
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase);

          return (
            <div key={phase.id} className="flex items-center flex-1">
              {/* Phase indicator */}
              <button
                onClick={() => onPhaseClick?.(phase.steps[0] as Step)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                  ${status === "completed" ? "bg-brand-success/10 border border-brand-success/30" : ""}
                  ${status === "current" ? "bg-brand-primary/10 border border-brand-primary/30" : ""}
                  ${status === "pending" ? "bg-stone-800/50 border border-stone-700/50" : ""}
                `}
              >
                <Image
                  src={phase.icon}
                  alt={phase.label}
                  width={20}
                  height={20}
                  className={
                    status === "pending" ? "opacity-40" : ""
                  }
                />
                <span
                  className={`
                    text-sm font-medium
                    ${status === "completed" ? "text-brand-success" : ""}
                    ${status === "current" ? "text-brand-primary" : ""}
                    ${status === "pending" ? "text-stone-500" : ""}
                  `}
                >
                  {phase.label}
                </span>
              </button>

              {/* Connector */}
              {index < PHASES.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${status === "completed" ? "bg-brand-success" : "bg-stone-700"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical compact */}
      <div className="md:hidden">
        {/* Phase dots */}
        <div className="flex justify-center gap-3 mb-3">
          {PHASES.map((phase) => {
            const status = getPhaseStatus(phase);
            return (
              <button
                key={phase.id}
                onClick={() => onPhaseClick?.(phase.steps[0] as Step)}
                className={`
                  w-3 h-3 rounded-full transition-all
                  ${status === "completed" ? "bg-brand-success" : ""}
                  ${status === "current" ? "bg-brand-primary w-8" : ""}
                  ${status === "pending" ? "bg-stone-700" : ""}
                `}
              />
            );
          })}
        </div>

        {/* Current phase and step */}
        <div className="text-center mb-4">
          <div className="text-brand-primary font-semibold">
            {currentPhase?.label}
          </div>
          <div className="text-stone-400 text-sm">
            {currentStepDef?.label} • Step {currentStep} of 8
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-stone-800 rounded-full overflow-hidden mx-4">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>

        {/* Steps in current phase */}
        <div className="flex justify-center gap-2 mt-4">
          {currentPhase?.steps.map((stepNum) => {
            const isCompleted = completedSteps.has(stepNum as Step);
            const isCurrent = currentStep === stepNum;

            return (
              <button
                key={stepNum}
                onClick={() => {
                  if (isCompleted || isCurrent) {
                    onStepClick?.(stepNum as Step);
                  }
                }}
                disabled={!isCompleted && !isCurrent}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-xs font-medium transition-all
                  ${isCurrent ? "bg-brand-primary text-white" : ""}
                  ${isCompleted ? "bg-brand-success text-white" : ""}
                  ${!isCompleted && !isCurrent ? "bg-stone-800 text-stone-600" : ""}
                `}
              >
                {isCompleted ? "✓" : stepNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

