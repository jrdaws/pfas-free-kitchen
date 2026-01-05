"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTreeItem } from "./PageTreeItem";
import type { PageNode } from "./types";
import { Plus, Search, FolderTree } from "lucide-react";

interface PageTreeProps {
  pages: PageNode[];
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: (parentId?: string) => void;
  onRenamePage: (id: string, newTitle: string) => void;
  onDeletePage: (id: string) => void;
  onReorderPages: (dragId: string, dropId: string) => void;
  className?: string;
}

export function PageTree({
  pages,
  selectedPageId,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
  onReorderPages,
  className,
}: PageTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["root"]));
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback((id: string) => {
    setDropTargetId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetId(null);
  }, []);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (draggedId && draggedId !== targetId) {
        onReorderPages(draggedId, targetId);
      }
      handleDragEnd();
    },
    [draggedId, onReorderPages, handleDragEnd]
  );

  // Filter pages by search query
  const filterPages = useCallback(
    (nodes: PageNode[]): PageNode[] => {
      if (!searchQuery) return nodes;

      const result: PageNode[] = [];

      for (const node of nodes) {
        const matchesSearch =
          node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.path.toLowerCase().includes(searchQuery.toLowerCase());

        const filteredChildren = node.children
          ? filterPages(node.children)
          : [];

        if (matchesSearch || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          });
        }
      }

      return result;
    },
    [searchQuery]
  );

  const filteredPages = filterPages(pages);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <FolderTree className="w-4 h-4" />
            Pages
          </h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1"
            onClick={() => onAddPage()}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages..."
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderTree className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No pages match your search" : "No pages yet"}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => onAddPage()}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add First Page
              </Button>
            )}
          </div>
        ) : (
          filteredPages.map((page) => (
            <PageTreeItem
              key={page.id}
              node={page}
              level={0}
              isSelected={selectedPageId === page.id}
              isExpanded={expandedIds.has(page.id)}
              isDraggedOver={dropTargetId === page.id}
              onSelect={onSelectPage}
              onToggle={handleToggle}
              onRename={onRenamePage}
              onDelete={onDeletePage}
              onAddChild={(parentId) => onAddPage(parentId)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default PageTree;

