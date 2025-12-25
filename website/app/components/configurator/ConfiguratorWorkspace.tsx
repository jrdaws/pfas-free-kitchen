"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Step, PHASES, STEPS, PhaseId } from "@/lib/configurator-state";
import { 
  LayoutTemplate, 
  Lightbulb, 
  FolderOpen, 
  Puzzle, 
  Key, 
  Eye, 
  FileText, 
  Rocket,
  Check,
  AlertCircle,
  ChevronRight,
  X
} from "lucide-react";

// Step icons using Lucide
const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <LayoutTemplate className="h-5 w-5" />,
  2: <Lightbulb className="h-5 w-5" />,
  3: <FolderOpen className="h-5 w-5" />,
  4: <Puzzle className="h-5 w-5" />,
  5: <Key className="h-5 w-5" />,
  6: <Eye className="h-5 w-5" />,
  7: <FileText className="h-5 w-5" />,
  8: <Rocket className="h-5 w-5" />,
};

// Step labels
const STEP_LABELS: Record<number, string> = {
  1: "Template",
  2: "Inspiration",
  3: "Project",
  4: "Integrations",
  5: "Environment",
  6: "Preview",
  7: "Context",
  8: "Export",
};

// Phase colors
const PHASE_COLORS: Record<PhaseId, string> = {
  setup: "text-blue-400",
  configure: "text-violet-400",
  launch: "text-emerald-400",
};

interface ConfiguratorWorkspaceProps {
  currentStep: Step;
  completedSteps: Set<number>;
  onStepChange: (step: Step) => void;
  children: React.ReactNode;
  // Optional: summary data for the panel
  summaryData?: {
    template?: string;
    projectName?: string;
    integrationsCount?: number;
    totalIntegrations?: number;
  };
}

export function ConfiguratorWorkspace({
  currentStep,
  completedSteps,
  onStepChange,
  children,
  summaryData,
}: ConfiguratorWorkspaceProps) {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Calculate progress
  const progress = (completedSteps.size / 8) * 100;

  // Get current phase
  const currentPhase = useMemo(() => {
    for (const phase of PHASES) {
      if (phase.steps.includes(currentStep as number)) {
        return phase;
      }
    }
    return PHASES[0];
  }, [currentStep]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Icon Navigation Bar (56px) */}
        <aside className="hidden md:flex flex-col w-14 border-r border-border bg-card/50">
          {/* Logo */}
          <div className="h-14 flex items-center justify-center border-b border-border">
            <span className="text-primary font-display font-bold text-lg">DD</span>
          </div>

          {/* Step Icons */}
          <ScrollArea className="flex-1 py-2">
            <nav className="flex flex-col gap-0.5 px-1.5">
              {PHASES.map((phase) => (
                <div key={phase.id} className="mb-3">
                  {/* Phase indicator dot */}
                  <div className="flex justify-center mb-1">
                    <div className={cn(
                      "w-1 h-1 rounded-full",
                      currentPhase.id === phase.id ? "bg-primary" : "bg-muted-foreground/30"
                    )} />
                  </div>
                  
                  {/* Phase steps */}
                  {phase.steps.map((stepNum) => {
                    const isActive = currentStep === stepNum;
                    const isCompleted = completedSteps.has(stepNum);
                    const isHovered = hoveredStep === stepNum;

                    return (
                      <Tooltip key={stepNum}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onStepChange(stepNum as Step)}
                            onMouseEnter={() => setHoveredStep(stepNum)}
                            onMouseLeave={() => setHoveredStep(null)}
                            className={cn(
                              "relative w-full h-11 flex items-center justify-center rounded-lg transition-all duration-150",
                              "hover:bg-primary/10",
                              isActive && "bg-primary/15 text-primary",
                              !isActive && !isCompleted && "text-muted-foreground",
                              isCompleted && !isActive && "text-emerald-500"
                            )}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r" />
                            )}

                            {/* Icon */}
                            <div className="relative">
                              {STEP_ICONS[stepNum]}
                              
                              {/* Completion badge */}
                              {isCompleted && !isActive && (
                                <div className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                          <div className="flex items-center gap-2">
                            <span>{STEP_LABELS[stepNum]}</span>
                            {isCompleted && (
                              <Check className="h-3 w-3 text-emerald-500" />
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

          {/* Progress at bottom */}
          <div className="p-2 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1.5">
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

        {/* Expandable Summary Panel (200px when expanded) */}
        <aside 
          className={cn(
            "hidden md:flex flex-col border-r border-border bg-card/30 transition-all duration-200 overflow-hidden",
            isPanelExpanded ? "w-52" : "w-0"
          )}
        >
          {isPanelExpanded && (
            <>
              {/* Panel Header */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Summary</span>
                <button
                  onClick={() => setIsPanelExpanded(false)}
                  className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Summary Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Project Info */}
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Project
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template</span>
                        <span className="text-foreground font-medium">
                          {summaryData?.template || "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-foreground font-medium truncate max-w-[100px]">
                          {summaryData?.projectName || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Integrations Status */}
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Integrations
                    </h4>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={summaryData?.totalIntegrations ? 
                          ((summaryData.integrationsCount || 0) / summaryData.totalIntegrations) * 100 : 0
                        } 
                        className="h-2 flex-1" 
                      />
                      <span className="text-xs text-muted-foreground">
                        {summaryData?.integrationsCount || 0}/{summaryData?.totalIntegrations || 0}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Step Status */}
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Steps
                    </h4>
                    <div className="space-y-1">
                      {STEPS.map((step) => {
                        const isCompleted = completedSteps.has(step.number);
                        const isCurrent = currentStep === step.number;
                        
                        return (
                          <button
                            key={step.number}
                            onClick={() => onStepChange(step.number as Step)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left",
                              "hover:bg-muted/50",
                              isCurrent && "bg-primary/10 text-primary",
                              !isCurrent && "text-muted-foreground"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                            ) : isCurrent ? (
                              <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-muted-foreground/30 shrink-0" />
                            )}
                            <span>{step.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="p-3 border-t border-border">
                <Badge 
                  variant={completedSteps.size === 8 ? "success" : "secondary"}
                  className="w-full justify-center"
                >
                  {completedSteps.size === 8 ? "Ready to Export" : `${8 - completedSteps.size} steps remaining`}
                </Badge>
              </div>
            </>
          )}
        </aside>

        {/* Panel Toggle (when collapsed) */}
        {!isPanelExpanded && (
          <button
            onClick={() => setIsPanelExpanded(true)}
            className="hidden md:flex absolute left-14 top-1/2 -translate-y-1/2 z-10 w-6 h-12 items-center justify-center bg-card border border-border rounded-r-lg hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}

