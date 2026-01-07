"use client";

import { useState, useRef, useEffect } from "react";
import { getByCategory, getPattern } from "@/lib/patterns/registry";
import type { PatternDefinition, PatternCategory } from "@/lib/patterns/types";

// Pattern thumbnails (emoji placeholders)
const PATTERN_THUMBNAILS: Record<string, string> = {
  "hero-centered-gradient": "🌅",
  "hero-centered": "🎯",
  "hero-split-image": "🖼️",
  "hero-video-bg": "🎬",
  "hero-video-background": "🎬",
  "hero-animated-gradient": "✨",
  "features-icon-grid": "🔲",
  "features-grid": "🔲",
  "features-bento": "📦",
  "features-bento-grid": "📦",
  "features-alternating": "↔️",
  "features-alternating-rows": "↔️",
  "features-comparison": "📊",
  "features-cards": "🃏",
  "testimonials-grid": "💬",
  "testimonials-carousel": "🎠",
  "testimonials-cards": "💬",
  "pricing-three-tier": "💰",
  "pricing-3-tier": "💰",
  "cta-simple": "📢",
  "cta-section": "📢",
  "faq-accordion": "❓",
  "logos-simple": "🏢",
  "logo-wall": "🏢",
  "footer-multi-column": "📋",
  "nav-standard": "🧭",
};

interface PatternSwapDropdownProps {
  currentPatternId: string;
  category: PatternCategory;
  onSwap: (newPatternId: string) => void;
}

export function PatternSwapDropdown({
  currentPatternId,
  category,
  onSwap,
}: PatternSwapDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const patterns = getByCategory(category);
  const currentPattern = getPattern(currentPatternId);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm text-white transition-colors"
      >
        <SwapIcon className="w-4 h-4" />
        <span className="max-w-[120px] truncate">
          {currentPattern?.name || currentPatternId}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <p className="text-xs text-white/40 uppercase tracking-wider">
              Switch to another {category} pattern
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {patterns.length === 0 ? (
              <div className="p-4 text-center text-white/40 text-sm">
                No alternative patterns available
              </div>
            ) : (
              patterns.map((pattern) => (
                <PatternOption
                  key={pattern.id}
                  pattern={pattern}
                  isCurrent={pattern.id === currentPatternId}
                  onSelect={() => {
                    onSwap(pattern.id);
                    setIsOpen(false);
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PatternOption({
  pattern,
  isCurrent,
  onSelect,
}: {
  pattern: PatternDefinition;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={isCurrent}
      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors ${
        isCurrent ? "bg-orange-500/10 border-l-2 border-orange-500" : ""
      } ${isCurrent ? "cursor-default" : "cursor-pointer"}`}
    >
      {/* Pattern thumbnail */}
      <div className="w-12 h-8 bg-slate-800 rounded border border-white/5 flex items-center justify-center text-lg">
        {PATTERN_THUMBNAILS[pattern.id] || "📐"}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${isCurrent ? "text-orange-400" : "text-white"}`}
        >
          {pattern.name}
        </p>
        <p className="text-xs text-white/40 truncate">
          {pattern.description || `${pattern.category} pattern`}
        </p>
      </div>

      {isCurrent && <span className="text-xs text-orange-400">Current</span>}
    </button>
  );
}

// Icons
function SwapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default PatternSwapDropdown;

