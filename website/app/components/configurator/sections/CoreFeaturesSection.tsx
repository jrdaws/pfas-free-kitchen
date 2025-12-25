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
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-600">
          {getTotalSelected()} features selected
        </span>
        {getTotalSelected() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-stone-500 hover:text-stone-700"
            onClick={() => Object.keys(selectedFeatures).forEach(cat => onClearCategory?.(cat))}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Feature Categories */}
      <Accordion
        type="multiple"
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="space-y-2"
      >
        {FEATURE_CATEGORIES.map((category) => {
          const features = getFeaturesByCategory(category.id);
          const count = getCategoryCount(category.id);
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50"
            >
              <AccordionTrigger className="px-3 py-2.5 hover:bg-stone-50 hover:no-underline">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-sm text-stone-700">
                    {category.label}
                  </span>
                  {count > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {count}
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-stone-400 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-1">
                <div className="space-y-2">
                  {features.map((feature) => {
                    const isSelected = selectedFeatures[category.id]?.includes(feature.id);

                    return (
                      <div
                        key={feature.id}
                        className={cn(
                          "flex items-start gap-2.5 p-2 rounded-md cursor-pointer transition-colors",
                          isSelected ? "bg-[#F97316]/5" : "hover:bg-stone-50"
                        )}
                        onClick={() => onToggleFeature(category.id, feature.id)}
                      >
                        <Checkbox
                          id={feature.id}
                          checked={isSelected}
                          onCheckedChange={() => onToggleFeature(category.id, feature.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={feature.id}
                            className={cn(
                              "text-sm cursor-pointer",
                              isSelected ? "text-[#F97316] font-medium" : "text-stone-700"
                            )}
                          >
                            {feature.label}
                          </Label>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {count > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-stone-500 hover:text-stone-700 w-full justify-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearCategory?.(category.id);
                      }}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear selection
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

