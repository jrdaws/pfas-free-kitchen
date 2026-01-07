"use client";

import React from "react";
import { SectionRendererProps, BrandingConfig, DEFAULT_BRANDING } from "@/lib/patterns/types";
import { patternRegistry } from "@/lib/patterns/registry";

// Import all pattern components
import {
  HeroCenteredGradient,
  HeroSplitImage,
  HeroVideoBackground,
  HeroAnimatedText,
  HeroSimpleCentered,
} from "@/lib/patterns/patterns/heroes";

import {
  FeaturesIconGrid,
  FeaturesBentoGrid,
  FeaturesAlternatingRows,
  FeaturesComparisonTable,
  FeaturesCards,
} from "@/lib/patterns/patterns/features";

// Component registry maps pattern IDs to React components
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  // Heroes
  "hero-centered-gradient": HeroCenteredGradient,
  "hero-centered": HeroSimpleCentered,
  "hero-split-image": HeroSplitImage,
  "hero-video-bg": HeroVideoBackground,
  "hero-animated-gradient": HeroAnimatedText,
  
  // Features
  "features-icon-grid": FeaturesIconGrid,
  "features-grid": FeaturesIconGrid, // Alias
  "features-bento": FeaturesBentoGrid,
  "features-bento-grid": FeaturesBentoGrid, // Alias
  "features-alternating": FeaturesAlternatingRows,
  "features-alternating-rows": FeaturesAlternatingRows, // Alias
  "features-comparison": FeaturesComparisonTable,
  "features-comparison-table": FeaturesComparisonTable, // Alias
  "features-cards": FeaturesCards,
};

/**
 * Placeholder component for patterns not yet implemented
 */
function PlaceholderSection({ patternId }: { patternId: string }) {
  return (
    <div className="p-12 bg-muted/20 text-center border-y border-dashed border-muted">
      <div className="max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">
          Pattern not yet implemented: <code className="text-xs bg-muted px-2 py-1 rounded">{patternId}</code>
        </p>
      </div>
    </div>
  );
}

/**
 * SectionRenderer
 * 
 * Renders a section from its configuration.
 * Maps pattern IDs to actual React components and merges props.
 */
export function SectionRenderer({
  section,
  branding = DEFAULT_BRANDING,
  editable = false,
  onPropsChange,
  onSelect,
  isSelected = false,
}: SectionRendererProps) {
  const Component = COMPONENT_MAP[section.patternId];

  // Check if section is hidden
  if (section.customizations?.hidden) {
    return null;
  }

  if (!Component) {
    return <PlaceholderSection patternId={section.patternId} />;
  }

  // Get pattern definition for variant props
  const pattern = patternRegistry.getPattern(section.patternId);
  
  // Find variant default props if specified
  let variantProps = {};
  if (section.variantId && pattern) {
    // Currently patterns store variants as strings, not objects
    // This is a simplified merge
    variantProps = { variant: section.variantId };
  }

  // Merge props: pattern defaults → variant → section-specific
  const mergedProps = {
    ...pattern?.defaultProps,
    ...variantProps,
    ...section.props,
    branding,
  };

  const handleClick = () => {
    if (editable && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      className={`relative group ${section.customizations?.className || ""} ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      } ${editable ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      data-section-id={section.id}
      data-pattern-id={section.patternId}
    >
      {/* Edit overlay when editable and selected */}
      {editable && isSelected && (
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <button
            className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open props editor
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}

      {/* Hover indicator when editable */}
      {editable && !isSelected && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-muted-foreground/30 pointer-events-none rounded-lg transition-colors z-10" />
      )}

      <Component
        {...mergedProps}
        editable={editable}
        onTextChange={
          editable && onPropsChange
            ? (path: string, value: string) => {
                onPropsChange({ ...mergedProps, [path]: value });
              }
            : undefined
        }
      />
    </div>
  );
}

/**
 * Get list of all registered pattern component IDs
 */
export function getRegisteredPatternIds(): string[] {
  return Object.keys(COMPONENT_MAP);
}

/**
 * Check if a pattern has a component implementation
 */
export function hasPatternComponent(patternId: string): boolean {
  return patternId in COMPONENT_MAP;
}

export default SectionRenderer;

