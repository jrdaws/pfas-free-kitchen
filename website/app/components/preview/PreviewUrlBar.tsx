"use client";

import { cn } from "@/lib/utils";
import { Globe, Lock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface PreviewUrlBarProps {
  currentPath: string;
  siteName: string;
  isSecure?: boolean;
  onRefresh?: () => void;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  className?: string;
}

export function PreviewUrlBar({
  currentPath,
  siteName,
  isSecure = true,
  onRefresh,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  className,
}: PreviewUrlBarProps) {
  // Clean up the site name for domain display
  const domain = siteName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700/50",
        className
      )}
    >
      {/* Navigation controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            "p-1 rounded hover:bg-slate-700 transition-colors",
            canGoBack ? "text-slate-400" : "text-slate-600 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onForward}
          disabled={!canGoForward}
          className={cn(
            "p-1 rounded hover:bg-slate-700 transition-colors",
            canGoForward ? "text-slate-400" : "text-slate-600 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onRefresh}
          className="p-1 rounded text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* URL Bar */}
      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-700/50">
        {isSecure ? (
          <Lock className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        ) : (
          <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        )}
        <div className="flex items-baseline text-sm overflow-hidden">
          <span className="text-slate-500">https://</span>
          <span className="text-white font-medium">{domain}.com</span>
          <span className="text-indigo-400 truncate">{currentPath}</span>
        </div>
      </div>

      {/* Preview indicator */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        <span className="text-xs text-amber-400 font-medium">Preview</span>
      </div>
    </div>
  );
}

