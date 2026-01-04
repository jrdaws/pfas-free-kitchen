"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Check, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Zap, 
  Database, 
  Rocket, 
  Github,
  Sparkles,
  Package,
  FileCode,
  Settings
} from "lucide-react";

interface ProjectStatusCardProps {
  className?: string;
  /** Show expanded details by default */
  defaultExpanded?: boolean;
  /** Show AI analysis and feature categories */
  showAnalysis?: boolean;
}

/**
 * ProjectStatusCard - Consolidated right panel showing:
 * - Project name + template + AI badge (header)
 * - NPX command with copy
 * - Progress bar (X/23 steps)
 * - Stats grid (Features, Services, Tools)
 * - Service status (GitHub, Supabase, Vercel)
 * - Description/Domain (collapsible)
 * - Action buttons (View Docs, Generate)
 * 
 * Replaces both PreviewCard and ProjectOverviewBox
 */
export function ProjectStatusCard({
  className,
  defaultExpanded = true,
  showAnalysis = true,
}: ProjectStatusCardProps) {
  const {
    template,
    projectName,
    description,
    vision,
    researchDomain,
    integrations,
    selectedFeatures,
    completedSteps,
    toolStatus,
    aiProvider,
  } = useConfiguratorStore();

  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDetails, setShowDetails] = useState(false);

  // Generate project token
  const projectToken = useMemo(() => {
    const hash = Math.random().toString(36).substring(2, 10);
    return `${projectName?.toLowerCase().replace(/\s+/g, "-") || "project"}-${hash}`;
  }, [projectName]);

  // Generate NPX command
  const npxCommand = useMemo(() => {
    return `npx @jrdaws/framework clone ${projectToken}`;
  }, [projectToken]);

  // Counts
  const featureCount = Object.values(selectedFeatures).flat().length;
  const integrationCount = Object.values(integrations).filter(Boolean).length;
  const completedCount = completedSteps.size;
  const totalSteps = 23;
  const toolsConnected = Object.values(toolStatus).filter(Boolean).length;
  const totalTools = Object.keys(toolStatus).length;

  // Service status
  const services = {
    github: toolStatus.github || completedSteps.has(20),
    supabase: toolStatus.supabase || completedSteps.has(21),
    vercel: toolStatus.vercel || completedSteps.has(22),
  };

  // Ready state
  const isReady = completedCount >= 3;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  // Copy command
  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(npxCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = npxCommand;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Feature categories
  const featureCategories = Object.entries(selectedFeatures).filter(
    ([_, features]) => features.length > 0
  );

  // Display description (prefer description, fall back to vision)
  const displayDescription = description || vision;

  return (
    <div
      className={cn(
        "bg-[var(--sidebar-bg)] rounded-xl overflow-hidden shadow-lg border border-[var(--sidebar-border)]",
        className
      )}
    >
      {/* Header - Project Info */}
      <div className="flex items-center gap-3 px-4 py-3 bg-black/20 border-b border-[var(--sidebar-border)]">
        {/* Project Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">
            {projectName?.charAt(0)?.toUpperCase() || "P"}
          </span>
        </div>
        
        {/* Project Name & Template */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--sidebar-text)] truncate">
            {projectName || "New Project"}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[var(--sidebar-text-muted)]">
            <Package className="h-3 w-3" />
            <span className="capitalize">{template} Template</span>
          </div>
        </div>

        {/* AI Badge */}
        {aiProvider && (
          <Badge
            variant="outline"
            className="text-[10px] border-[var(--primary)]/30 text-[var(--primary)] bg-[var(--primary)]/10 shrink-0"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI
          </Badge>
        )}

        {/* Status Badge */}
        <Badge
          className={cn(
            "text-[10px] font-medium shrink-0",
            isReady
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30"
          )}
          variant="outline"
        >
          <span className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5",
            isReady ? "bg-emerald-400" : "bg-[var(--primary)]"
          )} />
          {isReady ? "Ready" : "Setup"}
        </Badge>
      </div>

      {/* NPX Command */}
      <div className="px-4 py-3 border-b border-[var(--sidebar-border)]">
        <div className="bg-black/30 rounded-lg px-3 py-2.5 flex items-center gap-2 border border-[var(--sidebar-border)]">
          <Terminal className="h-4 w-4 text-[var(--sidebar-text-muted)] shrink-0" />
          <code className="flex-1 text-[var(--primary)] text-sm font-mono truncate">
            {npxCommand}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyCommand}
            className="h-7 w-7 p-0 text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-white/10"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-3 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[var(--primary)] font-semibold">
            {progressPercent}% complete
          </span>
          <span className="text-[var(--sidebar-text-muted)]">
            {completedCount} of {totalSteps}
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--primary-hover))'
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-3 border-b border-[var(--sidebar-border)]">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/20 rounded-lg p-2.5 text-center border border-[var(--sidebar-border)]">
            <div className="text-lg font-bold text-[var(--primary)]">
              {featureCount}
            </div>
            <div className="text-[10px] text-[var(--sidebar-text-muted)] uppercase">
              Features
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-2.5 text-center border border-[var(--sidebar-border)]">
            <div className="text-lg font-bold text-[var(--primary)]">
              {integrationCount}
            </div>
            <div className="text-[10px] text-[var(--sidebar-text-muted)] uppercase">
              Services
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-2.5 text-center border border-[var(--sidebar-border)]">
            <div className="text-lg font-bold text-[var(--primary)]">
              {toolsConnected}/{totalTools}
            </div>
            <div className="text-[10px] text-[var(--sidebar-text-muted)] uppercase">
              Tools
            </div>
          </div>
        </div>
      </div>

      {/* Services Row */}
      <div className="px-4 py-3 border-b border-[var(--sidebar-border)]">
        <div className="grid grid-cols-3 gap-2">
          <ServiceIndicator
            name="GitHub"
            icon={<Github className="h-4 w-4" />}
            connected={services.github}
          />
          <ServiceIndicator
            name="Supabase"
            icon={<Database className="h-4 w-4" />}
            connected={services.supabase}
          />
          <ServiceIndicator
            name="Vercel"
            icon={<Rocket className="h-4 w-4" />}
            connected={services.vercel}
          />
        </div>
      </div>

      {/* Expandable Details */}
      {(displayDescription || researchDomain || featureCategories.length > 0) && (
        <div className="border-b border-[var(--sidebar-border)]">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Project Details
            </span>
            {showDetails ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          
          {showDetails && (
            <div className="px-4 pb-3 space-y-3">
              {/* Description */}
              {displayDescription && (
                <div>
                  <label className="text-[10px] font-medium text-[var(--sidebar-text-muted)] uppercase tracking-wider">
                    Description
                  </label>
                  <p className="text-xs text-[var(--sidebar-text)] mt-0.5 leading-relaxed line-clamp-3">
                    {displayDescription}
                  </p>
                </div>
              )}

              {/* Domain */}
              {researchDomain && (
                <div>
                  <label className="text-[10px] font-medium text-[var(--sidebar-text-muted)] uppercase tracking-wider">
                    Domain
                  </label>
                  <p className="text-xs text-[var(--sidebar-text)] mt-0.5 font-medium">
                    {researchDomain}
                  </p>
                </div>
              )}

              {/* Feature Categories */}
              {showAnalysis && featureCategories.length > 0 && (
                <div>
                  <label className="text-[10px] font-medium text-[var(--sidebar-text-muted)] uppercase tracking-wider mb-1.5 block">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {featureCategories.slice(0, 6).map(([category, features]) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-[10px] capitalize bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] py-0"
                      >
                        {category.replace(/-/g, " ")} ({features.length})
                      </Badge>
                    ))}
                    {featureCategories.length > 6 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] py-0"
                      >
                        +{featureCategories.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-transparent text-[var(--sidebar-text)] hover:bg-white/10 border-[var(--sidebar-border)] text-xs"
          >
            View Docs
          </Button>
          <Button
            size="sm"
            className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-xs"
            disabled={!isReady}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}

function ServiceIndicator({
  name,
  icon,
  connected,
}: {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-xs transition-colors border",
        connected 
          ? "bg-emerald-500/10 border-emerald-500/20" 
          : "bg-black/20 border-[var(--sidebar-border)]"
      )}
    >
      <div
        className={cn(
          "transition-colors",
          connected ? "text-emerald-400" : "text-[var(--sidebar-text-muted)]"
        )}
      >
        {icon}
      </div>
      <span className={cn(
        "font-medium",
        connected ? "text-emerald-300" : "text-[var(--sidebar-text-muted)]"
      )}>
        {name}
      </span>
    </div>
  );
}

export default ProjectStatusCard;

