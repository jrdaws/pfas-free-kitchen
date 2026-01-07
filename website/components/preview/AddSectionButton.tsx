"use client";

import { cn } from "@/lib/utils";

interface AddSectionButtonProps {
  onClick: () => void;
  position: "between" | "end";
  className?: string;
}

export function AddSectionButton({
  onClick,
  position,
  className,
}: AddSectionButtonProps) {
  return (
    <div
      className={cn(
        "relative py-4 group",
        position === "between" ? "my-0" : "mt-8",
        className
      )}
    >
      {/* Dashed line indicator */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px border-t border-dashed border-white/10 group-hover:border-orange-500/30 transition-colors" />

      {/* Add button - centered */}
      <button
        onClick={onClick}
        className={cn(
          "relative left-1/2 -translate-x-1/2",
          "flex items-center gap-2 px-4 py-2",
          "bg-slate-800/90 hover:bg-slate-700 border border-white/10 hover:border-orange-500/50",
          "rounded-lg text-sm text-white/70 hover:text-white",
          "transition-all duration-200 hover:scale-105",
          "shadow-lg shadow-black/20",
          "opacity-0 group-hover:opacity-100",
          "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        )}
      >
        <PlusIcon className="w-4 h-4" />
        <span>Add Section</span>
      </button>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
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
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

export default AddSectionButton;

