"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface AddSectionButtonProps {
  onClick: () => void;
  position: "between" | "end";
}

export function AddSectionButton({ onClick, position }: AddSectionButtonProps) {
  return (
    <div
      className={cn(
        "relative py-2 group",
        position === "between" ? "my-0" : "mt-4"
      )}
    >
      {/* Dashed line */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-px border-t border-dashed border-orange-500/20 group-hover:border-orange-500/40 transition-colors" />

      {/* Add button */}
      <button
        onClick={onClick}
        className={cn(
          "relative left-1/2 -translate-x-1/2",
          "flex items-center gap-2 px-4 py-2",
          "bg-stone-900/90 hover:bg-stone-800 backdrop-blur-sm",
          "border border-stone-700/50 hover:border-orange-500/50",
          "rounded-lg text-sm text-stone-300 hover:text-white",
          "transition-all duration-200",
          "opacity-0 group-hover:opacity-100",
          "shadow-lg hover:shadow-orange-500/10"
        )}
      >
        <Plus className="w-4 h-4" />
        <span>Add Section</span>
      </button>
    </div>
  );
}

export default AddSectionButton;

