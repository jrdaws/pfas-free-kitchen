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
import { Check, Github, Database, Rocket, HelpCircle, CreditCard, Mail, BarChart3, Shield, Settings, HardDrive, Search, FileText, Bug, Image as ImageIcon, Zap, Bell, Flag } from "lucide-react";

// Custom SVG icon component
interface SectionIconProps {
  sectionId: string;
  className?: string;
}

function SectionIcon({ sectionId, className }: SectionIconProps) {
  // Map section IDs to custom SVG icons
  const customIconSections = ["research", "core-features", "integrate-ai", "cursor"];
  
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
        className={cn(className)}
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
    case "payments":
      return <CreditCard className={cn("h-5 w-5", className)} />;
    case "email":
      return <Mail className={cn("h-5 w-5", className)} />;
    case "analytics":
      return <BarChart3 className={cn("h-5 w-5", className)} />;
    case "auth-provider":
      return <Shield className={cn("h-5 w-5", className)} />;
    case "storage":
      return <HardDrive className={cn("h-5 w-5", className)} />;
    case "search":
      return <Search className={cn("h-5 w-5", className)} />;
    case "cms":
      return <FileText className={cn("h-5 w-5", className)} />;
    case "monitoring":
      return <Bug className={cn("h-5 w-5", className)} />;
    case "image-opt":
      return <ImageIcon className={cn("h-5 w-5", className)} />;
    case "background-jobs":
      return <Zap className={cn("h-5 w-5", className)} />;
    case "notifications":
      return <Bell className={cn("h-5 w-5", className)} />;
    case "feature-flags":
      return <Flag className={cn("h-5 w-5", className)} />;
    case "project-setup":
      return <Settings className={cn("h-5 w-5", className)} />;
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
  // Setup Phase (1-4)
  { id: "template", label: "Template", description: "Choose template", stepNumber: 1 },
  { id: "research", label: "Research", description: "Domain & inspiration", stepNumber: 2, optional: true, tooltip: "Describe your project domain and add inspiration URLs" },
  { id: "branding", label: "Branding", description: "Colors & identity", stepNumber: 3, optional: true, tooltip: "Choose a color scheme or enter custom brand colors" },
  { id: "core-features", label: "Integrations", description: "Pick features", stepNumber: 4 },
  // Configure Phase (5-18)
  { id: "integrate-ai", label: "AI", description: "AI provider", stepNumber: 5, optional: true, tooltip: "Connect OpenAI, Anthropic, or Google AI" },
  { id: "payments", label: "Payments", description: "Payment provider", stepNumber: 6, optional: true, tooltip: "Stripe, Paddle, or LemonSqueezy" },
  { id: "email", label: "Email", description: "Email service", stepNumber: 7, optional: true, tooltip: "Resend, SendGrid, or Postmark" },
  { id: "analytics", label: "Analytics", description: "User analytics", stepNumber: 8, optional: true, tooltip: "PostHog, Plausible, or GA" },
  { id: "auth-provider", label: "Auth", description: "Authentication", stepNumber: 9, optional: true, tooltip: "Clerk, Auth0, or NextAuth" },
  { id: "storage", label: "Storage", description: "File storage", stepNumber: 10, optional: true, tooltip: "UploadThing, R2, or S3" },
  { id: "search", label: "Search", description: "Search engine", stepNumber: 11, optional: true, tooltip: "Algolia, Meilisearch, or Typesense" },
  { id: "cms", label: "CMS", description: "Content management", stepNumber: 12, optional: true, tooltip: "Sanity, Contentful, or Payload" },
  { id: "monitoring", label: "Monitoring", description: "Error tracking", stepNumber: 13, optional: true, tooltip: "Sentry, LogRocket, or Highlight" },
  { id: "image-opt", label: "Images", description: "Image optimization", stepNumber: 14, optional: true, tooltip: "Cloudinary, ImageKit, or Vercel" },
  { id: "background-jobs", label: "Jobs", description: "Background jobs", stepNumber: 15, optional: true, tooltip: "Inngest, Trigger.dev, or QStash" },
  { id: "notifications", label: "Notifications", description: "Push/in-app", stepNumber: 16, optional: true, tooltip: "Novu, OneSignal, or Knock" },
  { id: "feature-flags", label: "Flags", description: "Feature flags", stepNumber: 17, optional: true, tooltip: "PostHog, LaunchDarkly, or Flagsmith" },
  { id: "project-setup", label: "Project", description: "Name & output", stepNumber: 18 },
  // Launch Phase (19-23)
  { id: "cursor", label: "Cursor", description: "AI code editor", stepNumber: 19, tooltip: "AI code editor - free to download" },
  { id: "github", label: "GitHub", description: "Code repository", stepNumber: 20, tooltip: "Store code and collaborate" },
  { id: "supabase", label: "Supabase", description: "Database", stepNumber: 21, optional: true, tooltip: "PostgreSQL, auth, and storage" },
  { id: "vercel", label: "Vercel", description: "Deploy & host", stepNumber: 22, optional: true, tooltip: "Auto deployments from GitHub" },
  { id: "export", label: "Export", description: "Generate", stepNumber: 23 },
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
      <aside className={cn("hidden md:flex flex-col w-[380px] min-w-[380px] bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]", className)}>
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
        "hidden md:flex flex-col w-[380px] min-w-[380px] bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] h-screen overflow-hidden",
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
            {/* GitHub indicator - step 20 */}
            <div 
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center transition-colors",
                completedSteps.has(20) 
                  ? "bg-emerald-500/20" 
                  : "bg-white/10"
              )}
              title={completedSteps.has(20) ? "GitHub: Connected" : "GitHub: Not connected"}
            >
              <Github className={cn(
                "h-3 w-3",
                completedSteps.has(20) ? "text-emerald-400" : "text-white/40"
              )} />
            </div>
            {/* Supabase indicator - step 21 */}
            <div 
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center transition-colors",
                completedSteps.has(21) 
                  ? "bg-emerald-500/20" 
                  : "bg-white/10"
              )}
              title={completedSteps.has(21) ? "Supabase: Connected" : "Supabase: Not connected"}
            >
              <Database className={cn(
                "h-3 w-3",
                completedSteps.has(21) ? "text-emerald-400" : "text-white/40"
              )} />
            </div>
            {/* Vercel indicator - step 22 */}
            <div 
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center transition-colors",
                completedSteps.has(22) 
                  ? "bg-emerald-500/20" 
                  : "bg-white/10"
              )}
              title={completedSteps.has(22) ? "Vercel: Connected" : "Vercel: Not connected"}
            >
              <Rocket className={cn(
                "h-3 w-3",
                completedSteps.has(22) ? "text-emerald-400" : "text-white/40"
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
