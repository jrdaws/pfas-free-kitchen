"use client";

import React, { useState } from "react";
import { SectionRendererProps, BrandingConfig, DEFAULT_BRANDING, SectionConfig } from "@/lib/patterns/types";
import { patternRegistry } from "@/lib/patterns/registry";
import { SectionToolbar } from "./SectionToolbar";
import { migratePatternProps, duplicateSection } from "@/lib/patterns/pattern-migration";

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

import {
  LogoWall,
  TestimonialCards,
} from "@/lib/patterns/patterns/social-proof";

import { PricingTable3Tier } from "@/lib/patterns/patterns/pricing";

import { CTASection } from "@/lib/patterns/patterns/cta";

import { FAQAccordion } from "@/lib/patterns/patterns/faq";

// Component registry maps pattern IDs to React components
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  // Heroes
  "hero-centered-gradient": HeroCenteredGradient,
  "hero-centered": HeroSimpleCentered,
  "hero-split-image": HeroSplitImage,
  "hero-video-bg": HeroVideoBackground,
  "hero-video-background": HeroVideoBackground, // Alias
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
  
  // Social Proof
  "logos-simple": LogoWall,
  "logos-wall": LogoWall, // Alias
  "logo-wall": LogoWall, // Alias
  "testimonials-grid": TestimonialCards,
  "testimonials-carousel": TestimonialCards, // Uses same component with variant
  "testimonials-cards": TestimonialCards, // Alias
  
  // Pricing
  "pricing-three-tier": PricingTable3Tier,
  "pricing-3-tier": PricingTable3Tier, // Alias
  "pricing-table": PricingTable3Tier, // Alias
  
  // CTA
  "cta-simple": CTASection,
  "cta-section": CTASection, // Alias
  "cta-centered": CTASection, // Alias
  
  // FAQ
  "faq-accordion": FAQAccordion,
  "faq-simple": FAQAccordion, // Alias
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
 * Shows a toolbar on hover when in editable mode.
 */
export function SectionRenderer({
  section,
  branding = DEFAULT_BRANDING,
  editable = false,
  index = 0,
  totalSections = 1,
  onPropsChange,
  onSectionChange,
  onSectionMove,
  onSectionDuplicate,
  onSectionDelete,
  onSelect,
  isSelected = false,
}: SectionRendererProps) {
  const [isHovered, setIsHovered] = useState(false);
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

  // Handle pattern swap
  const handleSwap = (newPatternId: string) => {
    if (onSectionChange) {
      const migratedSection = migratePatternProps(section, newPatternId);
      onSectionChange(migratedSection);
    }
  };

  // Handle move up
  const handleMoveUp = () => {
    if (onSectionMove && index > 0) {
      onSectionMove(index, index - 1);
    }
  };

  // Handle move down
  const handleMoveDown = () => {
    if (onSectionMove && index < totalSections - 1) {
      onSectionMove(index, index + 1);
    }
  };

  // Handle duplicate
  const handleDuplicate = () => {
    if (onSectionDuplicate) {
      onSectionDuplicate(index);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (onSectionDelete) {
      onSectionDelete(index);
    }
  };

  return (
    <div
      className={`relative group ${section.customizations?.className || ""} ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      } ${editable ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-section-id={section.id}
      data-pattern-id={section.patternId}
    >
      {/* Section toolbar - shows on hover in editable mode */}
      {editable && isHovered && (
        <SectionToolbar
          section={section}
          index={index}
          totalSections={totalSections}
          onSwap={handleSwap}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}

      {/* Section outline on hover */}
      {editable && isHovered && (
        <div className="absolute inset-0 border-2 border-dashed border-orange-500/30 pointer-events-none z-30" />
      )}

      {/* Hover indicator when editable but not hovered */}
      {editable && !isHovered && !isSelected && (
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

