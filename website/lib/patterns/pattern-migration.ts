/**
 * Pattern Migration
 *
 * Utilities for migrating props when swapping one pattern for another.
 * Preserves content where possible and fills defaults for new required props.
 */

import type { SectionConfig } from "./types";
import { getPattern } from "./registry";

/**
 * Common prop names that can transfer between most patterns
 */
const TRANSFERABLE_PROPS = [
  // Headlines and text
  "headline",
  "title",
  "subheadline",
  "subtitle",
  "description",
  "tagline",
  "badge",

  // CTAs
  "primaryCta",
  "secondaryCta",
  "cta",
  "buttonText",
  "buttonUrl",
  "buttonHref",

  // Media
  "image",
  "backgroundImage",
  "videoUrl",
  "media",

  // Styling
  "backgroundColor",
  "textColor",
  "variant",

  // Common arrays
  "features",
  "items",
  "testimonials",
  "tiers",
  "faqs",
];

/**
 * Props that should be renamed when transferring between patterns
 */
const PROP_ALIASES: Record<string, string[]> = {
  headline: ["title", "heading"],
  subheadline: ["subtitle", "description", "tagline"],
  primaryCta: ["cta", "button"],
  secondaryCta: ["secondaryButton"],
  image: ["media", "backgroundImage", "heroImage"],
  features: ["items", "cards", "list"],
};

/**
 * Migrate props when swapping from one pattern to another.
 * Preserves content where possible, fills defaults for new required props.
 */
export function migratePatternProps(
  oldSection: SectionConfig,
  newPatternId: string
): SectionConfig {
  const oldPattern = getPattern(oldSection.patternId);
  const newPattern = getPattern(newPatternId);

  // If we can't find patterns, just swap the ID
  if (!oldPattern || !newPattern) {
    console.warn(
      `[PatternMigration] Could not find pattern definitions, swapping ID only`
    );
    return {
      ...oldSection,
      patternId: newPatternId,
      variantId: undefined,
    };
  }

  const oldProps = oldSection.props || {};
  const newProps: Record<string, unknown> = {};

  // 1. Transfer directly matching props
  for (const prop of TRANSFERABLE_PROPS) {
    if (oldProps[prop] !== undefined) {
      newProps[prop] = oldProps[prop];
    }
  }

  // 2. Try alias matching for missing props
  for (const [canonical, aliases] of Object.entries(PROP_ALIASES)) {
    // Skip if we already have this prop
    if (newProps[canonical] !== undefined) continue;

    // Check aliases
    for (const alias of aliases) {
      if (oldProps[alias] !== undefined) {
        newProps[canonical] = oldProps[alias];
        break;
      }
    }
  }

  // 3. Category-specific migrations
  if (oldPattern.category === "hero" && newPattern.category === "hero") {
    migrateHeroToHero(oldProps, newProps, newPatternId);
  }

  if (oldPattern.category === "features" && newPattern.category === "features") {
    migrateFeaturestoFeatures(oldProps, newProps);
  }

  if (
    oldPattern.category === "testimonials" &&
    newPattern.category === "testimonials"
  ) {
    migrateTestimonialsToTestimonials(oldProps, newProps);
  }

  if (oldPattern.category === "pricing" && newPattern.category === "pricing") {
    migratePricingToPricing(oldProps, newProps);
  }

  if (oldPattern.category === "faq" && newPattern.category === "faq") {
    migrateFaqToFaq(oldProps, newProps);
  }

  // 4. Apply new pattern's default props as base, then overlay migrated props
  const defaults = newPattern.defaultProps || {};

  const finalSection: SectionConfig = {
    ...oldSection,
    patternId: newPatternId,
    variantId: undefined, // Reset variant on swap
    props: {
      ...defaults,
      ...newProps,
    },
  };

  console.log(
    `[PatternMigration] Migrated ${oldSection.patternId} → ${newPatternId}, transferred ${Object.keys(newProps).length} props`
  );

  return finalSection;
}

/**
 * Hero to Hero migration
 */
function migrateHeroToHero(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>,
  newPatternId: string
): void {
  // Split image patterns need an image
  if (newPatternId.includes("split")) {
    if (!newProps.image && !newProps.media) {
      // Keep any existing image
      if (oldProps.image) newProps.image = oldProps.image;
      if (oldProps.media) newProps.media = oldProps.media;
    }
  }

  // Video patterns need videoUrl
  if (newPatternId.includes("video")) {
    if (!newProps.videoUrl && oldProps.videoUrl) {
      newProps.videoUrl = oldProps.videoUrl;
    }
  }

  // Animated patterns might have animation settings
  if (newPatternId.includes("animated")) {
    if (oldProps.animationSpeed) {
      newProps.animationSpeed = oldProps.animationSpeed;
    }
  }
}

/**
 * Features to Features migration
 */
function migrateFeaturestoFeatures(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): void {
  // Transfer features array with different possible names
  const featuresArray =
    oldProps.features || oldProps.items || oldProps.cards || oldProps.list;

  if (Array.isArray(featuresArray)) {
    newProps.features = featuresArray;
  }

  // Transfer column count if applicable
  if (oldProps.columns) {
    newProps.columns = oldProps.columns;
  }
}

/**
 * Testimonials to Testimonials migration
 */
function migrateTestimonialsToTestimonials(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): void {
  const testimonials =
    oldProps.testimonials || oldProps.items || oldProps.reviews;

  if (Array.isArray(testimonials)) {
    newProps.testimonials = testimonials;
  }

  // Transfer layout preference
  if (oldProps.layout) {
    newProps.layout = oldProps.layout;
  }
}

/**
 * Pricing to Pricing migration
 */
function migratePricingToPricing(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): void {
  const tiers = oldProps.tiers || oldProps.plans || oldProps.pricing;

  if (Array.isArray(tiers)) {
    newProps.tiers = tiers;
  }

  // Transfer billing toggle state
  if (oldProps.showToggle !== undefined) {
    newProps.showToggle = oldProps.showToggle;
  }
  if (oldProps.billingPeriod) {
    newProps.billingPeriod = oldProps.billingPeriod;
  }
}

/**
 * FAQ to FAQ migration
 */
function migrateFaqToFaq(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): void {
  const faqs = oldProps.faqs || oldProps.items || oldProps.questions;

  if (Array.isArray(faqs)) {
    newProps.faqs = faqs;
  }
}

/**
 * Generate a unique section ID
 */
export function generateSectionId(patternId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${patternId}-${timestamp}-${random}`;
}

/**
 * Duplicate a section with a new ID
 */
export function duplicateSection(section: SectionConfig): SectionConfig {
  return {
    ...section,
    id: generateSectionId(section.patternId),
    props: { ...section.props },
    customizations: section.customizations
      ? { ...section.customizations }
      : undefined,
  };
}

