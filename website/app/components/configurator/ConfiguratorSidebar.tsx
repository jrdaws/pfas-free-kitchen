"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Step, PHASES, STEPS } from "@/lib/configurator-state";
import Image from "next/image";

// Map steps to nav icons
const NAV_ICONS: Record<number, { icon: string; label: string }> = {
  1: { icon: "/images/configurator/nav/template.svg", label: "Template" },
  2: { icon: "/images/configurator/nav/inspiration.svg", label: "Inspiration" },
  3: { icon: "/images/configurator/nav/home.svg", label: "Project Details" },
  4: { icon: "/images/configurator/nav/integrations.svg", label: "Integrations" },
  5: { icon: "/images/configurator/nav/keys.svg", label: "Environment" },
  6: { icon: "/images/configurator/nav/preview.svg", label: "Preview" },
  7: { icon: "/images/configurator/nav/inspiration.svg", label: "Context" },
  8: { icon: "/images/configurator/nav/export.svg", label: "Export" },
};

// Get step state icon
const getStepStateIcon = (
  step: number,
  currentStep: number,
  completedSteps: Set<number>
): string => {
  if (completedSteps.has(step)) return "/images/configurator/steps/complete.svg";
  if (step === currentStep) return "/images/configurator/steps/active.svg";
  return "/images/configurator/steps/pending.svg";
};

interface ConfiguratorSidebarProps {
  currentStep: Step;
  completedSteps: Set<number>;
  onStepChange: (step: Step) => void;
  className?: string;
}

export function ConfiguratorSidebar({
  currentStep,
  completedSteps,
  onStepChange,
  className,
}: ConfiguratorSidebarProps) {
  // Calculate progress percentage
  const progress = (completedSteps.size / 8) * 100;

  // Determine which phase is current
  const getCurrentPhase = () => {
    for (const phase of PHASES) {
      if (phase.steps.includes(currentStep as number)) {
        return phase.id;
      }
    }
    return PHASES[0].id;
  };

  const currentPhaseId = getCurrentPhase();

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "hidden md:flex flex-col w-16 border-r border-border bg-card/50",
          className
        )}
      >
        {/* Logo/Brand area */}
        <div className="h-14 flex items-center justify-center border-b border-border">
          <span className="text-primary font-display font-bold text-lg">DD</span>
        </div>

        {/* Navigation Icons */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {PHASES.map((phase) => (
              <div key={phase.id} className="mb-2">
                {/* Phase label (mini) */}
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {phase.label.charAt(0)}
                </div>
                
                {/* Phase steps */}
                {phase.steps.map((stepNum) => {
                  const step = STEPS.find((s) => s.number === stepNum);
                  if (!step) return null;
                  
                  const navIcon = NAV_ICONS[stepNum];
                  const isActive = currentStep === stepNum;
                  const isCompleted = completedSteps.has(stepNum);
                  const isPhaseCurrent = currentPhaseId === phase.id;

                  return (
                    <Tooltip key={stepNum}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onStepChange(stepNum as Step)}
                          className={cn(
                            "relative w-full h-12 flex items-center justify-center rounded-lg transition-all duration-200",
                            "hover:bg-accent/10",
                            isActive && "bg-primary/10 text-primary",
                            !isActive && !isCompleted && "text-muted-foreground",
                            isCompleted && !isActive && "text-emerald-500"
                          )}
                        >
                          {/* Active indicator bar */}
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r" />
                          )}

                          {/* Navigation icon */}
                          <div className="relative">
                            <Image
                              src={navIcon?.icon || "/images/configurator/nav/home.svg"}
                              alt={navIcon?.label || "Step"}
                              width={24}
                              height={24}
                              className={cn(
                                "transition-opacity",
                                isActive && "opacity-100",
                                !isActive && isCompleted && "opacity-80",
                                !isActive && !isCompleted && "opacity-50"
                              )}
                            />
                            
                            {/* Completion badge */}
                            {isCompleted && !isActive && (
                              <Image
                                src="/images/configurator/badges/complete.svg"
                                alt="Complete"
                                width={12}
                                height={12}
                                className="absolute -top-1 -right-1"
                              />
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={12}>
                        <div className="flex items-center gap-2">
                          <span>{navIcon?.label || step.label}</span>
                          {isCompleted && (
                            <span className="text-xs text-emerald-500">✓</span>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Progress indicator at bottom */}
        <div className="p-2 border-t border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2">
                <Progress value={progress} className="h-1" />
                <div className="text-[10px] text-center text-muted-foreground">
                  {completedSteps.size}/8
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{Math.round(progress)}% complete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}

