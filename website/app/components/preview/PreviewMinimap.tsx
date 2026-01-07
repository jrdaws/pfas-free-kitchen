"use client";

import { cn } from "@/lib/utils";
import type { PreviewPage } from "./types";
import { PAGE_ICONS } from "./types";

interface PreviewMinimapProps {
  pages: PreviewPage[];
  currentPath: string;
  onChange: (path: string) => void;
  className?: string;
}

export function PreviewMinimap({
  pages,
  currentPath,
  onChange,
  className,
}: PreviewMinimapProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 bg-card/80 backdrop-blur-sm border-l border-border w-48 overflow-y-auto",
        className
      )}
    >
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Pages
      </div>
      {pages.map((page) => {
        const isActive = currentPath === page.path;
        const icon = PAGE_ICONS[page.type] || PAGE_ICONS.custom;

        return (
          <button
            key={page.id}
            onClick={() => onChange(page.path)}
            className={cn(
              "group flex flex-col gap-1 p-2 rounded-lg transition-all duration-200",
              isActive
                ? "bg-primary/20 ring-2 ring-primary"
                : "hover:bg-muted"
            )}
          >
            {/* Thumbnail placeholder */}
            <div
              className={cn(
                "w-full aspect-[4/3] rounded-md flex items-center justify-center text-2xl transition-all",
                isActive
                  ? "bg-primary/30"
                  : "bg-muted group-hover:bg-muted/80"
              )}
            >
              {icon}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {page.name}
              </span>
              {page.metadata?.protected && (
                <span className="text-xs opacity-60">🔒</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground/60 truncate">
              {page.path}
            </span>
          </button>
        );
      })}
    </div>
  );
}

