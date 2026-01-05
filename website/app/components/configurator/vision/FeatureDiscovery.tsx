"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FEATURE_SUGGESTIONS } from "./types";
import { Sparkles, Check } from "lucide-react";

interface FeatureDiscoveryProps {
  template?: string;
  requiredFeatures: string[];
  niceToHaveFeatures: string[];
  onRequiredChange: (features: string[]) => void;
  onNiceToHaveChange: (features: string[]) => void;
  className?: string;
}

export function FeatureDiscovery({
  template,
  requiredFeatures,
  niceToHaveFeatures,
  onRequiredChange,
  onNiceToHaveChange,
  className,
}: FeatureDiscoveryProps) {
  const suggestions = FEATURE_SUGGESTIONS[template || "default"] || FEATURE_SUGGESTIONS.default;

  const toggleRequired = (feature: string) => {
    if (requiredFeatures.includes(feature)) {
      onRequiredChange(requiredFeatures.filter((f) => f !== feature));
    } else {
      onRequiredChange([...requiredFeatures, feature]);
      // Remove from nice-to-have if it's there
      if (niceToHaveFeatures.includes(feature)) {
        onNiceToHaveChange(niceToHaveFeatures.filter((f) => f !== feature));
      }
    }
  };

  const toggleNiceToHave = (feature: string) => {
    if (niceToHaveFeatures.includes(feature)) {
      onNiceToHaveChange(niceToHaveFeatures.filter((f) => f !== feature));
    } else {
      onNiceToHaveChange([...niceToHaveFeatures, feature]);
      // Remove from required if it's there
      if (requiredFeatures.includes(feature)) {
        onRequiredChange(requiredFeatures.filter((f) => f !== feature));
      }
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Question */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          What features do you need?
        </h3>
        <p className="text-sm text-muted-foreground">
          Select must-have features and nice-to-haves. We'll prioritize accordingly.
        </p>
      </div>

      {/* AI Suggestion Banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          Based on your {template || "project"} template, we've pre-selected common features.
          Customize as needed!
        </p>
      </div>

      {/* Required Features */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <Label className="font-medium">Must-Have Features</Label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.required.map((feature) => {
            const isSelected = requiredFeatures.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleRequired(feature)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                <span className="text-sm">{feature}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nice-to-Have Features */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <Label className="font-medium">Nice-to-Have Features</Label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.optional.map((feature) => {
            const isSelected = niceToHaveFeatures.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleNiceToHave(feature)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  isSelected
                    ? "border-amber-500 bg-amber-500/5"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                <span className="text-sm">{feature}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{requiredFeatures.length}</span> required
        </span>
        <span>
          <span className="font-medium text-foreground">{niceToHaveFeatures.length}</span> nice-to-have
        </span>
      </div>
    </div>
  );
}

export default FeatureDiscovery;

