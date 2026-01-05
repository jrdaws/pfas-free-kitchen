"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ComponentSlot as ComponentSlotType, SlotSource } from "./types";
import {
  Link2,
  Bot,
  FileText,
  Settings,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface ComponentSlotProps {
  slot: ComponentSlotType;
  onUpdate: (updates: Partial<ComponentSlotType>) => void;
  onRemove: () => void;
  className?: string;
}

const SOURCE_CONFIG: Record<SlotSource, {
  label: string;
  icon: typeof Link2;
  color: string;
  bg: string;
}> = {
  shared: {
    label: "Shared",
    icon: Link2,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  "ai-generated": {
    label: "AI Generate",
    icon: Bot,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  static: {
    label: "Static",
    icon: FileText,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  custom: {
    label: "Custom",
    icon: Settings,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
};

export function ComponentSlot({
  slot,
  onUpdate,
  onRemove,
  className,
}: ComponentSlotProps) {
  const [isExpanded, setIsExpanded] = useState(slot.source === "ai-generated");
  const config = SOURCE_CONFIG[slot.source];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group border border-border rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50",
          config.bg
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Drag handle */}
        <div className="opacity-0 group-hover:opacity-100 cursor-grab shrink-0">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        {/* Icon */}
        <Icon className={cn("w-4 h-4 shrink-0", config.color)} />

        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className={cn("text-sm font-medium", config.color)}>
            {slot.label || config.label}
          </span>
          {slot.slotType !== "custom" && (
            <span className="text-xs text-muted-foreground ml-2 capitalize">
              ({slot.slotType})
            </span>
          )}
        </div>

        {/* Badge */}
        <Badge
          variant="secondary"
          className={cn("text-[10px]", config.bg, config.color)}
        >
          {config.label}
        </Badge>

        {/* Expand/Collapse */}
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}

        {/* Remove */}
        {slot.source !== "shared" && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 border-t border-border bg-background space-y-3">
          {/* Label input */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Label</label>
            <Input
              value={slot.label || ""}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Component label..."
              className="h-8 text-sm"
            />
          </div>

          {/* AI prompt input */}
          {slot.source === "ai-generated" && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Generation Prompt
              </label>
              <Textarea
                value={slot.generationPrompt || ""}
                onChange={(e) => onUpdate({ generationPrompt: e.target.value })}
                placeholder="Describe what you want AI to generate..."
                rows={3}
                className="text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Be specific about style, content, and functionality
              </p>
            </div>
          )}

          {/* Shared component selector */}
          {slot.source === "shared" && (
            <div className="text-xs text-muted-foreground">
              This component is inherited from the layout and cannot be
              modified here.
            </div>
          )}

          {/* Static component info */}
          {slot.source === "static" && (
            <div className="text-xs text-muted-foreground">
              Select a pre-built component from the library.
            </div>
          )}

          {/* Custom component info */}
          {slot.source === "custom" && (
            <div className="text-xs text-muted-foreground">
              You&apos;ll implement this component after export.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComponentSlot;

