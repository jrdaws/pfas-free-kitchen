"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_CATEGORIES, getFeaturesByCategory, type FeatureCategory } from "@/lib/features";

interface CoreFeaturesSectionProps {
  selectedFeatures: Record<string, string[]>;
  onToggleFeature: (category: string, featureId: string) => void;
  onClearCategory?: (category: string) => void;
}

export function CoreFeaturesSection({
  selectedFeatures,
  onToggleFeature,
  onClearCategory,
}: CoreFeaturesSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const getCategoryCount = (categoryId: string) => {
    return selectedFeatures[categoryId]?.length || 0;
  };

  const getTotalSelected = () => {
    return Object.values(selectedFeatures).flat().length;
  };

  return (
    <div className="space-y-2">
      {/* Summary - Compact */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">
          {getTotalSelected()} selected
        </span>
        {getTotalSelected() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-[10px] px-1.5 text-white/40 hover:text-white"
            onClick={() => Object.keys(selectedFeatures).forEach(cat => onClearCategory?.(cat))}
          >
            <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Feature Categories - Compact */}
      <Accordion
        type="multiple"
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="space-y-1"
      >
        {FEATURE_CATEGORIES.map((category) => {
          const features = getFeaturesByCategory(category.id);
          const count = getCategoryCount(category.id);
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border border-white/10 rounded-md overflow-hidden bg-black/20"
            >
              <AccordionTrigger className="px-2 py-1.5 hover:bg-white/5 hover:no-underline">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="font-medium text-xs text-white/90">
                    {category.label}
                  </span>
                  {count > 0 && (
                    <span className="bg-[var(--primary)] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      {count}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-white/40 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2 pt-0.5">
                <div className="space-y-1">
                  {features.map((feature) => {
                    const isSelected = selectedFeatures[category.id]?.includes(feature.id);

                    return (
                      <div
                        key={feature.id}
                        className={cn(
                          "flex items-start gap-1.5 p-1.5 rounded cursor-pointer transition-colors",
                          isSelected ? "bg-[var(--primary)]/15" : "hover:bg-white/5"
                        )}
                        onClick={() => onToggleFeature(category.id, feature.id)}
                      >
                        <Checkbox
                          id={feature.id}
                          checked={isSelected}
                          onCheckedChange={() => onToggleFeature(category.id, feature.id)}
                          className="mt-0.5 h-3 w-3"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={feature.id}
                            className={cn(
                              "text-[11px] cursor-pointer leading-tight block truncate",
                              isSelected ? "text-[var(--primary)] font-medium" : "text-white/80"
                            )}
                          >
                            {feature.label}
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

