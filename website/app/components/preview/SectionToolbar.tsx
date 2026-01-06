"use client";

import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Settings2,
  RefreshCw,
  GripVertical,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SectionToolbarProps {
  pageId: string;
  sectionIndex: number;
  totalSections: number;
  patternName?: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  isDragging?: boolean;
  className?: string;
}

export function SectionToolbar({
  pageId,
  sectionIndex,
  totalSections,
  patternName,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onEdit,
  onRegenerate,
  isRegenerating = false,
  isDragging = false,
  className,
}: SectionToolbarProps) {
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === totalSections - 1;
  const canDelete = totalSections > 1;
  
  return (
    <div
      className={cn(
        "absolute top-2 right-2 z-10",
        "flex items-center gap-0.5",
        "bg-stone-900/95 backdrop-blur-sm rounded-lg p-1",
        "border border-stone-700/50",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        "shadow-lg",
        isDragging && "opacity-100",
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        {/* Drag Handle */}
        <div
          className="p-1.5 cursor-grab active:cursor-grabbing text-stone-400 hover:text-white transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        <div className="w-px h-4 bg-stone-700 mx-0.5" />
        
        {/* Move Up */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className={cn(
                "p-1.5 rounded transition-colors",
                isFirst
                  ? "text-stone-600 cursor-not-allowed"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              )}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Move Up
          </TooltipContent>
        </Tooltip>
        
        {/* Move Down */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className={cn(
                "p-1.5 rounded transition-colors",
                isLast
                  ? "text-stone-600 cursor-not-allowed"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Move Down
          </TooltipContent>
        </Tooltip>
        
        <div className="w-px h-4 bg-stone-700 mx-0.5" />
        
        {/* Duplicate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Duplicate Section
          </TooltipContent>
        </Tooltip>
        
        {/* Edit */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onEdit}
              className="p-1.5 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Edit Properties
          </TooltipContent>
        </Tooltip>
        
        {/* Regenerate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className={cn(
                "p-1.5 rounded transition-colors",
                isRegenerating
                  ? "text-primary"
                  : "text-stone-400 hover:text-primary hover:bg-stone-800"
              )}
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {isRegenerating ? "Regenerating..." : "Regenerate Content"}
          </TooltipContent>
        </Tooltip>
        
        <div className="w-px h-4 bg-stone-700 mx-0.5" />
        
        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDelete}
              disabled={!canDelete}
              className={cn(
                "p-1.5 rounded transition-colors",
                !canDelete
                  ? "text-stone-600 cursor-not-allowed"
                  : "text-stone-400 hover:text-red-400 hover:bg-red-950/50"
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {canDelete ? "Delete Section" : "Cannot delete last section"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Pattern name badge */}
      {patternName && (
        <div className="ml-2 px-2 py-0.5 text-[10px] font-medium text-stone-400 bg-stone-800 rounded">
          {patternName}
        </div>
      )}
    </div>
  );
}

export default SectionToolbar;

