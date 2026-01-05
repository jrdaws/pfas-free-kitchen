"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Check, Loader2 } from "lucide-react";
import { getPatternsByCategory, getAvailablePatterns } from "@/lib/composer";
import type { Pattern } from "@/lib/composer/types";

interface PatternSwapperProps {
  currentPatternId: string;
  category: string;
  onSwap: (newPatternId: string) => Promise<void>;
  onClose: () => void;
}

// Pattern thumbnails (placeholder - could be actual images)
const PATTERN_THUMBNAILS: Record<string, string> = {
  "hero-centered": "🎯",
  "hero-split-image": "🖼️",
  "features-grid": "⚡",
  "features-alternating": "↔️",
  "pricing-three-tier": "💰",
  "testimonials-grid": "💬",
  "testimonials-carousel": "🎠",
  "cta-simple": "🎯",
  "faq-accordion": "❓",
  "footer-multi-column": "📋",
  "nav-standard": "🧭",
  "stats-simple": "📊",
};

export function PatternSwapper({
  currentPatternId,
  category,
  onSwap,
  onClose,
}: PatternSwapperProps) {
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  
  // Get alternatives in the same category
  const alternatives = getPatternsByCategory(category).filter(
    p => p.id !== currentPatternId
  );
  
  // If no alternatives in category, show all patterns
  const patternsToShow = alternatives.length > 0 
    ? alternatives 
    : getAvailablePatterns().filter(p => p.id !== currentPatternId);
  
  const handleSwap = async (patternId: string) => {
    setSelectedPattern(patternId);
    setIsSwapping(true);
    try {
      await onSwap(patternId);
    } finally {
      setIsSwapping(false);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <h3 className="text-white font-medium">Swap Pattern</h3>
            <p className="text-white/50 text-xs mt-0.5">
              Current: {currentPatternId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
        
        {/* Pattern list */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <p className="text-white/50 text-xs mb-3">
            {alternatives.length > 0 
              ? `Alternative ${category} patterns:` 
              : "All available patterns:"}
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {patternsToShow.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handleSwap(pattern.id)}
                disabled={isSwapping}
                className={cn(
                  "relative p-4 rounded-lg border transition-all text-left",
                  selectedPattern === pattern.id
                    ? "bg-orange-500/20 border-orange-500"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
              >
                {/* Thumbnail */}
                <div className="text-2xl mb-2">
                  {PATTERN_THUMBNAILS[pattern.id] || "📦"}
                </div>
                
                {/* Name */}
                <p className="text-white text-sm font-medium">
                  {pattern.name}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {pattern.tags.slice(0, 2).map((tag) => (
                    <span 
                      key={tag}
                      className="px-1.5 py-0.5 bg-white/10 text-white/60 text-[10px] rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Variants */}
                <p className="text-white/40 text-[10px] mt-2">
                  Variants: {pattern.variants.join(", ")}
                </p>
                
                {/* Loading state */}
                {isSwapping && selectedPattern === pattern.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                  </div>
                )}
                
                {/* Selected indicator */}
                {selectedPattern === pattern.id && !isSwapping && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-orange-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {patternsToShow.length === 0 && (
            <p className="text-white/50 text-sm text-center py-8">
              No alternative patterns available
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatternSwapper;

