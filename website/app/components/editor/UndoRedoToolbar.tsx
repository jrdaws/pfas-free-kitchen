"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function UndoRedoToolbar({ canUndo, canRedo, onUndo, onRedo }: UndoRedoToolbarProps) {
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent disabled:opacity-30"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent disabled:opacity-30"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
