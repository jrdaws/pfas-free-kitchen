"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, ArrowLeftRight, Loader2, MessageSquare, X } from "lucide-react";
import type { SectionComposition } from "@/lib/composer/types";

interface PreviewSectionProps {
  section: SectionComposition;
  index: number;
  editable?: boolean;
  isRegenerating?: boolean;
  onRegenerate?: (feedback?: string) => void;
  onSwap?: () => void;
  children: React.ReactNode;
}

export function PreviewSection({
  section,
  index,
  editable = false,
  isRegenerating = false,
  onRegenerate,
  onSwap,
  children,
}: PreviewSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(feedback || undefined);
      setFeedback("");
      setShowFeedback(false);
    }
  };
  
  if (!editable) {
    return <>{children}</>;
  }
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section content */}
      <div className={cn(
        "transition-all duration-200",
        isHovered && "ring-2 ring-primary/50 ring-inset",
        isRegenerating && "opacity-50 pointer-events-none"
      )}>
        {children}
      </div>
      
      {/* Loading overlay */}
      {isRegenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/80 rounded-lg">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-white text-sm">Regenerating...</span>
          </div>
        </div>
      )}
      
      {/* Action toolbar */}
      {isHovered && !isRegenerating && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
          {/* Section label */}
          <span className="px-2 py-1 bg-black/80 text-white text-[10px] rounded">
            {section.patternId}
          </span>
          
          {/* Feedback button */}
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showFeedback 
                ? "bg-primary text-primary-foreground" 
                : "bg-black/80 text-white/80 hover:text-white hover:bg-black"
            )}
            title="Add feedback for regeneration"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          
          {/* Regenerate button */}
          <button
            onClick={handleRegenerate}
            className="p-1.5 bg-black/80 rounded-lg text-white/80 hover:text-white hover:bg-black transition-colors"
            title="Regenerate this section"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
          {/* Swap pattern button */}
          <button
            onClick={onSwap}
            className="p-1.5 bg-black/80 rounded-lg text-white/80 hover:text-white hover:bg-black transition-colors"
            title="Try a different pattern"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Feedback input */}
      {showFeedback && isHovered && (
        <div className="absolute top-12 right-2 z-30 w-72">
          <div className="bg-black/95 backdrop-blur-sm rounded-lg p-3 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-medium">Regeneration feedback</span>
              <button 
                onClick={() => setShowFeedback(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Make it more bold, add urgency..."
              className="w-full h-16 px-2 py-1.5 text-xs text-white bg-white/5 border border-white/10 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleRegenerate}
              className="w-full mt-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-md transition-colors"
            >
              Regenerate with feedback
            </button>
          </div>
        </div>
      )}
      
      {/* Section index indicator */}
      {isHovered && (
        <div className="absolute top-2 left-2 z-20">
          <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-medium rounded">
            Section {index + 1}
          </span>
        </div>
      )}
    </div>
  );
}

export default PreviewSection;

