"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/lib/configurator-state";
import {
  FEATURE_CATEGORIES,
  FEATURES,
  getFeaturesByCategory,
  getFeatureById,
  canSelectFeature,
  getUnmetDependencies,
  calculateComplexityScore,
  recommendFeatures,
  type Feature,
  type FeatureCategory,
} from "@/lib/features";
import {
  Users,
  Database,
  Search,
  ShoppingCart,
  BarChart3,
  Check,
  Lock,
  Lightbulb,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  users: <Users className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  search: <Search className="h-5 w-5" />,
  "shopping-cart": <ShoppingCart className="h-5 w-5" />,
  "bar-chart": <BarChart3 className="h-5 w-5" />,
};

// Complexity badge colors
const COMPLEXITY_COLORS: Record<string, string> = {
  simple: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  complex: "bg-rose-100 text-rose-700 border-rose-200",
};

interface FeatureCheckboxProps {
  feature: Feature;
  isSelected: boolean;
  canSelect: boolean;
  unmetDeps: string[];
  onToggle: () => void;
}

function FeatureCheckbox({
  feature,
  isSelected,
  canSelect,
  unmetDeps,
  onToggle,
}: FeatureCheckboxProps) {
  const hasUnmetDeps = unmetDeps.length > 0;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => canSelect && onToggle()}
            className={cn(
              "relative flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
              isSelected && "bg-[#F97316]/5 border-[#F97316]",
              !isSelected && canSelect && "hover:bg-stone-50 border-stone-200",
              !canSelect && "opacity-50 cursor-not-allowed bg-stone-50 border-stone-200"
            )}
          >
            {/* Checkbox */}
            <div
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors",
                isSelected && "bg-[#F97316] border-[#F97316]",
                !isSelected && canSelect && "border-stone-300",
                !canSelect && "border-stone-200 bg-stone-100"
              )}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
              {!canSelect && hasUnmetDeps && <Lock className="h-3 w-3 text-stone-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "font-medium text-sm",
                    isSelected && "text-[#F97316]",
                    !isSelected && "text-stone-700"
                  )}
                >
                  {feature.label}
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-xs", COMPLEXITY_COLORS[feature.complexity])}
                >
                  {feature.complexity}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 mt-1">{feature.description}</p>
              
              {/* Dependencies warning */}
              {hasUnmetDeps && (
                <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>
                    Requires: {unmetDeps.map((d) => getFeatureById(d)?.label).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        {!canSelect && hasUnmetDeps && (
          <TooltipContent>
            <p>Enable required features first: {unmetDeps.map((d) => getFeatureById(d)?.label).join(", ")}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

interface CoreFeaturesSelectorProps {
  className?: string;
}

export function CoreFeaturesSelector({ className }: CoreFeaturesSelectorProps) {
  const { selectedFeatures, toggleFeature, clearFeatures, description } =
    useConfiguratorStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "user-management",
  ]);

  // Get all selected feature IDs as flat array
  const allSelectedIds = useMemo(() => {
    return Object.values(selectedFeatures).flat();
  }, [selectedFeatures]);

  // Get recommended features based on project description
  const recommended = useMemo(() => {
    return recommendFeatures(description);
  }, [description]);

  // Calculate complexity
  const complexity = useMemo(() => {
    return calculateComplexityScore(allSelectedIds);
  }, [allSelectedIds]);

  // Handle feature toggle with dependency auto-selection
  const handleToggle = (category: FeatureCategory, featureId: string) => {
    const feature = getFeatureById(featureId);
    if (!feature) return;

    // Check if we're selecting (not deselecting)
    const currentCategoryFeatures = selectedFeatures[category] || [];
    const isCurrentlySelected = currentCategoryFeatures.includes(featureId);

    if (!isCurrentlySelected) {
      // Auto-select dependencies if needed
      const unmetDeps = getUnmetDependencies(featureId, allSelectedIds);
      unmetDeps.forEach((depId) => {
        const depFeature = getFeatureById(depId);
        if (depFeature) {
          toggleFeature(depFeature.category, depId);
        }
      });
    }

    toggleFeature(category, featureId);
  };

  // Apply AI recommendations
  const applyRecommendations = () => {
    recommended.forEach((featureId) => {
      const feature = getFeatureById(featureId);
      if (feature && !allSelectedIds.includes(featureId)) {
        // Check dependencies first
        const unmetDeps = getUnmetDependencies(featureId, allSelectedIds);
        unmetDeps.forEach((depId) => {
          const depFeature = getFeatureById(depId);
          if (depFeature && !allSelectedIds.includes(depId)) {
            toggleFeature(depFeature.category, depId);
          }
        });
        toggleFeature(feature.category, featureId);
      }
    });
  };

  return (
    <Card className={cn("border-stone-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-stone-900">
            Core Features
          </CardTitle>
          <div className="flex items-center gap-2">
            {allSelectedIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFeatures}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-stone-500">
          Select the features your project needs. Dependencies will be
          auto-selected.
        </p>

        {/* AI Recommendations */}
        {recommended.length > 0 && description && (
          <div className="mt-3 p-3 bg-[#F97316]/5 rounded-lg border border-[#F97316]/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#F97316]" />
              <span className="text-sm font-medium text-[#F97316]">
                AI Recommendations
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-2">
              Based on your project description, we recommend:
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {recommended.map((id) => {
                const feature = getFeatureById(id);
                return feature ? (
                  <Badge
                    key={id}
                    variant="outline"
                    className="text-xs bg-stone-50 border-[#F97316]/30 text-[#F97316]"
                  >
                    {feature.label}
                  </Badge>
                ) : null;
              })}
            </div>
            <Button
              size="sm"
              onClick={applyRecommendations}
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white text-xs"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Apply recommendations
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Complexity Summary */}
        {allSelectedIds.length > 0 && (
          <div className="mb-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700">
                {allSelectedIds.length} feature{allSelectedIds.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    complexity.level === "low" && "bg-emerald-100 text-emerald-700 border-emerald-200",
                    complexity.level === "medium" && "bg-amber-100 text-amber-700 border-amber-200",
                    complexity.level === "high" && "bg-rose-100 text-rose-700 border-rose-200"
                  )}
                >
                  {complexity.level} complexity
                </Badge>
                <span className="text-xs text-stone-500">
                  ~{complexity.estimatedHours}h setup
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category Accordions */}
        <Accordion
          type="multiple"
          value={expandedCategories}
          onValueChange={setExpandedCategories}
          className="space-y-2"
        >
          {FEATURE_CATEGORIES.map((category) => {
            const features = getFeaturesByCategory(category.id);
            const selectedInCategory = (selectedFeatures[category.id] || []).length;

            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="border border-stone-200 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-stone-50 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100 text-stone-600">
                      {CATEGORY_ICONS[category.icon] || <Database className="h-5 w-5" />}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-800">
                          {category.label}
                        </span>
                        {selectedInCategory > 0 && (
                          <Badge className="bg-[#F97316] text-white text-xs">
                            {selectedInCategory}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">{category.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="grid gap-2">
                    {features.map((feature) => {
                      const isSelected = (selectedFeatures[category.id] || []).includes(
                        feature.id
                      );
                      const canSelect = canSelectFeature(feature.id, allSelectedIds) || isSelected;
                      const unmetDeps = isSelected
                        ? []
                        : getUnmetDependencies(feature.id, allSelectedIds);

                      return (
                        <FeatureCheckbox
                          key={feature.id}
                          feature={feature}
                          isSelected={isSelected}
                          canSelect={canSelect}
                          unmetDeps={unmetDeps}
                          onToggle={() => handleToggle(category.id, feature.id)}
                        />
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default CoreFeaturesSelector;

