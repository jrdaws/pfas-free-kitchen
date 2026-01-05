"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentSlot } from "./ComponentSlot";
import type { ComponentSlot as ComponentSlotType, SlotSource } from "./types";
import {
  Plus,
  Link2,
  Bot,
  FileText,
  Settings,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ComponentSlotsProps {
  slots: ComponentSlotType[];
  onUpdateSlot: (slotId: string, updates: Partial<ComponentSlotType>) => void;
  onAddSlot: (source?: SlotSource) => void;
  onRemoveSlot: (slotId: string) => void;
  className?: string;
}

const ADD_OPTIONS: { source: SlotSource; label: string; icon: typeof Bot; description: string }[] = [
  {
    source: "ai-generated",
    label: "AI Generated",
    icon: Bot,
    description: "Let AI generate content",
  },
  {
    source: "static",
    label: "Static Component",
    icon: FileText,
    description: "Choose from library",
  },
  {
    source: "custom",
    label: "Custom Placeholder",
    icon: Settings,
    description: "Implement after export",
  },
];

export function ComponentSlots({
  slots,
  onUpdateSlot,
  onAddSlot,
  onRemoveSlot,
  className,
}: ComponentSlotsProps) {
  // Sort slots by order
  const sortedSlots = [...slots].sort((a, b) => a.order - b.order);

  // Group by source for display
  const sharedSlots = sortedSlots.filter((s) => s.source === "shared");
  const contentSlots = sortedSlots.filter((s) => s.source !== "shared");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Components</span>
          <span className="text-xs text-muted-foreground">
            ({slots.length} slots)
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <Plus className="w-3.5 h-3.5" />
              Add Slot
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {ADD_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.source}
                onClick={() => onAddSlot(option.source)}
                className="gap-3"
              >
                <option.icon className="w-4 h-4" />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Shared Components (Layout-inherited) */}
      {sharedSlots.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            From Layout
          </p>
          {sharedSlots.map((slot) => (
            <ComponentSlot
              key={slot.id}
              slot={slot}
              onUpdate={(updates) => onUpdateSlot(slot.id, updates)}
              onRemove={() => onRemoveSlot(slot.id)}
            />
          ))}
        </div>
      )}

      {/* Page-Specific Components */}
      <div className="space-y-2">
        {sharedSlots.length > 0 && contentSlots.length > 0 && (
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Page Content
          </p>
        )}
        {contentSlots.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 text-center">
            <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No components yet
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddSlot("ai-generated")}
            >
              <Bot className="w-3.5 h-3.5 mr-1" />
              Add AI Component
            </Button>
          </div>
        ) : (
          contentSlots.map((slot) => (
            <ComponentSlot
              key={slot.id}
              slot={slot}
              onUpdate={(updates) => onUpdateSlot(slot.id, updates)}
              onRemove={() => onRemoveSlot(slot.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ComponentSlots;

