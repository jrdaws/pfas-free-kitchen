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
        "flex items-center gap-2 px-3 py-2 bg-card border-b border-border",
        className
      )}
    >
      {/* Navigation controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            "p-1 rounded hover:bg-muted transition-colors",
            canGoBack ? "text-muted-foreground" : "text-muted-foreground/40 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onForward}
          disabled={!canGoForward}
          className={cn(
            "p-1 rounded hover:bg-muted transition-colors",
            canGoForward ? "text-muted-foreground" : "text-muted-foreground/40 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onRefresh}
          className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* URL Bar */}
      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border border-border">
        {isSecure ? (
          <Lock className="w-3.5 h-3.5 text-success flex-shrink-0" />
        ) : (
          <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex items-baseline text-sm overflow-hidden">
          <span className="text-muted-foreground">https://</span>
          <span className="text-foreground font-medium">{domain}.com</span>
          <span className="text-primary truncate">{currentPath}</span>
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

