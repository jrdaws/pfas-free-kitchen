"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AIGenerateButtonProps {
  fieldType: string;
  currentValue: string;
  onGenerate: (newValue: string) => void;
  context: {
    projectName?: string;
    industry?: string;
    projectType?: string;
    targetAudience?: string;
    uniqueValue?: string;
    domain?: string;
  };
  className?: string;
  compact?: boolean;
}

type Tone = "professional" | "casual" | "bold" | "friendly";

const TONE_LABELS: Record<Tone, { label: string; emoji: string }> = {
  professional: { label: "Professional", emoji: "💼" },
  casual: { label: "Casual", emoji: "😊" },
  bold: { label: "Bold", emoji: "⚡" },
  friendly: { label: "Friendly", emoji: "🤗" },
};

export function AIGenerateButton({
  fieldType,
  currentValue,
  onGenerate,
  context,
  className = "",
  compact = false,
}: AIGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [tone, setTone] = useState<Tone>("professional");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowOptions(false);
        setShowAlternatives(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generate = async () => {
    setIsGenerating(true);
    setError(null);
    setShowAlternatives(false);

    try {
      const response = await fetch("/api/generate/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldType,
          currentValue,
          context,
          tone,
          length: "medium",
        }),
      });

      const data = await response.json();

      if (data.success) {
        onGenerate(data.content);
        if (data.alternatives?.length > 0) {
          setAlternatives(data.alternatives);
          setShowAlternatives(true);
        }
      } else {
        setError(data.error || "Generation failed");
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Network error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAlternativeClick = (alt: string) => {
    onGenerate(alt);
    setShowAlternatives(false);
    setAlternatives([]);
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-flex", className)}>
      {/* Main generate button */}
      <button
        onClick={generate}
        disabled={isGenerating}
        className={cn(
          "flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500",
          "hover:from-purple-600 hover:to-pink-600 text-white rounded-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
          "shadow-lg shadow-purple-500/25",
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
        )}
        title="Generate with AI"
      >
        {isGenerating ? (
          <>
            <SpinnerIcon className="w-3 h-3 animate-spin" />
            {!compact && "Generating..."}
          </>
        ) : (
          <>
            <SparklesIcon className="w-3 h-3" />
            {!compact && "AI Generate"}
          </>
        )}
      </button>

      {/* Tone selector dropdown trigger */}
      <button
        onClick={() => {
          setShowOptions(!showOptions);
          setShowAlternatives(false);
        }}
        className={cn(
          "ml-0.5 hover:bg-white/10 rounded transition-colors",
          compact ? "p-0.5" : "p-1"
        )}
        title="Change tone"
      >
        <ChevronDownIcon className="w-3 h-3 text-purple-300" />
      </button>

      {/* Tone selector dropdown */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-white/10 rounded-lg p-2 z-50 shadow-xl min-w-[140px]">
          <p className="text-xs text-white/40 mb-2 px-1">Tone</p>
          {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTone(t);
                setShowOptions(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded transition-colors",
                tone === t
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white hover:bg-white/5"
              )}
            >
              <span>{TONE_LABELS[t].emoji}</span>
              <span>{TONE_LABELS[t].label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Alternatives dropdown */}
      {showAlternatives && alternatives.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-white/10 rounded-lg p-2 z-50 shadow-xl w-72">
          <p className="text-xs text-white/40 mb-2 px-1">
            Try another option:
          </p>
          {alternatives.map((alt, i) => (
            <button
              key={i}
              onClick={() => handleAlternativeClick(alt)}
              className="block w-full text-left px-2 py-2 text-sm text-white hover:bg-white/5 rounded transition-colors"
            >
              {alt}
            </button>
          ))}
          <button
            onClick={() => setShowAlternatives(false)}
            className="w-full mt-1 text-xs text-white/40 hover:text-white/60 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1 z-50">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

// Icon components
function SparklesIcon({ className }: { className?: string }) {
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
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
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

