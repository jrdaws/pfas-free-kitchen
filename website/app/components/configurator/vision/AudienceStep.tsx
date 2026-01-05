"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AUDIENCE_OPTIONS, AudienceType } from "./types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AudienceStepProps {
  type: AudienceType;
  description?: string;
  onTypeChange: (type: AudienceType) => void;
  onDescriptionChange: (description: string) => void;
  className?: string;
}

export function AudienceStep({
  type,
  description = "",
  onTypeChange,
  onDescriptionChange,
  className,
}: AudienceStepProps) {
  const [showDetails, setShowDetails] = useState(!!description);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Question */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Who are your users?
        </h3>
        <p className="text-sm text-muted-foreground">
          Understanding your audience helps us tailor the experience.
        </p>
      </div>

      {/* Audience Type Grid */}
      <div className="grid grid-cols-2 gap-3">
        {AUDIENCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onTypeChange(option.value)}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
              type === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <span className="text-2xl">{option.icon}</span>
            <div>
              <p className="font-medium text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Optional Details */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {showDetails ? "Hide details" : "Add more details (optional)"}
        </button>

        {showDetails && (
          <div className="mt-3 space-y-2">
            <Label htmlFor="audience-details" className="text-sm">
              Describe your ideal user
            </Label>
            <Textarea
              id="audience-details"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="e.g., Small business owners aged 30-50 who are frustrated with manual inventory tracking..."
              rows={3}
              className="resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AudienceStep;

