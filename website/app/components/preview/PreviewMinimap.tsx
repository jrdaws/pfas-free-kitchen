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
        "flex flex-col gap-2 p-3 bg-slate-900/80 backdrop-blur-sm border-l border-slate-700/50 w-48 overflow-y-auto",
        className
      )}
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
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
                ? "bg-indigo-600/20 ring-2 ring-indigo-500"
                : "hover:bg-slate-800"
            )}
          >
            {/* Thumbnail placeholder */}
            <div
              className={cn(
                "w-full aspect-[4/3] rounded-md flex items-center justify-center text-2xl transition-all",
                isActive
                  ? "bg-indigo-600/30"
                  : "bg-slate-800 group-hover:bg-slate-700"
              )}
            >
              {icon}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  isActive ? "text-indigo-300" : "text-slate-400"
                )}
              >
                {page.name}
              </span>
              {page.metadata?.protected && (
                <span className="text-xs opacity-60">🔒</span>
              )}
            </div>
            <span className="text-[10px] text-slate-600 truncate">
              {page.path}
            </span>
          </button>
        );
      })}
    </div>
  );
}

