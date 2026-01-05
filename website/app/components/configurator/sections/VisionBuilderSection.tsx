"use client";

import { useState, useCallback, useEffect } from "react";
import { VisionBuilder, VisionDocument, DEFAULT_VISION } from "../vision";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisionSummary } from "../vision/VisionSummary";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Edit2,
} from "lucide-react";

interface VisionBuilderSectionProps {
  className?: string;
}

/**
 * Convert VisionDocument to a formatted string for storage
 */
function visionToString(vision: VisionDocument): string {
  const parts: string[] = [];

  if (vision.problem) {
    parts.push(`Problem: ${vision.problem}`);
  }

  parts.push(`Audience: ${vision.audience.type}`);
  if (vision.audience.description) {
    parts.push(`Audience Details: ${vision.audience.description}`);
  }

  parts.push(`Business Model: ${vision.businessModel}`);
  parts.push(`Design Style: ${vision.designStyle}`);

  if (vision.inspirations.length > 0) {
    parts.push(`Inspirations: ${vision.inspirations.join(", ")}`);
  }

  if (vision.requiredFeatures.length > 0) {
    parts.push(`Required Features: ${vision.requiredFeatures.join(", ")}`);
  }

  if (vision.niceToHaveFeatures.length > 0) {
    parts.push(`Nice-to-Have Features: ${vision.niceToHaveFeatures.join(", ")}`);
  }

  return parts.join("\n");
}

/**
 * Try to parse a vision string back into VisionDocument (best effort)
 */
function stringToVision(str: string): Partial<VisionDocument> {
  const vision: Partial<VisionDocument> = {};

  const problemMatch = str.match(/Problem:\s*(.+?)(?:\n|$)/);
  if (problemMatch) {
    vision.problem = problemMatch[1].trim();
  }

  const audienceMatch = str.match(/Audience:\s*(\w+)/);
  if (audienceMatch) {
    vision.audience = {
      type: audienceMatch[1] as VisionDocument["audience"]["type"],
    };
  }

  const businessMatch = str.match(/Business Model:\s*(.+?)(?:\n|$)/);
  if (businessMatch) {
    vision.businessModel = businessMatch[1].trim() as VisionDocument["businessModel"];
  }

  const designMatch = str.match(/Design Style:\s*(.+?)(?:\n|$)/);
  if (designMatch) {
    vision.designStyle = designMatch[1].trim() as VisionDocument["designStyle"];
  }

  return vision;
}

export function VisionBuilderSection({ className }: VisionBuilderSectionProps) {
  const {
    template,
    vision: storedVision,
    setVision,
    inspirationUrls,
    setInspirationUrls,
  } = useConfiguratorStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(!storedVision);
  const [visionDoc, setVisionDoc] = useState<VisionDocument>(() => {
    if (storedVision) {
      return { ...DEFAULT_VISION, ...stringToVision(storedVision), inspirations: inspirationUrls };
    }
    return { ...DEFAULT_VISION, inspirations: inspirationUrls };
  });

  const isComplete =
    visionDoc.problem.length >= 10 &&
    visionDoc.audience.type &&
    visionDoc.businessModel &&
    visionDoc.designStyle &&
    visionDoc.requiredFeatures.length > 0;

  const handleComplete = useCallback(
    (vision: VisionDocument) => {
      setVision(visionToString(vision));
      setInspirationUrls(vision.inspirations);
      setVisionDoc(vision);
      setIsEditing(false);
    },
    [setVision, setInspirationUrls]
  );

  const handleVisionChange = useCallback((vision: VisionDocument) => {
    setVisionDoc(vision);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Project Vision</h3>
          {isComplete && !isEditing && (
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            >
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && isComplete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="gap-1"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4">
          {isEditing ? (
            <VisionBuilder
              template={template}
              initialVision={visionDoc}
              onComplete={handleComplete}
              onVisionChange={handleVisionChange}
            />
          ) : (
            <VisionSummary vision={visionDoc} />
          )}
        </div>
      )}
    </div>
  );
}

export default VisionBuilderSection;

