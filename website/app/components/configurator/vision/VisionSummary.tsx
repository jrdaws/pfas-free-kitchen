"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { VisionDocument } from "./types";
import {
  Target,
  Users,
  CreditCard,
  Palette,
  Sparkles,
  Star,
  Link2,
} from "lucide-react";

interface VisionSummaryProps {
  vision: VisionDocument;
  className?: string;
}

export function VisionSummary({ vision, className }: VisionSummaryProps) {
  const isComplete =
    vision.problem.length > 10 &&
    vision.audience.type &&
    vision.businessModel &&
    vision.designStyle;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Vision Summary</h3>
        <Badge
          variant={isComplete ? "default" : "secondary"}
          className={cn(
            isComplete && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          )}
        >
          {isComplete ? "Complete" : "In Progress"}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {/* Problem */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Problem</p>
            <p className="text-sm text-foreground line-clamp-2">
              {vision.problem || "Not defined yet"}
            </p>
          </div>
        </div>

        {/* Audience */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Audience</p>
            <p className="text-sm text-foreground capitalize">
              {vision.audience.type.replace("-", " ")}
              {vision.audience.description && (
                <span className="text-muted-foreground">
                  {" · "}
                  {vision.audience.description.slice(0, 50)}
                  {vision.audience.description.length > 50 && "..."}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Business Model */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <CreditCard className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Business Model</p>
            <p className="text-sm text-foreground capitalize">
              {vision.businessModel.replace("-", " ")}
            </p>
          </div>
        </div>

        {/* Design Style */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <Palette className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Design Style</p>
            <p className="text-sm text-foreground capitalize">
              {vision.designStyle}
            </p>
          </div>
        </div>

        {/* Inspirations */}
        {vision.inspirations.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <Link2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Inspirations</p>
              <p className="text-sm text-foreground">
                {vision.inspirations.length} site{vision.inspirations.length !== 1 && "s"} added
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        {(vision.requiredFeatures.length > 0 || vision.niceToHaveFeatures.length > 0) && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Features</p>
              <div className="flex flex-wrap gap-1">
                {vision.requiredFeatures.slice(0, 3).map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
                {vision.requiredFeatures.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{vision.requiredFeatures.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Processing note */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
        <Star className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground">
          This vision will guide AI generation for all pages and components.
        </p>
      </div>
    </div>
  );
}

export default VisionSummary;

