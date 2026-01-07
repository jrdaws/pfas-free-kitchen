"use client";

import { useState } from "react";
import { PatternSwapDropdown } from "./PatternSwapDropdown";
import type { SectionConfig, PatternCategory } from "@/lib/patterns/types";

interface SectionToolbarProps {
  section: SectionConfig;
  index: number;
  totalSections: number;
  onSwap: (newPatternId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function SectionToolbar({
  section,
  index,
  totalSections,
  onSwap,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  dragHandleProps,
}: SectionToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Extract category from pattern ID
  const category = getPatternCategory(section.patternId);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl shadow-xl z-40"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag handle - first item */}
      {dragHandleProps && (
        <>
          <button
            {...dragHandleProps}
            className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-white/10 rounded transition-colors touch-none"
            title="Drag to reorder"
          >
            <GripVerticalIcon className="w-4 h-4 text-white" />
          </button>
          <div className="w-px h-6 bg-white/10" />
        </>
      )}

      {/* Pattern swap dropdown */}
      <PatternSwapDropdown
        currentPatternId={section.patternId}
        category={category}
        onSwap={onSwap}
      />

      <div className="w-px h-6 bg-white/10" />

      {/* Move buttons */}
      <button
        onClick={onMoveUp}
        disabled={index === 0}
        className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move up"
      >
        <ArrowUpIcon className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={onMoveDown}
        disabled={index === totalSections - 1}
        className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move down"
      >
        <ArrowDownIcon className="w-4 h-4 text-white" />
      </button>

      <div className="w-px h-6 bg-white/10" />

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="p-1.5 hover:bg-white/10 rounded transition-colors"
        title="Duplicate section"
      >
        <CopyIcon className="w-4 h-4 text-white" />
      </button>

      {/* Delete */}
      {showDeleteConfirm ? (
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
          title="Click again to confirm"
        >
          <TrashIcon className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-400">Confirm?</span>
        </button>
      ) : (
        <button
          onClick={handleDelete}
          className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
          title="Delete section"
        >
          <TrashIcon className="w-4 h-4 text-red-400" />
        </button>
      )}
    </div>
  );
}

/**
 * Extract pattern category from pattern ID
 */
function getPatternCategory(patternId: string): PatternCategory {
  if (patternId.startsWith("hero")) return "hero";
  if (patternId.startsWith("feature")) return "features";
  if (patternId.startsWith("pricing")) return "pricing";
  if (patternId.startsWith("testimonial")) return "testimonials";
  if (patternId.startsWith("logo")) return "logos";
  if (patternId.startsWith("cta")) return "cta";
  if (patternId.startsWith("faq")) return "faq";
  if (patternId.startsWith("team")) return "team";
  if (patternId.startsWith("stat")) return "stats";
  if (patternId.startsWith("footer")) return "footer";
  if (patternId.startsWith("nav")) return "navigation";
  return "hero"; // fallback
}

// Icons
function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function GripVerticalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"
      />
    </svg>
  );
}

export default SectionToolbar;

