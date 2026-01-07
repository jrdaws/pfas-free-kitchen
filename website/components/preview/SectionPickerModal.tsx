"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  patternRegistry,
  getByCategory,
  searchPatterns,
} from "@/lib/patterns/registry";
import type { PatternDefinition, PatternCategory } from "@/lib/patterns/types";

interface SectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patternId: string, defaultProps?: Record<string, unknown>) => void;
}

interface CategoryConfig {
  id: PatternCategory;
  label: string;
  emoji: string;
}

const CATEGORIES: CategoryConfig[] = [
  { id: "hero", label: "Hero", emoji: "🌟" },
  { id: "features", label: "Features", emoji: "✨" },
  { id: "testimonials", label: "Testimonials", emoji: "💬" },
  { id: "pricing", label: "Pricing", emoji: "💰" },
  { id: "cta", label: "Call to Action", emoji: "📢" },
  { id: "faq", label: "FAQ", emoji: "❓" },
  { id: "team", label: "Team", emoji: "👥" },
  { id: "stats", label: "Stats", emoji: "📊" },
  { id: "logos", label: "Logos", emoji: "🏢" },
  { id: "content", label: "Content", emoji: "📝" },
  { id: "commerce", label: "Commerce", emoji: "🛒" },
];

// Pattern emoji thumbnails based on pattern name
function getPatternEmoji(pattern: PatternDefinition): string {
  if (pattern.thumbnail) return pattern.thumbnail;

  const name = pattern.name.toLowerCase();
  if (name.includes("grid")) return "⊞";
  if (name.includes("carousel")) return "🎠";
  if (name.includes("split")) return "◧";
  if (name.includes("centered")) return "◎";
  if (name.includes("gradient")) return "🌈";
  if (name.includes("video")) return "🎬";
  if (name.includes("icon")) return "🔷";
  if (name.includes("bento")) return "🍱";
  if (name.includes("alternating")) return "↔️";
  if (name.includes("accordion")) return "📋";
  if (name.includes("comparison")) return "⚖️";
  if (name.includes("newsletter")) return "📧";
  if (name.includes("simple")) return "○";

  // Category-based fallbacks
  switch (pattern.category) {
    case "hero":
      return "🌟";
    case "features":
      return "✨";
    case "testimonials":
      return "💬";
    case "pricing":
      return "💰";
    case "cta":
      return "📢";
    case "faq":
      return "❓";
    case "team":
      return "👥";
    case "stats":
      return "📊";
    case "logos":
      return "🏢";
    case "commerce":
      return "🛒";
    default:
      return "📐";
  }
}

export function SectionPickerModal({
  isOpen,
  onClose,
  onSelect,
}: SectionPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<PatternCategory>("hero");
  const [searchQuery, setSearchQuery] = useState("");
  const [patterns, setPatterns] = useState<PatternDefinition[]>([]);

  // Load patterns when category or search changes
  useEffect(() => {
    if (!isOpen) return;

    if (searchQuery.trim()) {
      setPatterns(searchPatterns(searchQuery));
    } else {
      setPatterns(getByCategory(activeCategory));
    }
  }, [isOpen, activeCategory, searchQuery]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePatternSelect = (pattern: PatternDefinition) => {
    onSelect(pattern.id, pattern.defaultProps);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[80vh] flex overflow-hidden border border-white/10 shadow-2xl">
        {/* Sidebar */}
        <div className="w-52 border-r border-white/10 p-4 flex-shrink-0 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4">Add Section</h2>

          {/* Search */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2",
                "bg-slate-800 border border-white/10 rounded-lg",
                "text-sm text-white placeholder:text-white/40",
                "focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              )}
            />
          </div>

          {/* Categories */}
          <nav className="space-y-1 flex-1 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery("");
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeCategory === cat.id && !searchQuery
                    ? "bg-orange-500/20 text-orange-400 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="ml-auto text-xs opacity-50">
                  {getByCategory(cat.id).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Pattern grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {searchQuery && (
            <p className="text-sm text-white/40 mb-4">
              {patterns.length} result{patterns.length !== 1 ? "s" : ""} for "
              {searchQuery}"
            </p>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                emoji={getPatternEmoji(pattern)}
                onSelect={() => handlePatternSelect(pattern)}
              />
            ))}
          </div>

          {patterns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-white/40">No patterns found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-sm text-orange-400 hover:text-orange-300"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="Close (Esc)"
        >
          <XIcon className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  );
}

interface PatternCardProps {
  pattern: PatternDefinition;
  emoji: string;
  onSelect: () => void;
}

function PatternCard({ pattern, emoji, onSelect }: PatternCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative text-left",
        "bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-orange-500/50",
        "rounded-xl overflow-hidden transition-all duration-200"
      )}
    >
      {/* Pattern preview/thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative overflow-hidden">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
          {emoji}
        </span>

        {/* Hover overlay with "Add" button */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "bg-orange-500/0 group-hover:bg-orange-500/10",
            "opacity-0 group-hover:opacity-100",
            "transition-all duration-200"
          )}
        >
          <span className="px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg shadow-lg">
            Add Section
          </span>
        </div>
      </div>

      {/* Pattern info */}
      <div className="p-3">
        <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
          {pattern.name}
        </p>
        {pattern.description && (
          <p className="text-xs text-white/40 mt-0.5 line-clamp-2">
            {pattern.description}
          </p>
        )}
        {pattern.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {pattern.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 bg-white/5 text-white/40 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// Icon components
function SearchIcon({ className }: { className?: string }) {
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
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default SectionPickerModal;

