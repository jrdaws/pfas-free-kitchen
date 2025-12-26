"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { calculateComplexityScore, getFeatureById } from "@/lib/features";
import {
  Folder,
  Layers,
  Plug,
  Clock,
  Gauge,
  FileCode,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface ProjectOverviewBoxProps {
  className?: string;
  compact?: boolean;
}

export function ProjectOverviewBox({
  className,
  compact = false,
}: ProjectOverviewBoxProps) {
  const {
    projectName,
    template,
    outputDir,
    selectedFeatures,
    integrations,
    completedSteps,
    description,
  } = useConfiguratorStore();

  // Calculate feature count
  const featureCount = useMemo(() => {
    return Object.values(selectedFeatures).flat().length;
  }, [selectedFeatures]);

  // Calculate integration count
  const integrationCount = useMemo(() => {
    return Object.values(integrations).filter(Boolean).length;
  }, [integrations]);

  // Calculate complexity
  const complexity = useMemo(() => {
    const allFeatureIds = Object.values(selectedFeatures).flat();
    return calculateComplexityScore(allFeatureIds);
  }, [selectedFeatures]);

  // Get top features for display
  const topFeatures = useMemo(() => {
    const allIds = Object.values(selectedFeatures).flat().slice(0, 3);
    return allIds.map((id) => getFeatureById(id)?.label).filter(Boolean);
  }, [selectedFeatures]);

  // Get active integrations for display
  const activeIntegrations = useMemo(() => {
    return Object.entries(integrations)
      .filter(([_, value]) => value)
      .map(([type, provider]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
      }))
      .slice(0, 3);
  }, [integrations]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    return Math.round((completedSteps.size / 8) * 100);
  }, [completedSteps]);

  // Complexity colors
  const complexityColors = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-rose-100 text-rose-700 border-rose-200",
  };

  if (compact) {
    return (
      <Card className={cn("border-border", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Project Name */}
            <div className="flex items-center gap-2 min-w-0">
              <Folder className="h-4 w-4 text-[#F97316] flex-shrink-0" />
              <span className="font-medium text-foreground truncate">
                {projectName || "Untitled Project"}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {featureCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Layers className="h-3 w-3 mr-1" />
                  {featureCount}
                </Badge>
              )}
              {integrationCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Plug className="h-3 w-3 mr-1" />
                  {integrationCount}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn("text-xs", complexityColors[complexity.level])}
              >
                {complexity.level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#F97316]" />
            Project Overview
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("text-xs", complexityColors[complexity.level])}
          >
            <Gauge className="h-3 w-3 mr-1" />
            {complexity.level} complexity
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F97316]/10">
              <Folder className="h-5 w-5 text-[#F97316]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {projectName || "Untitled Project"}
              </h3>
              <p className="text-xs text-foreground-muted truncate">
                {outputDir || "./my-app"}
              </p>
            </div>
          </div>

          {description && (
            <p className="text-sm text-foreground-secondary line-clamp-2 bg-card p-2 rounded-md">
              {description}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Template */}
          <div className="bg-card rounded-lg p-3 border border-stone-100">
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Template</span>
            </div>
            <p className="font-medium text-foreground capitalize">{template}</p>
          </div>

          {/* Estimated Time */}
          <div className="bg-card rounded-lg p-3 border border-stone-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Est. Setup</span>
            </div>
            <p className="font-medium text-foreground">
              {complexity.estimatedHours > 0
                ? `~${complexity.estimatedHours}h`
                : "Minimal"}
            </p>
          </div>

          {/* Features */}
          <div className="bg-card rounded-lg p-3 border border-stone-100">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Features</span>
            </div>
            <p className="font-medium text-foreground">
              {featureCount} selected
            </p>
          </div>

          {/* Integrations */}
          <div className="bg-card rounded-lg p-3 border border-stone-100">
            <div className="flex items-center gap-2 mb-1">
              <Plug className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Integrations</span>
            </div>
            <p className="font-medium text-foreground">
              {integrationCount} configured
            </p>
          </div>
        </div>

        {/* Features Preview */}
        {topFeatures.length > 0 && (
          <div>
            <h4 className="text-xs text-foreground-muted mb-2">Selected Features</h4>
            <div className="flex flex-wrap gap-1">
              {topFeatures.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="text-xs bg-[#F97316]/5 border-[#F97316]/20 text-[#F97316]"
                >
                  {label}
                </Badge>
              ))}
              {featureCount > 3 && (
                <Badge variant="outline" className="text-xs text-foreground-muted">
                  +{featureCount - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Integrations Preview */}
        {activeIntegrations.length > 0 && (
          <div>
            <h4 className="text-xs text-foreground-muted mb-2">Active Integrations</h4>
            <div className="flex flex-wrap gap-1">
              {activeIntegrations.map(({ type, provider }) => (
                <Badge
                  key={`${type}-${provider}`}
                  variant="outline"
                  className="text-xs"
                >
                  {type}: {provider}
                </Badge>
              ))}
              {integrationCount > 3 && (
                <Badge variant="outline" className="text-xs text-foreground-muted">
                  +{integrationCount - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-foreground-muted">Configuration Progress</span>
            <span className="text-xs font-medium text-[#F97316]">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
              <div
                key={step}
                className="flex flex-col items-center"
                title={`Step ${step}`}
              >
                {completedSteps.has(step as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Circle className="h-3 w-3 text-stone-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectOverviewBox;

