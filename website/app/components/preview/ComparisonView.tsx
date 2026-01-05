"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, Eye, Layers } from "lucide-react";

interface ComparisonViewProps {
  originalScreenshot: string; // base64 or URL
  generatedPreview: React.ReactNode;
  originalLabel?: string;
  generatedLabel?: string;
  className?: string;
}

export function ComparisonView({
  originalScreenshot,
  generatedPreview,
  originalLabel = "Original",
  generatedLabel = "Generated",
  className,
}: ComparisonViewProps) {
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "overlay" | "side-by-side">("split");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(percentage);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Render different view modes
  if (viewMode === "side-by-side") {
    return (
      <div className={cn("flex flex-col", className)}>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="relative">
            <span className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md z-10">
              {originalLabel}
            </span>
            <img
              src={originalScreenshot}
              alt={originalLabel}
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
          <div className="relative">
            <span className="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-md z-10">
              {generatedLabel}
            </span>
            <div className="w-full h-auto rounded-lg border border-gray-200 overflow-hidden">
              {generatedPreview}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "overlay") {
    return (
      <div className={cn("flex flex-col", className)}>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="relative mt-4 rounded-lg overflow-hidden border border-gray-200">
          {/* Original image */}
          <img
            src={originalScreenshot}
            alt={originalLabel}
            className="w-full h-auto"
            style={{ opacity: 1 - splitPosition / 100 }}
          />
          {/* Generated overlay */}
          <div
            className="absolute inset-0"
            style={{ opacity: splitPosition / 100 }}
          >
            {generatedPreview}
          </div>
          {/* Opacity slider */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/70 rounded-full">
            <span className="text-xs text-white/70">{originalLabel}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-xs text-white/70">{generatedLabel}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Split view
  return (
    <div className={cn("flex flex-col", className)}>
      <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      <div
        ref={containerRef}
        className="relative mt-4 rounded-lg overflow-hidden border border-gray-200 select-none"
        style={{ aspectRatio: "16/10" }}
      >
        {/* Original side */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${splitPosition}%` }}
        >
          <img
            src={originalScreenshot}
            alt={originalLabel}
            className="absolute inset-0 w-full h-full object-cover object-left"
            style={{ width: `${100 / (splitPosition / 100)}%` }}
          />
          <span className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
            {originalLabel}
          </span>
        </div>

        {/* Generated side */}
        <div
          className="absolute inset-y-0 right-0 overflow-hidden"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <div
            className="absolute inset-0"
            style={{
              width: `${100 / ((100 - splitPosition) / 100)}%`,
              right: 0,
            }}
          >
            {generatedPreview}
          </div>
          <span className="absolute top-2 right-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-md">
            {generatedLabel}
          </span>
        </div>

        {/* Divider handle */}
        <div
          className={cn(
            "absolute inset-y-0 z-10 flex items-center justify-center cursor-ew-resize",
            isDragging && "cursor-grabbing"
          )}
          style={{ left: `${splitPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="w-1 h-full bg-white shadow-lg" />
          <div className="absolute w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ViewModeToggleProps {
  viewMode: "split" | "overlay" | "side-by-side";
  onViewModeChange: (mode: "split" | "overlay" | "side-by-side") => void;
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
      <button
        onClick={() => onViewModeChange("split")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          viewMode === "split"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <GripVertical className="w-4 h-4" />
        Split
      </button>
      <button
        onClick={() => onViewModeChange("overlay")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          viewMode === "overlay"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Layers className="w-4 h-4" />
        Overlay
      </button>
      <button
        onClick={() => onViewModeChange("side-by-side")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          viewMode === "side-by-side"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Eye className="w-4 h-4" />
        Side by Side
      </button>
    </div>
  );
}

