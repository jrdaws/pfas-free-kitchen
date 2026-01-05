"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface CreateProjectCardProps {
  onClick?: () => void;
  className?: string;
}

export function CreateProjectCard({ onClick, className }: CreateProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "h-full min-h-[280px] rounded-xl border-2 border-dashed border-border",
        "bg-muted/30 hover:bg-muted/50 hover:border-primary/50",
        "transition-all duration-200 cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        className
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center",
        "group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200"
      )}>
        <Plus className="w-8 h-8 text-primary" />
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          New Project
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start from scratch or template
        </p>
      </div>
    </button>
  );
}

export default CreateProjectCard;

