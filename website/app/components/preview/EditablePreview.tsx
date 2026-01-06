"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useCompositionStore, useCurrentPage } from "@/lib/stores/composition-store";
import { getPatternById } from "@/lib/composer/selector";
import { SectionToolbar } from "./SectionToolbar";
import { PatternPicker } from "./PatternPicker";
import { PropEditor } from "./PropEditor";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import type { SectionComposition } from "@/lib/composer/types";

// ============================================================================
// Sortable Section Component
// ============================================================================

interface SortableSectionProps {
  id: string;
  section: SectionComposition;
  pageId: string;
  index: number;
  totalSections: number;
  isSelected: boolean;
  isRegenerating: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  renderSection: (section: SectionComposition, index: number) => React.ReactNode;
}

function SortableSection({
  id,
  section,
  pageId,
  index,
  totalSections,
  isSelected,
  isRegenerating,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onEdit,
  onRegenerate,
  renderSection,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const pattern = getPatternById(section.patternId);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-stone-900 rounded-lg",
        isDragging && "z-50"
      )}
      onClick={onSelect}
    >
      {/* Section Toolbar */}
      <SectionToolbar
        pageId={pageId}
        sectionIndex={index}
        totalSections={totalSections}
        patternName={pattern?.name}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onEdit={onEdit}
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
        isDragging={isDragging}
      />
      
      {/* Drag Handle Overlay (invisible, just for events) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-5"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      
      {/* Section Content */}
      <div className="pointer-events-none">
        {renderSection(section, index)}
      </div>
      
      {/* Add Section Button (between sections) */}
      <AddSectionButton 
        pageId={pageId}
        atIndex={index + 1}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2"
      />
    </div>
  );
}

// ============================================================================
// Add Section Button
// ============================================================================

interface AddSectionButtonProps {
  pageId: string;
  atIndex: number;
  className?: string;
}

function AddSectionButton({ pageId, atIndex, className }: AddSectionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { addSection } = useCompositionStore();
  
  const handleSelect = useCallback(async (patternId: string) => {
    // Fetch generated section from API
    try {
      const response = await fetch('/api/compose/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId,
          atIndex,
          context: {
            vision: {
              projectName: 'My Project',
              description: 'A modern web application',
            },
            template: 'saas',
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.section) {
          addSection(pageId, data.section, atIndex);
        }
      }
    } catch (error) {
      console.error('[EditablePreview] Failed to add section:', error);
    }
    
    setShowPicker(false);
  }, [pageId, atIndex, addSection]);
  
  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "flex items-center gap-1 px-2 py-1 rounded-full",
          "bg-primary text-primary-foreground text-xs font-medium",
          "hover:bg-primary/90 shadow-lg",
          className
        )}
      >
        <Plus className="h-3 w-3" />
        <span>Add</span>
      </button>
      
      <PatternPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        insertAtIndex={atIndex}
      />
    </>
  );
}

// ============================================================================
// Editable Preview Component
// ============================================================================

interface EditablePreviewProps {
  renderSection: (section: SectionComposition, index: number) => React.ReactNode;
  className?: string;
}

export function EditablePreview({ renderSection, className }: EditablePreviewProps) {
  const {
    composition,
    selectedPageId,
    selectedSectionIndex,
    selectSection,
    clearSelection,
    moveSection,
    duplicateSection,
    removeSection,
    setRegenerating,
    regeneratingSection,
  } = useCompositionStore();
  
  const currentPage = useCurrentPage();
  const [showPropEditor, setShowPropEditor] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPatternPicker, setShowPatternPicker] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number>(0);
  
  // Keyboard sensors for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const pageId = currentPage?.pageId || '';
  const sections = currentPage?.sections || [];
  const sectionIds = sections.map((_, i) => `${pageId}-${i}`);
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id || !pageId) return;
    
    const fromIndex = parseInt((active.id as string).split('-').pop() || '0');
    const toIndex = parseInt((over.id as string).split('-').pop() || '0');
    
    if (fromIndex !== toIndex) {
      moveSection(pageId, fromIndex, toIndex);
    }
  }, [pageId, moveSection]);
  
  const handleRegenerate = useCallback(async (sectionIndex: number) => {
    if (!pageId || !composition) return;
    
    setRegenerating(pageId, sectionIndex, true);
    
    try {
      const response = await fetch(`/api/compose/section/${sectionIndex}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          composition,
          pageId,
          sectionIndex,
          context: {
            vision: {
              projectName: 'My Project',
              description: 'A modern web application',
            },
            template: 'saas',
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.section) {
          // Update via store
          const { replaceSection } = useCompositionStore.getState();
          replaceSection(pageId, sectionIndex, data.section);
        }
      }
    } catch (error) {
      console.error('[EditablePreview] Regeneration failed:', error);
    } finally {
      setRegenerating(pageId, sectionIndex, false);
    }
  }, [pageId, composition, setRegenerating]);
  
  if (!currentPage || sections.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-12 text-stone-500", className)}>
        <Layers className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm mb-4">No sections yet</p>
        <Button
          variant="outline"
          onClick={() => {
            setInsertAtIndex(0);
            setShowPatternPicker(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Section
        </Button>
        
        <PatternPicker
          isOpen={showPatternPicker}
          onClose={() => setShowPatternPicker(false)}
          onSelect={async (patternId) => {
            // Add section logic
            setShowPatternPicker(false);
          }}
          insertAtIndex={insertAtIndex}
        />
      </div>
    );
  }
  
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div className={cn("relative", className)}>
            {/* First Add Button */}
            <div className="relative h-0">
              <AddSectionButton 
                pageId={pageId}
                atIndex={0}
                className="absolute top-2 left-1/2 -translate-x-1/2"
              />
            </div>
            
            {sections.map((section, index) => (
              <SortableSection
                key={`${pageId}-${index}`}
                id={`${pageId}-${index}`}
                section={section}
                pageId={pageId}
                index={index}
                totalSections={sections.length}
                isSelected={selectedPageId === pageId && selectedSectionIndex === index}
                isRegenerating={regeneratingSection === `${pageId}-${index}`}
                onSelect={() => selectSection(pageId, index)}
                onMoveUp={() => index > 0 && moveSection(pageId, index, index - 1)}
                onMoveDown={() => index < sections.length - 1 && moveSection(pageId, index, index + 1)}
                onDuplicate={() => duplicateSection(pageId, index)}
                onDelete={() => removeSection(pageId, index)}
                onEdit={() => setShowPropEditor(true)}
                onRegenerate={() => handleRegenerate(index)}
                renderSection={renderSection}
              />
            ))}
          </div>
        </SortableContext>
        
        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="opacity-80 shadow-2xl rounded-lg overflow-hidden">
              {(() => {
                const index = parseInt(activeId.split('-').pop() || '0');
                const section = sections[index];
                return section ? renderSection(section, index) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {/* Property Editor Sidebar */}
      <PropEditor
        isOpen={showPropEditor}
        onClose={() => setShowPropEditor(false)}
      />
    </>
  );
}

export default EditablePreview;

