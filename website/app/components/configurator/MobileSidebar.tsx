"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Menu, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Step, PHASES, STEPS } from "@/lib/configurator-state";
import Image from "next/image";
import { useState } from "react";

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

interface MobileSidebarProps {
  currentStep: Step;
  completedSteps: Set<number>;
  onStepChange: (step: Step) => void;
}

export function MobileSidebar({
  currentStep,
  completedSteps,
  onStepChange,
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  // Calculate progress percentage
  const progress = (completedSteps.size / 8) * 100;

  // Get current step info
  const currentStepInfo = STEPS.find((s) => s.number === currentStep);
  const currentPhase = PHASES.find((p) => p.steps.includes(currentStep as number));

  const handleStepClick = (step: Step) => {
    onStepChange(step);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-card">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-primary font-display font-bold">DD</span>
            <span className="text-sm font-normal text-muted-foreground">
              Configurator
            </span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          <nav className="p-2">
            {PHASES.map((phase) => {
              const phaseCompleted = phase.steps.every((s) =>
                completedSteps.has(s)
              );
              const phaseCurrent = phase.steps.includes(currentStep as number);

              return (
                <div key={phase.id} className="mb-4">
                  {/* Phase header */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
                        phaseCompleted && "bg-emerald-500 text-white",
                        phaseCurrent && !phaseCompleted && "bg-primary text-white",
                        !phaseCurrent && !phaseCompleted && "bg-muted text-muted-foreground"
                      )}
                    >
                      {phaseCompleted ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        phase.label.charAt(0)
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        phaseCurrent && "text-foreground",
                        !phaseCurrent && "text-muted-foreground"
                      )}
                    >
                      {phase.label}
                    </span>
                    {phaseCompleted && (
                      <Badge variant="success" className="ml-auto text-[10px] px-1.5 py-0">
                        Done
                      </Badge>
                    )}
                  </div>

                  {/* Phase steps */}
                  <div className="pl-6 space-y-1">
                    {phase.steps.map((stepNum) => {
                      const step = STEPS.find((s) => s.number === stepNum);
                      if (!step) return null;

                      const navIcon = NAV_ICONS[stepNum];
                      const isActive = currentStep === stepNum;
                      const isCompleted = completedSteps.has(stepNum);

                      return (
                        <button
                          key={stepNum}
                          onClick={() => handleStepClick(stepNum as Step)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                            "hover:bg-accent/10",
                            isActive && "bg-primary/10 text-primary border-l-2 border-primary",
                            !isActive && isCompleted && "text-emerald-500",
                            !isActive && !isCompleted && "text-muted-foreground"
                          )}
                        >
                          <Image
                            src={navIcon?.icon || "/images/configurator/nav/home.svg"}
                            alt=""
                            width={20}
                            height={20}
                            className={cn(
                              "transition-opacity",
                              isActive && "opacity-100",
                              !isActive && isCompleted && "opacity-80",
                              !isActive && !isCompleted && "opacity-50"
                            )}
                          />
                          <span className="text-sm">{navIcon?.label || step.label}</span>
                          {isCompleted && !isActive && (
                            <Check className="h-4 w-4 ml-auto text-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer with progress */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedSteps.size}/8 steps</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

