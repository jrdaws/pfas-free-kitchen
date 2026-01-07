"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface EditableWrapperProps {
  children: React.ReactNode;
  editable?: boolean;
  onEdit?: () => void;
  label?: string;
  className?: string;
  showEditButton?: boolean;
}

export function EditableWrapper({
  children,
  editable = true,
  onEdit,
  label,
  className,
  showEditButton = true,
}: EditableWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!editable) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <>
          {/* Highlight outline */}
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none z-10 transition-all" />
          
          {/* Label badge */}
          {label && (
            <div className="absolute -top-6 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded z-20 shadow-sm">
              {label}
            </div>
          )}
          
          {/* Edit button */}
          {showEditButton && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="absolute top-2 right-2 p-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded shadow-md z-20 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
      {children}
    </div>
  );
}

/**
 * Wrapper for array items (features, testimonials, etc.)
 * Shows index badge and edit/delete controls
 */
interface EditableArrayItemProps {
  children: React.ReactNode;
  index: number;
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  label?: string;
  className?: string;
}

export function EditableArrayItem({
  children,
  index,
  editable = true,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  label,
  className,
}: EditableArrayItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!editable) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <>
          {/* Highlight outline */}
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none z-10" />
          
          {/* Index/label badge */}
          <div className="absolute -top-6 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded z-20 shadow-sm">
            {label || `Item ${index + 1}`}
          </div>
          
          {/* Control buttons */}
          <div className="absolute top-2 right-2 flex gap-1 z-20">
            {onMoveUp && index > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                className="p-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                title="Move up"
              >
                ↑
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                className="p-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                title="Move down"
              >
                ↓
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                title="Delete"
              >
                ×
              </button>
            )}
          </div>
        </>
      )}
      {children}
    </div>
  );
}

