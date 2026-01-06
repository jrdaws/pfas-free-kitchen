/**
 * Image Slot Detector
 * 
 * Detects which pattern slots need images by analyzing the composition
 * and pattern registry. Returns prioritized list of image requirements.
 */

import type { ProjectComposition, SectionComposition } from "@/lib/composer/types";

export type AspectRatio = "1:1" | "16:9" | "4:3" | "3:2" | "21:9" | "9:16";
export type ImageStyle = "photo" | "illustration" | "3d" | "abstract" | "minimal";
export type SectionType = "hero" | "features" | "testimonials" | "product" | "team" | "about" | "cta" | "pricing";

export interface ImageContext {
  section: SectionType;
  purpose: string;
  aspectRatio: AspectRatio;
  style: ImageStyle;
}

export interface ImageSlot {
  patternId: string;
  sectionIndex: number;
  pageId: string;
  slotName: string;
  context: ImageContext;
  priority: "high" | "medium" | "low";
  currentValue?: string; // Existing URL if any
}

// Priority ordering for processing
const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

// Pattern category to section type mapping
const CATEGORY_TO_SECTION: Record<string, SectionType> = {
  hero: "hero",
  features: "features",
  testimonials: "testimonials",
  product: "product",
  team: "team",
  about: "about",
  cta: "cta",
  pricing: "pricing",
};

// Default aspect ratios by section type
const SECTION_ASPECT_RATIOS: Record<SectionType, AspectRatio> = {
  hero: "16:9",
  features: "4:3",
  testimonials: "1:1",
  product: "4:3",
  team: "1:1",
  about: "16:9",
  cta: "16:9",
  pricing: "4:3",
};

// Default styles by section type
const SECTION_STYLES: Record<SectionType, ImageStyle> = {
  hero: "photo",
  features: "illustration",
  testimonials: "photo",
  product: "photo",
  team: "photo",
  about: "photo",
  cta: "abstract",
  pricing: "minimal",
};

/**
 * Registry pattern definition (simplified for slot detection)
 */
interface RegistryPatternSlot {
  name: string;
  type: string;
  required?: boolean;
  aspectRatio?: string;
}

interface RegistryPattern {
  id: string;
  category: string;
  slots: RegistryPatternSlot[];
}

/**
 * Detect all image slots in a composition
 */
export function detectImageSlots(
  composition: ProjectComposition,
  patterns: RegistryPattern[]
): ImageSlot[] {
  const slots: ImageSlot[] = [];
  
  // Debug logging
  console.log("[SlotDetector] Pages:", composition.pages?.length || 0);
  console.log("[SlotDetector] Patterns with image slots:", 
    patterns.filter(p => p.slots.some(s => s.type === "image")).map(p => p.id).slice(0, 10).join(", "));

  for (const page of composition.pages) {
    console.log(`[SlotDetector] Page ${page.pageId}: ${page.sections?.length || 0} sections`);
    for (let sectionIndex = 0; sectionIndex < page.sections.length; sectionIndex++) {
      const section = page.sections[sectionIndex];
      const pattern = patterns.find((p) => p.id === section.patternId);
      
      const imageSlotCount = pattern?.slots.filter(s => s.type === "image").length || 0;
      console.log(`[SlotDetector]   Section ${sectionIndex}: patternId="${section.patternId}" → matched=${!!pattern}, imageSlots=${imageSlotCount}`);

      if (!pattern) continue;

      // Check each slot in the pattern
      for (const slot of pattern.slots) {
        if (slot.type === "image") {
          const imageSlot = createImageSlot(
            section,
            pattern,
            slot,
            page.pageId,
            sectionIndex
          );
          slots.push(imageSlot);
        }

        // Also check for array slots that contain images
        if (slot.type === "array" && section.props[slot.name]) {
          const arrayValue = section.props[slot.name] as Array<Record<string, unknown>>;
          if (Array.isArray(arrayValue)) {
            arrayValue.forEach((item, itemIndex) => {
              Object.entries(item).forEach(([key, value]) => {
                if (
                  (key === "image" || key.includes("Image") || key.includes("avatar")) &&
                  typeof value === "string" &&
                  (value === "" || value.includes("placeholder") || value.includes("placehold.co"))
                ) {
                  slots.push({
                    patternId: section.patternId,
                    sectionIndex,
                    pageId: page.pageId,
                    slotName: `${slot.name}[${itemIndex}].${key}`,
                    context: {
                      section: inferSectionType(pattern.category),
                      purpose: `${key} for item ${itemIndex + 1} in ${slot.name}`,
                      aspectRatio: key.includes("avatar") ? "1:1" : "4:3",
                      style: key.includes("avatar") ? "photo" : "illustration",
                    },
                    priority: itemIndex === 0 ? "medium" : "low",
                    currentValue: value as string,
                  });
                }
              });
            });
          }
        }
      }
    }
  }

  // Sort by priority
  return slots.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

/**
 * Create an ImageSlot from pattern and slot info
 */
function createImageSlot(
  section: SectionComposition,
  pattern: RegistryPattern,
  slot: RegistryPatternSlot,
  pageId: string,
  sectionIndex: number
): ImageSlot {
  const sectionType = inferSectionType(pattern.category);
  const currentValue = section.props[slot.name] as string | undefined;

  return {
    patternId: section.patternId,
    sectionIndex,
    pageId,
    slotName: slot.name,
    context: inferImageContext(pattern, slot, sectionType),
    priority: inferPriority(pattern.id, slot.name, sectionIndex),
    currentValue,
  };
}

/**
 * Infer section type from pattern category
 */
function inferSectionType(category: string): SectionType {
  const categoryLower = category.toLowerCase();
  return CATEGORY_TO_SECTION[categoryLower] || "features";
}

/**
 * Infer image context from pattern and slot
 */
function inferImageContext(
  pattern: RegistryPattern,
  slot: RegistryPatternSlot,
  sectionType: SectionType
): ImageContext {
  // Determine aspect ratio
  let aspectRatio: AspectRatio = SECTION_ASPECT_RATIOS[sectionType];
  if (slot.aspectRatio) {
    aspectRatio = slot.aspectRatio as AspectRatio;
  } else if (slot.name.includes("avatar") || slot.name.includes("profile")) {
    aspectRatio = "1:1";
  } else if (slot.name.includes("background") || slot.name.includes("hero")) {
    aspectRatio = "16:9";
  }

  // Determine style
  let style: ImageStyle = SECTION_STYLES[sectionType];
  if (slot.name.includes("avatar") || slot.name.includes("profile") || slot.name.includes("team")) {
    style = "photo";
  } else if (slot.name.includes("icon") || slot.name.includes("illustration")) {
    style = "illustration";
  }

  return {
    section: sectionType,
    purpose: `${slot.name} for ${pattern.id}`,
    aspectRatio,
    style,
  };
}

/**
 * Infer priority based on pattern type and slot name
 */
function inferPriority(
  patternId: string,
  slotName: string,
  sectionIndex: number
): ImageSlot["priority"] {
  // Hero images are always high priority
  if (patternId.startsWith("hero")) {
    return "high";
  }

  // First section images are higher priority
  if (sectionIndex === 0) {
    return "high";
  }

  // Avatar and profile images are medium priority
  if (slotName.includes("avatar") || slotName.includes("profile")) {
    return "medium";
  }

  // Background images are lower priority
  if (slotName.includes("background")) {
    return "low";
  }

  return "medium";
}

/**
 * Check if a slot value needs an image generated
 */
export function slotNeedsImage(value: unknown): boolean {
  if (!value || typeof value !== "string") return true;
  if (value === "") return true;
  if (value.includes("placeholder") || value.includes("placehold.co")) return true;
  if (value.startsWith("/") && !value.startsWith("/api")) return true; // Local placeholder
  return false;
}

/**
 * Filter slots to only those needing generation
 */
export function filterSlotsNeedingGeneration(slots: ImageSlot[]): ImageSlot[] {
  return slots.filter((slot) => slotNeedsImage(slot.currentValue));
}

/**
 * Group slots by priority for batch processing
 */
export function groupSlotsByPriority(
  slots: ImageSlot[]
): Record<ImageSlot["priority"], ImageSlot[]> {
  return {
    high: slots.filter((s) => s.priority === "high"),
    medium: slots.filter((s) => s.priority === "medium"),
    low: slots.filter((s) => s.priority === "low"),
  };
}

/**
 * Get statistics about image slots in a composition
 */
export function getImageSlotStats(slots: ImageSlot[]): {
  total: number;
  needsGeneration: number;
  byPriority: Record<string, number>;
  bySectionType: Record<string, number>;
} {
  const needsGeneration = filterSlotsNeedingGeneration(slots);

  return {
    total: slots.length,
    needsGeneration: needsGeneration.length,
    byPriority: {
      high: slots.filter((s) => s.priority === "high").length,
      medium: slots.filter((s) => s.priority === "medium").length,
      low: slots.filter((s) => s.priority === "low").length,
    },
    bySectionType: slots.reduce((acc, slot) => {
      acc[slot.context.section] = (acc[slot.context.section] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

