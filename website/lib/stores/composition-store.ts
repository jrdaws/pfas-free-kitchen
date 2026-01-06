/**
 * Composition Store
 * 
 * Zustand store for managing the current composition state with undo/redo support.
 * Enables real-time preview editing with section CRUD operations.
 */

import { create } from 'zustand';
import type { ProjectComposition, SectionComposition } from '@/lib/composer/types';

// ============================================================================
// Types
// ============================================================================

interface CompositionState {
  // Current composition
  composition: ProjectComposition | null;
  
  // Selection state
  selectedPageId: string | null;
  selectedSectionIndex: number | null;
  
  // History for undo/redo
  history: ProjectComposition[];
  historyIndex: number;
  
  // Dirty tracking
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Loading states
  isRegenerating: boolean;
  regeneratingSection: string | null; // "pageId-sectionIndex"
  
  // Actions - Composition
  setComposition: (composition: ProjectComposition) => void;
  clearComposition: () => void;
  
  // Actions - Selection
  selectPage: (pageId: string) => void;
  selectSection: (pageId: string, sectionIndex: number) => void;
  clearSelection: () => void;
  
  // Actions - Section operations
  addSection: (pageId: string, section: SectionComposition, atIndex?: number) => void;
  removeSection: (pageId: string, sectionIndex: number) => void;
  moveSection: (pageId: string, fromIndex: number, toIndex: number) => void;
  duplicateSection: (pageId: string, sectionIndex: number) => void;
  updateSectionProps: (pageId: string, sectionIndex: number, props: Record<string, unknown>) => void;
  updateSectionVariant: (pageId: string, sectionIndex: number, variant: string) => void;
  replaceSection: (pageId: string, sectionIndex: number, section: SectionComposition) => void;
  
  // Actions - Undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Actions - Regeneration
  setRegenerating: (pageId: string, sectionIndex: number, isRegenerating: boolean) => void;
  
  // Actions - Save
  markSaved: () => void;
  reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_HISTORY = 20;

// ============================================================================
// Store Implementation
// ============================================================================

export const useCompositionStore = create<CompositionState>((set, get) => ({
  // Initial state
  composition: null,
  selectedPageId: null,
  selectedSectionIndex: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
  lastSaved: null,
  isRegenerating: false,
  regeneratingSection: null,
  
  // ============================================================================
  // Composition Actions
  // ============================================================================
  
  setComposition: (composition) => {
    const { history, historyIndex } = get();
    // Trim future history and add new state
    const newHistory = [...history.slice(0, historyIndex + 1), composition].slice(-MAX_HISTORY);
    set({
      composition,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
      // Select first page by default if none selected
      selectedPageId: get().selectedPageId || composition.pages[0]?.pageId || null,
    });
  },
  
  clearComposition: () => {
    set({
      composition: null,
      selectedPageId: null,
      selectedSectionIndex: null,
      history: [],
      historyIndex: -1,
      isDirty: false,
    });
  },
  
  // ============================================================================
  // Selection Actions
  // ============================================================================
  
  selectPage: (pageId) => {
    set({ selectedPageId: pageId, selectedSectionIndex: null });
  },
  
  selectSection: (pageId, sectionIndex) => {
    set({ selectedPageId: pageId, selectedSectionIndex: sectionIndex });
  },
  
  clearSelection: () => {
    set({ selectedSectionIndex: null });
  },
  
  // ============================================================================
  // Section CRUD Actions
  // ============================================================================
  
  addSection: (pageId, section, atIndex) => {
    const { composition, setComposition } = get();
    if (!composition) return;
    
    const newComposition: ProjectComposition = {
      ...composition,
      pages: composition.pages.map(page => {
        if (page.pageId !== pageId) return page;
        
        const newSections = [...page.sections];
        const insertIndex = atIndex ?? newSections.length;
        newSections.splice(insertIndex, 0, { ...section, order: insertIndex + 1 });
        
        // Reorder all sections
        return {
          ...page,
          sections: newSections.map((s, i) => ({ ...s, order: i + 1 })),
        };
      }),
    };
    
    setComposition(newComposition);
  },
  
  removeSection: (pageId, sectionIndex) => {
    const { composition, setComposition, selectedSectionIndex } = get();
    if (!composition) return;
    
    const page = composition.pages.find(p => p.pageId === pageId);
    if (!page || page.sections.length <= 1) {
      // Don't allow removing the last section
      console.warn('[CompositionStore] Cannot remove last section');
      return;
    }
    
    const newComposition: ProjectComposition = {
      ...composition,
      pages: composition.pages.map(page => {
        if (page.pageId !== pageId) return page;
        return {
          ...page,
          sections: page.sections
            .filter((_, i) => i !== sectionIndex)
            .map((s, i) => ({ ...s, order: i + 1 })),
        };
      }),
    };
    
    // Adjust selection if needed
    let newSelectedIndex = selectedSectionIndex;
    if (selectedSectionIndex !== null) {
      if (selectedSectionIndex === sectionIndex) {
        newSelectedIndex = null; // Deselect removed section
      } else if (selectedSectionIndex > sectionIndex) {
        newSelectedIndex = selectedSectionIndex - 1; // Shift selection up
      }
    }
    
    set({ selectedSectionIndex: newSelectedIndex });
    setComposition(newComposition);
  },
  
  moveSection: (pageId, fromIndex, toIndex) => {
    const { composition, setComposition } = get();
    if (!composition || fromIndex === toIndex) return;
    
    const newComposition: ProjectComposition = {
      ...composition,
      pages: composition.pages.map(page => {
        if (page.pageId !== pageId) return page;
        
        const newSections = [...page.sections];
        const [moved] = newSections.splice(fromIndex, 1);
        newSections.splice(toIndex, 0, moved);
        
        return {
          ...page,
          sections: newSections.map((s, i) => ({ ...s, order: i + 1 })),
        };
      }),
    };
    
    // Update selection to follow the moved section
    const { selectedSectionIndex } = get();
    if (selectedSectionIndex === fromIndex) {
      set({ selectedSectionIndex: toIndex });
    }
    
    setComposition(newComposition);
  },
  
  duplicateSection: (pageId, sectionIndex) => {
    const { composition, addSection } = get();
    if (!composition) return;
    
    const page = composition.pages.find(p => p.pageId === pageId);
    const section = page?.sections[sectionIndex];
    if (!section) return;
    
    // Create a deep copy of the section
    const duplicated: SectionComposition = {
      ...section,
      props: { ...section.props },
      order: sectionIndex + 2,
    };
    
    addSection(pageId, duplicated, sectionIndex + 1);
  },
  
  updateSectionProps: (pageId, sectionIndex, props) => {
    const { composition, setComposition } = get();
    if (!composition) return;
    
    const newComposition: ProjectComposition = {
      ...composition,
      pages: composition.pages.map(page => {
        if (page.pageId !== pageId) return page;
        return {
          ...page,
          sections: page.sections.map((s, i) => 
            i === sectionIndex ? { ...s, props } : s
          ),
        };
      }),
    };
    
    setComposition(newComposition);
  },
  
  updateSectionVariant: (pageId, sectionIndex, variant) => {
    const { composition, setComposition } = get();
    if (!composition) return;
    
    const newComposition: ProjectComposition = {
      ...composition,
      pages: composition.pages.map(page => {
        if (page.pageId !== pageId) return page;
        return {
          ...page,
          sections: page.sections.map((s, i) => 
            i === sectionIndex ? { ...s, variant } : s
          ),
        };
      }),
    };
    
    setComposition(newComposition);
  },
  
  replaceSection: (pageId, sectionIndex, section) => {
    const { composition, setComposition } = get();
    if (!composition) return;
    
    const newComposition: ProjectComposition = {
      ...composition,
      pages: composition.pages.map(page => {
        if (page.pageId !== pageId) return page;
        return {
          ...page,
          sections: page.sections.map((s, i) => 
            i === sectionIndex ? { ...section, order: s.order } : s
          ),
        };
      }),
    };
    
    setComposition(newComposition);
  },
  
  // ============================================================================
  // Undo/Redo Actions
  // ============================================================================
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    set({
      composition: history[newIndex],
      historyIndex: newIndex,
      isDirty: true,
    });
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    set({
      composition: history[newIndex],
      historyIndex: newIndex,
      isDirty: true,
    });
  },
  
  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },
  
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
  
  // ============================================================================
  // Regeneration State
  // ============================================================================
  
  setRegenerating: (pageId, sectionIndex, isRegenerating) => {
    set({
      isRegenerating,
      regeneratingSection: isRegenerating ? `${pageId}-${sectionIndex}` : null,
    });
  },
  
  // ============================================================================
  // Save Actions
  // ============================================================================
  
  markSaved: () => {
    set({ isDirty: false, lastSaved: new Date() });
  },
  
  reset: () => {
    set({
      composition: null,
      selectedPageId: null,
      selectedSectionIndex: null,
      history: [],
      historyIndex: -1,
      isDirty: false,
      lastSaved: null,
      isRegenerating: false,
      regeneratingSection: null,
    });
  },
}));

// ============================================================================
// Selectors (for derived state)
// ============================================================================

export function useSelectedSection() {
  const { composition, selectedPageId, selectedSectionIndex } = useCompositionStore();
  
  if (!composition || !selectedPageId || selectedSectionIndex === null) {
    return null;
  }
  
  const page = composition.pages.find(p => p.pageId === selectedPageId);
  return page?.sections[selectedSectionIndex] || null;
}

export function useCurrentPage() {
  const { composition, selectedPageId } = useCompositionStore();
  
  if (!composition || !selectedPageId) {
    return composition?.pages[0] || null;
  }
  
  return composition.pages.find(p => p.pageId === selectedPageId) || null;
}

export function useSectionCount() {
  const page = useCurrentPage();
  return page?.sections.length || 0;
}

