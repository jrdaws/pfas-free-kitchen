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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Github, Database, Rocket, HelpCircle, CreditCard, Mail, BarChart3, Shield, Settings } from "lucide-react";

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
  optional?: boolean;
  tooltip?: string;
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: "template",
    label: "Template",
    description: "Choose your starting template",
    stepNumber: 1,
  },
  {
    id: "research",
    label: "Research",
    description: "Industry & inspiration URLs",
    stepNumber: 2,
    optional: true,
    tooltip: "Describe your project domain (e.g., 'e-commerce', 'SaaS') and add competitor/inspiration websites for AI analysis",
  },
  {
    id: "branding",
    label: "Branding",
    description: "Colors & visual identity",
    stepNumber: 3,
    optional: true,
    tooltip: "Choose a color scheme for your project or enter custom brand colors (hex codes)",
  },
  {
    id: "core-features",
    label: "Core Features",
    description: "Select features & integrations",
    stepNumber: 4,
  },
  {
    id: "integrate-ai",
    label: "Integrate AI",
    description: "Add AI capabilities",
    stepNumber: 5,
    optional: true,
    tooltip: "Connect to OpenAI, Anthropic, or Google AI for intelligent features in your app",
  },
  {
    id: "project-setup",
    label: "Project Setup",
    description: "Name & output directory",
    stepNumber: 6,
  },
  {
    id: "cursor",
    label: "Cursor",
    description: "AI-powered code editor",
    stepNumber: 7,
    tooltip: "Cursor is an AI code editor that helps you write code faster. Free to download.",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Code repository hosting",
    stepNumber: 8,
    tooltip: "GitHub stores your code online and enables collaboration. Create a free account at github.com",
  },
  {
    id: "supabase",
    label: "Supabase",
    description: "Database & authentication",
    stepNumber: 9,
    optional: true,
    tooltip: "Supabase is an open-source backend with PostgreSQL database, authentication, and storage. Free tier available.",
  },
  {
    id: "vercel",
    label: "Vercel",
    description: "Deploy & host your site",
    stepNumber: 10,
    optional: true,
    tooltip: "Vercel hosts your website with automatic deployments from GitHub. Free for personal projects.",
  },
  {
    id: "export",
    label: "Export",
    description: "Generate & download",
    stepNumber: 11,
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
      <aside className={cn("hidden md:flex flex-col w-[340px] min-w-[340px] bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]", className)}>
        <div className="h-14 flex items-center px-6 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_12px_rgba(249,115,22,0.25)]">D</div>
            <span className="font-bold text-white">Loading...</span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[340px] min-w-[340px] bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] h-screen overflow-hidden",
        className
      )}
    >
      {/* Logo/Brand area - Navy Solid with subtle gradient */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--sidebar-border)] shrink-0 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_12px_rgba(249,115,22,0.25)]">D</div>
          <span className="font-bold text-white text-lg">Dawson Does</span>
        </div>
        <span className="text-sm bg-white/10 px-3 py-1.5 rounded-full text-white/80 font-medium">
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
                className="border-b border-[var(--sidebar-border)]"
              >
                <AccordionTrigger
                  onClick={() => handleSectionClick(section)}
                  className={cn(
                    "sidebar-item relative px-4 py-3.5 hover:bg-[var(--sidebar-hover)] hover:no-underline group transition-colors",
                    isActive && "bg-[var(--sidebar-active)]"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--primary)] rounded-r" />
                  )}

                  <div className="flex items-center gap-3.5 flex-1">
                    {/* Status indicator or icon */}
                    <div
                      className={cn(
                        "sidebar-icon flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                        state === "completed" && "bg-[rgba(16,185,129,0.15)] text-emerald-400",
                        state === "current" && "bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)]",
                        state === "pending" && "bg-[var(--sidebar-icon-pending)] text-white/50"
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
                            state === "completed" && "text-emerald-400",
                            state === "current" && "text-[var(--primary)]",
                            state === "pending" && "text-[var(--sidebar-text)]"
                          )}
                        >
                          {section.label}
                        </span>
                        {/* Optional indicator */}
                        {section.optional && state === "pending" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-medium">
                            Optional
                          </span>
                        )}
                        {badge !== undefined && (
                          <span className={cn(
                            "sidebar-badge px-2.5 py-0.5 rounded-lg text-xs font-semibold",
                            state === "completed" 
                              ? "bg-[rgba(16,185,129,0.15)] text-emerald-400" 
                              : state === "current"
                              ? "bg-[var(--primary)] text-white"
                              : "bg-white/10 text-white/70"
                          )}>
                            {badge}
                          </span>
                        )}
                        {state === "completed" && !badge && (
                          <span className="sidebar-badge px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[rgba(16,185,129,0.15)] text-emerald-400">
                            Ready
                          </span>
                        )}
                        {/* Tooltip for technical terms */}
                        {section.tooltip && (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <HelpCircle className="h-3.5 w-3.5 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[200px] text-xs bg-slate-800 border-slate-600">
                                {section.tooltip}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="text-xs text-[var(--sidebar-text-muted)] mt-0.5">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-3 pb-4 pt-2">
                  <div className="text-sm text-[var(--sidebar-text-muted)] bg-black/20 rounded-xl p-4 border border-[var(--sidebar-border)]">
                    {children ? children(section.id) : (
                      <p className="text-[var(--sidebar-text-muted)] italic">
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

      {/* Connected Services Status */}
      <div className="px-5 py-3 border-t border-[var(--sidebar-border)] bg-black/5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--sidebar-text-muted)] font-medium">Services</span>
          <div className="flex items-center gap-1.5">
            {/* GitHub indicator - step 8 */}
            <div 
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center transition-colors",
                completedSteps.has(8) 
                  ? "bg-emerald-500/20" 
                  : "bg-white/10"
              )}
              title={completedSteps.has(8) ? "GitHub: Connected" : "GitHub: Not connected"}
            >
              <Github className={cn(
                "h-3 w-3",
                completedSteps.has(8) ? "text-emerald-400" : "text-white/40"
              )} />
            </div>
            {/* Supabase indicator - step 9 */}
            <div 
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center transition-colors",
                completedSteps.has(9) 
                  ? "bg-emerald-500/20" 
                  : "bg-white/10"
              )}
              title={completedSteps.has(9) ? "Supabase: Connected" : "Supabase: Not connected"}
            >
              <Database className={cn(
                "h-3 w-3",
                completedSteps.has(9) ? "text-emerald-400" : "text-white/40"
              )} />
            </div>
            {/* Vercel indicator - step 10 */}
            <div 
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center transition-colors",
                completedSteps.has(10) 
                  ? "bg-emerald-500/20" 
                  : "bg-white/10"
              )}
              title={completedSteps.has(10) ? "Vercel: Connected" : "Vercel: Not connected"}
            >
              <Rocket className={cn(
                "h-3 w-3",
                completedSteps.has(10) ? "text-emerald-400" : "text-white/40"
              )} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress footer - Navy Solid */}
      <div className="sidebar-progress p-5 border-t border-[var(--sidebar-border)] bg-black/10 shrink-0">
        <div className="progress-bar h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="progress-fill h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${(completedSteps.size / NAV_SECTIONS.length) * 100}%`,
              background: 'var(--primary)'
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[13px] mt-2.5">
          <span className="text-[var(--primary)] font-semibold">
            {Math.round((completedSteps.size / NAV_SECTIONS.length) * 100)}% complete
          </span>
          <span className="text-[var(--sidebar-text-muted)]">
            {completedSteps.size} of {NAV_SECTIONS.length}
          </span>
        </div>
      </div>
    </aside>
  );
}

export { NAV_SECTIONS, SectionIcon };
