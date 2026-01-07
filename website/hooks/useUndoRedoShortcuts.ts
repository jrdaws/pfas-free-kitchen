'use client';

import { useEffect } from 'react';

interface UseUndoRedoShortcutsOptions {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  enabled?: boolean;
}

/**
 * Hook for handling Cmd+Z (undo) and Cmd+Shift+Z (redo) keyboard shortcuts.
 * Automatically detects Mac vs Windows/Linux and uses correct modifier key.
 *
 * @param options - Undo/redo functions and state
 */
export function useUndoRedoShortcuts({
  undo,
  redo,
  canUndo,
  canRedo,
  enabled = true,
}: UseUndoRedoShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' &&
        navigator.platform.toUpperCase().includes('MAC');
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows)
      if (modKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }

      // Redo: Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows)
      if (modKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      }

      // Also support Ctrl+Y for redo on Windows
      if (!isMac && e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, enabled]);
}

