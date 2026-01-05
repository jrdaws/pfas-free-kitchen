"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteTypeBadge } from "./RouteTypeBadge";
import type { PageNode } from "./types";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageTreeItemProps {
  node: PageNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  isDraggedOver: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
}

export function PageTreeItem({
  node,
  level,
  isSelected,
  isExpanded,
  isDraggedOver,
  onSelect,
  onToggle,
  onRename,
  onDelete,
  onAddChild,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: PageTreeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChildren = node.children && node.children.length > 0;

  const handleStartEdit = () => {
    setEditValue(node.title);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== node.title) {
      onRename(node.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(node.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={cn(
        "group relative select-none",
        isDraggedOver && "bg-primary/10 rounded"
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(node.id);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(node.id);
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(node.id);
      }}
    >
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer",
          "hover:bg-muted/50 transition-colors",
          isSelected && "bg-primary/10 hover:bg-primary/15"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Drag handle */}
        <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="shrink-0 p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Icon */}
        {hasChildren ? (
          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
        ) : (
          <File className="w-4 h-4 text-muted-foreground shrink-0" />
        )}

        {/* Title/Path */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                className="h-6 text-sm py-0 px-1"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium truncate">{node.title}</span>
              <span className="text-xs text-muted-foreground truncate">
                {node.path}
              </span>
            </>
          )}
        </div>

        {/* Badges */}
        {!isEditing && (
          <RouteTypeBadge
            type={node.routeType}
            isProtected={node.authRequired}
            size="sm"
          />
        )}

        {/* Actions Menu */}
        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleStartEdit} className="gap-2">
                <Pencil className="w-3.5 h-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddChild(node.id)}
                className="gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Child Page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(node.id)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isSelected={isSelected}
              isExpanded={isExpanded}
              isDraggedOver={isDraggedOver}
              onSelect={onSelect}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PageTreeItem;

