'use client';

import { cn } from '@/lib/utils';

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyLength: number;
  className?: string;
}

/**
 * Undo/Redo controls for the preview panel.
 * Shows button state and history depth indicator.
 */
export function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyLength,
  className,
}: HistoryControlsProps) {
  return (
    <div className={cn("flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5", className)}>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          "p-1 rounded transition-colors",
          canUndo
            ? "hover:bg-muted text-foreground"
            : "opacity-30 cursor-not-allowed text-muted-foreground"
        )}
        title="Undo (⌘Z)"
        aria-label="Undo"
      >
        <UndoIcon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={cn(
          "p-1 rounded transition-colors",
          canRedo
            ? "hover:bg-muted text-foreground"
            : "opacity-30 cursor-not-allowed text-muted-foreground"
        )}
        title="Redo (⌘⇧Z)"
        aria-label="Redo"
      >
        <RedoIcon className="w-3.5 h-3.5" />
      </button>
      {historyLength > 1 && (
        <span className="px-1.5 text-[10px] text-muted-foreground tabular-nums">
          {historyLength}
        </span>
      )}
    </div>
  );
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
    </svg>
  );
}

function RedoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 10h-10a5 5 0 00-5 5v2M21 10l-4-4m4 4l-4 4" />
    </svg>
  );
}

