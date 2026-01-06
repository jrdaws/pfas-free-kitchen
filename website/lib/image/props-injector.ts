/**
 * Props Injector
 * 
 * Injects generated image URLs into composition section props.
 * Handles both direct slots and nested array slots.
 */

import type { ProjectComposition, SectionComposition } from "@/lib/composer/types";

/**
 * Inject generated image URLs into a composition
 * 
 * @param composition - The original composition
 * @param images - Map of slotKey -> imageUrl (slotKey format: "pageId-patternId-slotName")
 * @returns Updated composition with injected image URLs
 */
export function injectImageProps(
  composition: ProjectComposition,
  images: Map<string, string>
): ProjectComposition {
  return {
    ...composition,
    pages: composition.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section, sectionIndex) =>
        injectSectionImages(section, page.pageId, images)
      ),
    })),
  };
}

/**
 * Inject images into a single section
 */
function injectSectionImages(
  section: SectionComposition,
  pageId: string,
  images: Map<string, string>
): SectionComposition {
  const updatedProps = { ...section.props };

  // Check each image in the map
  for (const [slotKey, url] of images.entries()) {
    // Parse the slot key
    const prefix = `${pageId}-${section.patternId}-`;
    
    if (slotKey.startsWith(prefix)) {
      const slotName = slotKey.substring(prefix.length);
      
      // Handle array notation (e.g., "items[0].image")
      if (slotName.includes("[")) {
        injectArraySlotImage(updatedProps, slotName, url);
      } else {
        // Direct slot
        updatedProps[slotName] = url;
      }
    }
  }

  return { ...section, props: updatedProps };
}

/**
 * Inject image into an array slot
 * Handles notation like "items[0].image" or "slides[2].background"
 */
function injectArraySlotImage(
  props: Record<string, unknown>,
  slotPath: string,
  url: string
): void {
  // Parse array path: "arrayName[index].propertyName"
  const match = slotPath.match(/^(\w+)\[(\d+)\]\.(\w+)$/);
  
  if (!match) return;

  const [, arrayName, indexStr, propertyName] = match;
  const index = parseInt(indexStr, 10);

  // Ensure array exists and is an array
  if (!Array.isArray(props[arrayName])) return;

  const array = props[arrayName] as Array<Record<string, unknown>>;
  
  // Ensure index exists
  if (index >= array.length) return;

  // Update the property
  array[index] = {
    ...array[index],
    [propertyName]: url,
  };
}

/**
 * Create a mapping of slot keys to placeholder URLs
 * Useful for preview before actual generation
 */
export function createPlaceholderMap(
  composition: ProjectComposition
): Map<string, string> {
  const placeholders = new Map<string, string>();

  for (const page of composition.pages) {
    for (const section of page.sections) {
      // Scan props for potential image slots
      for (const [key, value] of Object.entries(section.props)) {
        if (isImageProp(key, value)) {
          const slotKey = `${page.pageId}-${section.patternId}-${key}`;
          placeholders.set(slotKey, getPlaceholderForSlot(key));
        }

        // Check arrays
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              for (const [itemKey, itemValue] of Object.entries(item)) {
                if (isImageProp(itemKey, itemValue)) {
                  const slotKey = `${page.pageId}-${section.patternId}-${key}[${index}].${itemKey}`;
                  placeholders.set(slotKey, getPlaceholderForSlot(itemKey));
                }
              }
            }
          });
        }
      }
    }
  }

  return placeholders;
}

/**
 * Check if a prop key/value looks like an image slot
 */
function isImageProp(key: string, value: unknown): boolean {
  const imageKeywords = ["image", "Image", "avatar", "Avatar", "photo", "Photo", "background", "Background", "poster", "Poster"];
  const isImageKey = imageKeywords.some((kw) => key.includes(kw));
  
  // Check if value is empty or a placeholder
  const isEmptyOrPlaceholder =
    value === "" ||
    value === undefined ||
    value === null ||
    (typeof value === "string" &&
      (value.includes("placeholder") ||
        value.includes("placehold.co") ||
        value.startsWith("/placeholder")));

  return isImageKey && isEmptyOrPlaceholder;
}

/**
 * Get appropriate placeholder URL based on slot name
 */
function getPlaceholderForSlot(slotName: string): string {
  const slotLower = slotName.toLowerCase();

  if (slotLower.includes("avatar") || slotLower.includes("profile")) {
    return "https://placehold.co/256x256/1e293b/6366f1?text=Avatar";
  }
  if (slotLower.includes("hero") || slotLower.includes("banner")) {
    return "https://placehold.co/1344x768/1e293b/6366f1?text=Hero";
  }
  if (slotLower.includes("background")) {
    return "https://placehold.co/1920x1080/1e293b/6366f1?text=Background";
  }
  if (slotLower.includes("icon")) {
    return "https://placehold.co/128x128/1e293b/6366f1?text=Icon";
  }
  if (slotLower.includes("product")) {
    return "https://placehold.co/600x400/1e293b/6366f1?text=Product";
  }

  return "https://placehold.co/800x600/1e293b/6366f1?text=Image";
}

/**
 * Count how many image props need generation
 */
export function countImageSlots(composition: ProjectComposition): number {
  let count = 0;

  for (const page of composition.pages) {
    for (const section of page.sections) {
      for (const [key, value] of Object.entries(section.props)) {
        if (isImageProp(key, value)) {
          count++;
        }

        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (typeof item === "object" && item !== null) {
              for (const [itemKey, itemValue] of Object.entries(item)) {
                if (isImageProp(itemKey, itemValue)) {
                  count++;
                }
              }
            }
          });
        }
      }
    }
  }

  return count;
}

/**
 * Merge two compositions, preferring images from the second
 */
export function mergeCompositionImages(
  original: ProjectComposition,
  withImages: ProjectComposition
): ProjectComposition {
  return {
    ...original,
    pages: original.pages.map((page, pageIndex) => ({
      ...page,
      sections: page.sections.map((section, sectionIndex) => {
        const imageSection = withImages.pages[pageIndex]?.sections[sectionIndex];
        if (!imageSection) return section;

        // Merge props, preferring image section values for image props
        const mergedProps = { ...section.props };
        for (const [key, value] of Object.entries(imageSection.props)) {
          if (
            isImageProp(key, section.props[key]) &&
            typeof value === "string" &&
            value.startsWith("http")
          ) {
            mergedProps[key] = value;
          }
        }

        return { ...section, props: mergedProps };
      }),
    })),
  };
}

