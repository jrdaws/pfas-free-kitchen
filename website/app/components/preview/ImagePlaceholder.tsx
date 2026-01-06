"use client";

import { cn } from "@/lib/utils";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import type { ImageSlot } from "@/lib/image-prompt-builder";

interface ImagePlaceholderProps {
  slot: ImageSlot;
  isGenerating?: boolean;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16";
  className?: string;
}

const ASPECT_RATIOS = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
};

const SLOT_LABELS: Record<ImageSlot, string> = {
  hero: "Hero Image",
  background: "Background",
  icon: "Icon",
  avatar: "Avatar",
  feature: "Feature Image",
  product: "Product Image",
};

export function ImagePlaceholder({
  slot,
  isGenerating = false,
  aspectRatio = "16:9",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900",
        ASPECT_RATIOS[aspectRatio],
        className
      )}
    >
      {/* Shimmer animation when generating */}
      {isGenerating && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        {isGenerating ? (
          <>
            <div className="relative">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              <Loader2 className="absolute -bottom-1 -right-1 w-4 h-4 text-indigo-300 animate-spin" />
            </div>
            <span className="text-xs text-slate-400 animate-pulse">
              Generating {SLOT_LABELS[slot]}...
            </span>
          </>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-slate-600" />
            <span className="text-xs text-slate-500">{SLOT_LABELS[slot]}</span>
          </>
        )}
      </div>

      {/* Corner indicator */}
      <div className="absolute top-2 right-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
            isGenerating
              ? "bg-indigo-500/20 text-indigo-300"
              : "bg-slate-700/50 text-slate-400"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              AI
            </>
          ) : (
            slot
          )}
        </span>
      </div>
    </div>
  );
}

interface ImageSkeletonGridProps {
  count?: number;
  isGenerating?: boolean;
  className?: string;
}

export function ImageSkeletonGrid({
  count = 3,
  isGenerating = false,
  className,
}: ImageSkeletonGridProps) {
  const slots: ImageSlot[] = ["hero", "feature", "avatar", "product", "background", "icon"];

  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ImagePlaceholder
          key={i}
          slot={slots[i % slots.length]}
          isGenerating={isGenerating}
          aspectRatio={slots[i % slots.length] === "avatar" ? "1:1" : "16:9"}
        />
      ))}
    </div>
  );
}

interface GeneratingOverlayProps {
  progress?: number;
  currentSlot?: string;
  totalImages?: number;
  generatedCount?: number;
  className?: string;
}

export function GeneratingOverlay({
  progress = 0,
  currentSlot,
  totalImages = 0,
  generatedCount = 0,
  className,
}: GeneratingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50",
        className
      )}
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
      </div>

      <div className="text-center">
        <p className="text-white font-medium">Generating AI Images</p>
        <p className="text-sm text-slate-400 mt-1">
          {currentSlot
            ? `Creating ${currentSlot}...`
            : `${generatedCount} of ${totalImages} images`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

