"use client";

import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileCode, Package, Zap } from "lucide-react";

interface ProjectOverviewBoxProps {
  className?: string;
  /** Show AI analysis details */
  showAnalysis?: boolean;
}

/**
 * ProjectOverviewBox - Summary box showing project details
 * Uses theme colors (navy/orange) for consistency
 */
export function ProjectOverviewBox({
  className,
  showAnalysis = true,
}: ProjectOverviewBoxProps) {
  const {
    projectName,
    description,
    template,
    selectedFeatures,
    researchDomain,
    vision,
    aiProvider,
  } = useConfiguratorStore();

  // Count features by category
  const featureCounts = Object.entries(selectedFeatures).reduce(
    (acc, [category, features]) => {
      if (features.length > 0) {
        acc[category] = features.length;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const totalFeatures = Object.values(selectedFeatures).flat().length;
  const hasContent = projectName || description || researchDomain || vision;

  if (!hasContent) {
    return (
      <div
        className={cn(
          "bg-[var(--sidebar-bg)] border-2 border-dashed border-[var(--primary)]/30 rounded-xl p-6 text-center",
          className
        )}
      >
        <Sparkles className="h-8 w-8 text-[var(--primary)]/40 mx-auto mb-3" />
        <p className="text-sm text-[var(--primary)]/60 font-medium">
          Complete the Research step to see your project overview
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-[var(--sidebar-bg)] border-2 border-[var(--primary)] rounded-xl overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="bg-[var(--primary)]/10 px-4 py-3 border-b border-[var(--primary)]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
            <span className="font-semibold text-[var(--primary)] text-sm">
              Project Overview
            </span>
          </div>
          {aiProvider && (
            <Badge
              variant="outline"
              className="text-[10px] border-[var(--primary)]/30 text-[var(--primary)]"
            >
              <Zap className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Project Name */}
        {projectName && (
          <div>
            <label className="text-xs font-medium text-[var(--sidebar-text-muted)] uppercase tracking-wider">
              Project
            </label>
            <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mt-0.5">
              {projectName}
            </h3>
          </div>
        )}

        {/* Description */}
        {(description || vision) && (
          <div>
            <label className="text-xs font-medium text-[var(--sidebar-text-muted)] uppercase tracking-wider">
              Description
            </label>
            <p className="text-sm text-[var(--sidebar-text-muted)] mt-0.5 leading-relaxed">
              {description || vision}
            </p>
          </div>
        )}

        {/* Domain */}
        {researchDomain && (
          <div>
            <label className="text-xs font-medium text-[var(--sidebar-text-muted)] uppercase tracking-wider">
              Domain
            </label>
            <p className="text-sm text-[var(--sidebar-text)] mt-0.5 font-medium">
              {researchDomain}
            </p>
          </div>
        )}

        {/* Template & Features */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--sidebar-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div>
              <div className="text-xs text-[var(--sidebar-text-muted)]">Template</div>
              <div className="text-sm font-medium text-[var(--sidebar-text)] capitalize">
                {template}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileCode className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-[var(--sidebar-text-muted)]">Features</div>
              <div className="text-sm font-medium text-[var(--sidebar-text)]">
                {totalFeatures} selected
              </div>
            </div>
          </div>
        </div>

        {/* Feature Categories */}
        {showAnalysis && Object.keys(featureCounts).length > 0 && (
          <div className="pt-3 border-t border-[var(--sidebar-border)]">
            <label className="text-xs font-medium text-[var(--sidebar-text-muted)] uppercase tracking-wider mb-2 block">
              Selected Categories
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(featureCounts).map(([category, count]) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-xs capitalize bg-[var(--sidebar-hover)] text-[var(--sidebar-text)]"
                >
                  {category.replace(/-/g, " ")} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectOverviewBox;
