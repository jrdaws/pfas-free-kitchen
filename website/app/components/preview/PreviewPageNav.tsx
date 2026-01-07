"use client";

import { cn } from "@/lib/utils";
import type { PreviewPage } from "./types";
import { PAGE_ICONS } from "./types";

interface PreviewPageNavProps {
  pages: PreviewPage[];
  currentPath: string;
  onChange: (path: string) => void;
  className?: string;
}

export function PreviewPageNav({
  pages,
  currentPath,
  onChange,
  className,
}: PreviewPageNavProps) {
  return (
    <nav
      className={cn(
        "flex items-center gap-1 p-2 bg-card/80 backdrop-blur-sm border-b border-border overflow-x-auto",
        className
      )}
    >
      {pages.map((page) => {
        const isActive = currentPath === page.path;
        const icon = PAGE_ICONS[page.type] || PAGE_ICONS.custom;

        return (
          <button
            key={page.id}
            onClick={() => onChange(page.path)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span className="text-base">{icon}</span>
            <span>{page.name}</span>
            {page.metadata?.protected && (
              <span className="text-xs opacity-60">🔒</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

