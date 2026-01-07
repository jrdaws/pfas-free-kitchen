"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionRenderer } from "./SectionRenderer";
import type { SectionConfig, BrandingConfig } from "@/lib/patterns/types";

interface SortableSectionProps {
  section: SectionConfig;
  index: number;
  totalSections: number;
  branding?: BrandingConfig;
  onSectionChange: (section: SectionConfig) => void;
  onSectionMove: (from: number, to: number) => void;
  onSectionDuplicate: (index: number) => void;
  onSectionDelete: (index: number) => void;
}

/**
 * SortableSection
 * 
 * Wrapper around SectionRenderer that enables drag-and-drop reordering.
 * Uses @dnd-kit/sortable for smooth, accessible drag interactions.
 */
export function SortableSection({
  section,
  index,
  totalSections,
  branding,
  onSectionChange,
  onSectionMove,
  onSectionDuplicate,
  onSectionDelete,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionRenderer
        section={section}
        branding={branding}
        index={index}
        totalSections={totalSections}
        editable={true}
        onSectionChange={onSectionChange}
        onSectionMove={onSectionMove}
        onSectionDuplicate={onSectionDuplicate}
        onSectionDelete={onSectionDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default SortableSection;

