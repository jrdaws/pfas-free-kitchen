"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSection } from "./SortableSection";
import { SectionRenderer } from "./SectionRenderer";
import type { SectionConfig, BrandingConfig } from "@/lib/patterns/types";

interface DraggableSectionListProps {
  sections: SectionConfig[];
  branding?: BrandingConfig;
  editable?: boolean;
  onSectionsChange: (sections: SectionConfig[]) => void;
  onSectionChange: (index: number, section: SectionConfig) => void;
  onSectionDuplicate: (index: number) => void;
  onSectionDelete: (index: number) => void;
}

/**
 * DraggableSectionList
 * 
 * Renders sections with drag-and-drop reordering capability.
 * Uses @dnd-kit for smooth, accessible drag interactions.
 */
export function DraggableSectionList({
  sections,
  branding,
  editable = false,
  onSectionsChange,
  onSectionChange,
  onSectionDuplicate,
  onSectionDelete,
}: DraggableSectionListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for mouse/touch and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sections, oldIndex, newIndex);
        onSectionsChange(reordered);
      }
    }
  };

  const handleSectionMove = (fromIndex: number, toIndex: number) => {
    if (toIndex >= 0 && toIndex < sections.length) {
      const reordered = arrayMove(sections, fromIndex, toIndex);
      onSectionsChange(reordered);
    }
  };

  // Find the active section for overlay
  const activeSection = activeId
    ? sections.find((s) => s.id === activeId)
    : null;

  // Non-editable mode: just render sections without drag
  if (!editable) {
    return (
      <>
        {sections.map((section, index) => (
          <SectionRenderer
            key={section.id}
            section={section}
            branding={branding}
            index={index}
            totalSections={sections.length}
            editable={false}
          />
        ))}
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {sections.map((section, index) => (
          <SortableSection
            key={section.id}
            section={section}
            index={index}
            totalSections={sections.length}
            branding={branding}
            onSectionChange={(s) => onSectionChange(index, s)}
            onSectionMove={handleSectionMove}
            onSectionDuplicate={onSectionDuplicate}
            onSectionDelete={onSectionDelete}
          />
        ))}
      </SortableContext>

      {/* Drag overlay - shows preview of dragged section */}
      <DragOverlay>
        {activeSection && (
          <div className="opacity-80 shadow-2xl rounded-xl overflow-hidden pointer-events-none ring-2 ring-orange-500/50">
            <SectionRenderer
              section={activeSection}
              branding={branding}
              index={0}
              totalSections={1}
              editable={false}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default DraggableSectionList;

