"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, Github, Database, Rocket } from "lucide-react";

// Custom SVG icon component
interface SectionIconProps {
  sectionId: string;
  className?: string;
}

function SectionIcon({ sectionId, className }: SectionIconProps) {
  // Map section IDs to custom SVG icons
  const customIconSections = ["research", "core-features", "integrate-ai", "cursor", "claude-code"];
  
  if (customIconSections.includes(sectionId)) {
    const iconPath = `/images/configurator/sections/${
      sectionId === "core-features" ? "features" : 
      sectionId === "integrate-ai" ? "ai" : 
      sectionId
    }.svg`;
    
    return (
      <Image
        src={iconPath}
        alt={sectionId}
        width={20}
        height={20}
        className={cn("text-current", className)}
        style={{ filter: "currentcolor" }}
      />
    );
  }
  
  // Fallback to Lucide icons for sections without custom icons
  switch (sectionId) {
    case "github":
      return <Github className={cn("h-5 w-5", className)} />;
    case "supabase":
      return <Database className={cn("h-5 w-5", className)} />;
    case "vercel":
      return <Rocket className={cn("h-5 w-5", className)} />;
    default:
      return null;
  }
}

// Sidebar navigation sections matching 5DaySprint design
export interface NavSection {
  id: string;
  label: string;
  description: string;
  stepNumber: number;
  badge?: string | number;
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: "research",
    label: "Research",
    description: "Define your project vision",
    stepNumber: 1,
  },
  {
    id: "core-features",
    label: "Core Features",
    description: "Select features for your project",
    stepNumber: 2,
  },
  {
    id: "integrate-ai",
    label: "Integrate AI",
    description: "Add AI capabilities to your project",
    stepNumber: 3,
  },
  {
    id: "cursor",
    label: "Cursor",
    description: "Download & Install Cursor",
    stepNumber: 4,
  },
  {
    id: "github",
    label: "GitHub",
    description: "Create your GitHub repository",
    stepNumber: 5,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    description: "Install Claude Code CLI for AI assistance",
    stepNumber: 6,
  },
  {
    id: "supabase",
    label: "Supabase",
    description: "Configure your Supabase project",
    stepNumber: 7,
  },
  {
    id: "vercel",
    label: "Vercel",
    description: "Deploy your application",
    stepNumber: 8,
  },
];

// Storage key for expanded state
const STORAGE_KEY = "accordion-sidebar-expanded";

export type StepState = "completed" | "current" | "pending";

export interface SectionBadges {
  [sectionId: string]: string | number | undefined;
}

interface AccordionSidebarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepChange: (step: number) => void;
  className?: string;
  /** Render function for section content - receives sectionId */
  children?: (sectionId: string) => React.ReactNode;
  /** Badge counts/text per section */
  sectionBadges?: SectionBadges;
}

export function AccordionSidebar({
  currentStep,
  completedSteps,
  onStepChange,
  className,
  children,
  sectionBadges = {},
}: AccordionSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Get section ID for current step
  const getCurrentSectionId = () => {
    const section = NAV_SECTIONS.find((s) => s.stepNumber === currentStep);
    return section?.id || NAV_SECTIONS[0].id;
  };

  // Load expanded state from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setExpandedSections(JSON.parse(saved));
      } catch {
        // Invalid JSON, use default
        setExpandedSections([getCurrentSectionId()]);
      }
    } else {
      // Default: expand current section
      setExpandedSections([getCurrentSectionId()]);
    }
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    if (mounted && expandedSections.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedSections));
    }
  }, [expandedSections, mounted]);

  // Auto-expand current section when step changes
  useEffect(() => {
    if (mounted) {
      const currentSectionId = getCurrentSectionId();
      if (!expandedSections.includes(currentSectionId)) {
        setExpandedSections([currentSectionId]);
      }
    }
  }, [currentStep, mounted]);

  // Handle section click - navigate to step
  const handleSectionClick = (section: NavSection) => {
    onStepChange(section.stepNumber);
  };

  // Determine step state
  const getStepState = (stepNumber: number): StepState => {
    if (completedSteps.has(stepNumber)) return "completed";
    if (stepNumber === currentStep) return "current";
    return "pending";
  };

  if (!mounted) {
    return (
      <aside className={cn("hidden md:flex flex-col w-[320px] bg-[var(--surface)] border-r border-[var(--border)]", className)}>
        <div className="h-14 flex items-center px-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
            <span className="font-bold text-[var(--text-secondary)]">Loading...</span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[320px] bg-[var(--surface)] border-r border-[var(--border)] shadow-sm h-screen",
        className
      )}
    >
      {/* Logo/Brand area */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
          <span className="font-bold text-[var(--text-primary)] text-lg">Dawson Does</span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {completedSteps.size}/{NAV_SECTIONS.length}
        </span>
      </div>

      {/* Accordion Navigation */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="w-full"
        >
          {NAV_SECTIONS.map((section) => {
            const state = getStepState(section.stepNumber);
            const isActive = section.stepNumber === currentStep;
            const isExpanded = expandedSections.includes(section.id);
            const badge = sectionBadges[section.id];

            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border-b border-[var(--border)]"
              >
                <AccordionTrigger
                  onClick={() => handleSectionClick(section)}
                  className={cn(
                    "sidebar-item relative px-4 py-3.5 hover:bg-[var(--primary-light)] hover:no-underline group",
                    isActive && "bg-[var(--primary-light)]"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[var(--primary)] rounded-r-md" />
                  )}

                  <div className="flex items-center gap-3.5 flex-1">
                    {/* Status indicator or icon */}
                    <div
                      className={cn(
                        "sidebar-icon flex items-center justify-center w-9 h-9 rounded-xl transition-colors",
                        state === "completed" && "bg-[var(--success-light)] text-[var(--success-dark)]",
                        state === "current" && "bg-[var(--primary-light)] text-[var(--primary)]",
                        state === "pending" && "bg-[var(--muted)] text-[var(--text-secondary)]"
                      )}
                    >
                      {state === "completed" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <SectionIcon sectionId={section.id} />
                      )}
                    </div>

                    {/* Label and description */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-semibold text-[15px]",
                            state === "completed" && "text-[var(--success-dark)]",
                            state === "current" && "text-[var(--primary)]",
                            state === "pending" && "text-[var(--text-primary)]"
                          )}
                        >
                          {section.label}
                        </span>
                        {badge !== undefined && (
                          <span className={cn(
                            "sidebar-badge px-2.5 py-0.5 rounded-full text-xs font-semibold",
                            state === "completed" 
                              ? "bg-[var(--success-light)] text-[var(--success-dark)]" 
                              : "bg-[var(--muted)] text-[var(--text-secondary)]"
                          )}>
                            {badge}
                          </span>
                        )}
                        {state === "completed" && !badge && (
                          <span className="sidebar-badge px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--success-light)] text-[var(--success-dark)]">
                            Ready
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 pt-0">
                  <div className="pl-12 text-sm text-[var(--text-secondary)]">
                    {children ? children(section.id) : (
                      <p className="text-[var(--text-secondary)] italic">
                        Click to configure {section.label.toLowerCase()}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>

      {/* Progress footer */}
      <div className="sidebar-progress p-5 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
        <div className="progress-bar h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className="progress-fill h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${(completedSteps.size / NAV_SECTIONS.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--primary), #FB923C)'
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[13px] mt-2.5">
          <span className="text-[var(--text-secondary)] font-medium">
            {Math.round((completedSteps.size / NAV_SECTIONS.length) * 100)}% complete
          </span>
        </div>
      </div>
    </aside>
  );
}

export { NAV_SECTIONS, SectionIcon };
