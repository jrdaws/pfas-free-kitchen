"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SectionConfig {
  id: string;
  patternId: string;
  props?: Record<string, unknown>;
}

interface BulkGenerateButtonProps {
  section: SectionConfig;
  context: {
    projectName?: string;
    industry?: string;
    projectType?: string;
    targetAudience?: string;
    uniqueValue?: string;
    domain?: string;
  };
  onUpdate: (updatedProps: Record<string, unknown>) => void;
  className?: string;
}

interface FieldMapping {
  key: string;
  type: string;
  length?: "short" | "medium" | "long";
}

// Field mappings for different pattern types
const PATTERN_FIELDS: Record<string, FieldMapping[]> = {
  // Hero patterns
  "hero-centered": [
    { key: "headline", type: "headline" },
    { key: "subheadline", type: "subheadline" },
    { key: "ctaText", type: "cta-text" },
    { key: "secondaryCtaText", type: "cta-text" },
  ],
  "hero-split-image": [
    { key: "headline", type: "headline" },
    { key: "subheadline", type: "subheadline" },
    { key: "ctaText", type: "cta-text" },
  ],
  "hero-centered-gradient": [
    { key: "headline", type: "headline" },
    { key: "subheadline", type: "subheadline" },
    { key: "ctaText", type: "cta-text" },
  ],
  "hero-video-background": [
    { key: "headline", type: "headline" },
    { key: "subheadline", type: "subheadline" },
  ],

  // Feature patterns
  "features-icon-grid": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],
  "features-grid": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],
  "features-alternating": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],
  "features-bento": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],

  // CTA patterns
  "cta-simple": [
    { key: "headline", type: "headline" },
    { key: "subheadline", type: "subheadline" },
    { key: "ctaText", type: "cta-text" },
  ],
  "cta-newsletter": [
    { key: "headline", type: "headline" },
    { key: "subheadline", type: "subheadline" },
    { key: "ctaText", type: "cta-text" },
  ],

  // Testimonial patterns
  "testimonials-grid": [{ key: "title", type: "section-title" }],
  "testimonials-carousel": [{ key: "title", type: "section-title" }],

  // Pricing patterns
  "pricing-three-tier": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],
  "pricing-comparison": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],

  // FAQ patterns
  "faq-accordion": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],
  "faq-two-column": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],

  // Team patterns
  "team-grid": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],

  // Product patterns
  "product-grid": [
    { key: "title", type: "section-title" },
    { key: "subtitle", type: "section-subtitle" },
  ],
};

function getBasePatternType(patternId: string): string {
  // Extract base type from pattern ID (e.g., "hero-split-image" -> "hero")
  const parts = patternId.split("-");
  return parts[0];
}

function getFieldsForPattern(patternId: string): FieldMapping[] {
  // Try exact match first
  if (PATTERN_FIELDS[patternId]) {
    return PATTERN_FIELDS[patternId];
  }

  // Try partial matches
  for (const [key, fields] of Object.entries(PATTERN_FIELDS)) {
    if (patternId.includes(key) || key.includes(patternId)) {
      return fields;
    }
  }

  // Default fields based on base pattern type
  const baseType = getBasePatternType(patternId);
  switch (baseType) {
    case "hero":
      return [
        { key: "headline", type: "headline" },
        { key: "subheadline", type: "subheadline" },
        { key: "ctaText", type: "cta-text" },
      ];
    case "features":
      return [
        { key: "title", type: "section-title" },
        { key: "subtitle", type: "section-subtitle" },
      ];
    case "cta":
      return [
        { key: "headline", type: "headline" },
        { key: "subheadline", type: "subheadline" },
        { key: "ctaText", type: "cta-text" },
      ];
    case "testimonials":
    case "pricing":
    case "faq":
    case "team":
    case "product":
      return [
        { key: "title", type: "section-title" },
        { key: "subtitle", type: "section-subtitle" },
      ];
    default:
      return [{ key: "title", type: "section-title" }];
  }
}

export function BulkGenerateButton({
  section,
  context,
  onUpdate,
  className = "",
}: BulkGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateAll = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    const fieldsToGenerate = getFieldsForPattern(section.patternId);
    const total = fieldsToGenerate.length;
    const results: Record<string, unknown> = {};

    for (let i = 0; i < fieldsToGenerate.length; i++) {
      const field = fieldsToGenerate[i];
      setCurrentField(field.key);
      setProgress(((i + 1) / total) * 100);

      try {
        const currentValue =
          section.props?.[field.key as keyof typeof section.props];

        const response = await fetch("/api/generate/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fieldType: field.type,
            context,
            currentValue:
              typeof currentValue === "string" ? currentValue : "",
            tone: "professional",
            length: field.length || "medium",
          }),
        });

        const data = await response.json();
        if (data.success) {
          results[field.key] = data.content;
        }
      } catch (err) {
        console.error(`Failed to generate ${field.key}:`, err);
      }
    }

    if (Object.keys(results).length > 0) {
      onUpdate(results);
    } else {
      setError("Failed to generate content");
    }

    setIsGenerating(false);
    setProgress(0);
    setCurrentField(null);
  };

  return (
    <button
      onClick={generateAll}
      disabled={isGenerating}
      className={cn(
        "flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500",
        "hover:from-purple-600 hover:to-pink-600 text-white text-sm rounded-lg",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
        "shadow-lg shadow-purple-500/25 px-3 py-1.5",
        className
      )}
    >
      {isGenerating ? (
        <>
          <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs min-w-[60px]">
            {currentField || `${Math.round(progress)}%`}
          </span>
        </>
      ) : error ? (
        <>
          <ErrorIcon className="w-4 h-4" />
          <span>Retry</span>
        </>
      ) : (
        <>
          <SparklesIcon className="w-4 h-4" />
          <span>Generate All Content</span>
        </>
      )}
    </button>
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

function ErrorIcon({ className }: { className?: string }) {
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
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

