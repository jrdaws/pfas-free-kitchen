"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search,
  FolderOpen,
  Clock,
  ArrowRight,
  Command,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  template?: string;
  status: "draft" | "active" | "archived";
  updatedAt: string;
}

interface ProjectSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onSelect: (id: string) => void;
}

export function ProjectSearch({
  open,
  onOpenChange,
  projects,
  onSelect,
}: ProjectSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) =>
            i < filteredProjects.length - 1 ? i + 1 : i
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i > 0 ? i - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredProjects[selectedIndex]) {
            onSelect(filteredProjects[selectedIndex].id);
            onOpenChange(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [filteredProjects, selectedIndex, onSelect, onOpenChange]
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Projects</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects..."
            className="border-0 p-0 h-auto text-base focus-visible:ring-0 bg-transparent"
            autoFocus
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {query ? `No projects matching "${query}"` : "No projects found"}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredProjects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onSelect(project.id);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left",
                    "hover:bg-muted/50 transition-colors",
                    index === selectedIndex && "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {project.template && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 capitalize">
                            {project.template}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0",
                    index === selectedIndex ? "opacity-100" : "opacity-0"
                  )} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> Navigate
            {" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> Open
            {" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectSearch;

