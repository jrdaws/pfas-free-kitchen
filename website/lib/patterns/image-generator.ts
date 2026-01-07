/**
 * Pattern Image Generator
 * 
 * Centralized helper for generating AI images for all pattern types.
 * Aligns with Approach A (unified renderer) - images are generated into
 * composition props, making them available to both preview and export.
 */

import type { SectionComposition } from '@/lib/composer/types';

// Image generation configuration per pattern
interface ImageGenerationConfig {
  patternId: string;
  slots: {
    propPath: string;           // e.g., "features[].image" or "backgroundImage"
    promptTemplate: string;     // Template with {placeholders}
    size: '256x256' | '512x512' | '1024x1024' | '1920x600' | '1344x768';
    style: 'icon' | 'illustration' | 'photo' | 'abstract' | 'logo';
    priority: 'high' | 'medium' | 'low';
  }[];
}

// Pattern-specific configurations
const PATTERN_IMAGE_CONFIGS: ImageGenerationConfig[] = [
  // Hero patterns
  {
    patternId: 'hero-split-image',
    slots: [
      {
        propPath: 'image',
        promptTemplate: 'Hero image for {projectName} - {domain}. Professional, modern, high-quality photography style, {industry} industry',
        size: '1344x768',
        style: 'photo',
        priority: 'high',
      },
    ],
  },
  {
    patternId: 'hero-video-background',
    slots: [
      {
        propPath: 'posterImage',
        promptTemplate: 'Cinematic poster image for {projectName}, {domain}. Dark, atmospheric, professional',
        size: '1920x600',
        style: 'photo',
        priority: 'high',
      },
    ],
  },
  
  // Features patterns
  {
    patternId: 'features-icon-grid',
    slots: [
      {
        propPath: 'features[].image',
        promptTemplate: 'Minimal icon illustration for {title}: {description}. Flat design, single accent color, modern tech aesthetic, centered',
        size: '256x256',
        style: 'icon',
        priority: 'medium',
      },
    ],
  },
  {
    patternId: 'features-grid',
    slots: [
      {
        propPath: 'features[].image',
        promptTemplate: 'Feature icon for {title}. Simple geometric shape, modern, minimal, single color on neutral background',
        size: '256x256',
        style: 'icon',
        priority: 'medium',
      },
    ],
  },
  {
    patternId: 'features-bento',
    slots: [
      {
        propPath: 'features[].image',
        promptTemplate: 'Abstract illustration for {title}. Modern gradient, geometric shapes, tech aesthetic',
        size: '512x512',
        style: 'illustration',
        priority: 'medium',
      },
    ],
  },
  {
    patternId: 'features-alternating',
    slots: [
      {
        propPath: 'features[].image',
        promptTemplate: 'Feature illustration for {title}: {description}. Modern, clean, professional illustration style',
        size: '512x512',
        style: 'illustration',
        priority: 'medium',
      },
    ],
  },
  
  // Testimonials patterns
  {
    patternId: 'testimonials-grid',
    slots: [
      {
        propPath: 'testimonials[].avatar',
        promptTemplate: 'Professional headshot of {author}, {role}. Natural lighting, friendly expression, business professional, neutral background',
        size: '256x256',
        style: 'photo',
        priority: 'medium',
      },
    ],
  },
  {
    patternId: 'testimonials-carousel',
    slots: [
      {
        propPath: 'testimonials[].avatar',
        promptTemplate: 'Professional portrait of {author}, {role}. Corporate headshot style, confident expression',
        size: '256x256',
        style: 'photo',
        priority: 'medium',
      },
    ],
  },
  
  // Logo wall
  {
    patternId: 'logos-simple',
    slots: [
      {
        propPath: 'logos[].src',
        promptTemplate: 'Minimalist company logo for {name}. Abstract geometric mark, single color, professional, tech company aesthetic',
        size: '256x256',
        style: 'logo',
        priority: 'low',
      },
    ],
  },
  
  // CTA patterns
  {
    patternId: 'cta-simple',
    slots: [
      {
        propPath: 'backgroundImage',
        promptTemplate: 'Abstract gradient background for call-to-action. Flowing shapes, {primaryColor} tones, subtle glow, professional dark theme',
        size: '1920x600',
        style: 'abstract',
        priority: 'low',
      },
    ],
  },
  
  // Product patterns
  {
    patternId: 'product-grid',
    slots: [
      {
        propPath: 'products[].image',
        promptTemplate: 'Product photo of {name}. E-commerce style, white background, professional lighting, centered, {category} product',
        size: '512x512',
        style: 'photo',
        priority: 'medium',
      },
    ],
  },
  
  // Team patterns
  {
    patternId: 'team-grid',
    slots: [
      {
        propPath: 'members[].avatar',
        promptTemplate: 'Professional headshot of {name}, {role}. Corporate portrait, friendly, approachable, neutral background',
        size: '256x256',
        style: 'photo',
        priority: 'medium',
      },
    ],
  },
];

/**
 * Get image generation config for a pattern
 */
export function getPatternImageConfig(patternId: string): ImageGenerationConfig | undefined {
  return PATTERN_IMAGE_CONFIGS.find(c => c.patternId === patternId);
}

/**
 * Check if a pattern needs images
 */
export function patternNeedsImages(patternId: string): boolean {
  return PATTERN_IMAGE_CONFIGS.some(c => c.patternId === patternId);
}

/**
 * Get all patterns that need images
 */
export function getPatternsNeedingImages(): string[] {
  return PATTERN_IMAGE_CONFIGS.map(c => c.patternId);
}

export interface ImageGenerationContext {
  projectName: string;
  domain: string;
  industry?: string;
  primaryColor?: string;
  audience?: string;
}

export interface GeneratedImageResult {
  slotPath: string;
  imageUrl: string;
  cached: boolean;
}

export interface PatternImageGenerationResult {
  props: Record<string, unknown>;
  generatedImages: GeneratedImageResult[];
  errors: string[];
}

/**
 * Generate all images for a pattern's props
 */
export async function generatePatternImages(
  patternId: string,
  props: Record<string, unknown>,
  context: ImageGenerationContext,
  options: {
    skipLowPriority?: boolean;
    maxConcurrent?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<PatternImageGenerationResult> {
  const config = getPatternImageConfig(patternId);
  
  if (!config) {
    return { props, generatedImages: [], errors: [] };
  }

  const { skipLowPriority = false, maxConcurrent = 3, onProgress } = options;
  const generatedImages: GeneratedImageResult[] = [];
  const errors: string[] = [];
  let updatedProps = { ...props };

  // Filter slots by priority
  const slots = skipLowPriority 
    ? config.slots.filter(s => s.priority !== 'low')
    : config.slots;

  // Collect all image generation tasks
  const tasks: Array<{
    slot: typeof slots[0];
    itemIndex?: number;
    item?: Record<string, unknown>;
  }> = [];

  for (const slot of slots) {
    if (slot.propPath.includes('[]')) {
      // Array slot (e.g., "features[].image")
      const [arrayProp, itemProp] = slot.propPath.split('[].');
      const array = props[arrayProp] as Record<string, unknown>[] | undefined;
      
      if (Array.isArray(array)) {
        array.forEach((item, index) => {
          // Only generate if no image exists
          if (!item[itemProp] || isPlaceholder(item[itemProp] as string)) {
            tasks.push({ slot, itemIndex: index, item });
          }
        });
      }
    } else {
      // Direct slot (e.g., "backgroundImage")
      if (!props[slot.propPath] || isPlaceholder(props[slot.propPath] as string)) {
        tasks.push({ slot });
      }
    }
  }

  // Process in batches
  let completed = 0;
  const total = tasks.length;

  for (let i = 0; i < tasks.length; i += maxConcurrent) {
    const batch = tasks.slice(i, i + maxConcurrent);
    
    const results = await Promise.allSettled(
      batch.map(async (task) => {
        const { slot, itemIndex, item } = task;
        
        // Build prompt from template
        const prompt = buildPrompt(slot.promptTemplate, {
          ...context,
          ...(item || {}),
        });
        
        // Generate image
        const result = await callImageApi(prompt, slot.size, slot.style);
        
        return { slot, itemIndex, result };
      })
    );

    // Process results
    for (const result of results) {
      completed++;
      onProgress?.(completed, total);

      if (result.status === 'fulfilled') {
        const { slot, itemIndex, result: imageResult } = result.value;
        
        if (imageResult.success && imageResult.imageUrl) {
          // Update props
          if (slot.propPath.includes('[]') && itemIndex !== undefined) {
            const [arrayProp, itemProp] = slot.propPath.split('[].');
            const array = [...(updatedProps[arrayProp] as Record<string, unknown>[])];
            array[itemIndex] = { ...array[itemIndex], [itemProp]: imageResult.imageUrl };
            updatedProps = { ...updatedProps, [arrayProp]: array };
          } else {
            updatedProps = { ...updatedProps, [slot.propPath]: imageResult.imageUrl };
          }
          
          generatedImages.push({
            slotPath: itemIndex !== undefined 
              ? slot.propPath.replace('[]', `[${itemIndex}]`)
              : slot.propPath,
            imageUrl: imageResult.imageUrl,
            cached: imageResult.cached || false,
          });
        } else {
          errors.push(`Failed to generate ${slot.propPath}: ${imageResult.error}`);
        }
      } else {
        errors.push(`Error generating image: ${result.reason}`);
      }
    }
  }

  return { props: updatedProps, generatedImages, errors };
}

/**
 * Build prompt from template with context values
 */
function buildPrompt(
  template: string, 
  context: Record<string, unknown>
): string {
  let prompt = template;
  
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
  }
  
  // Remove any remaining placeholders
  prompt = prompt.replace(/\{[^}]+\}/g, '');
  
  return prompt.trim();
}

/**
 * Check if a URL is a placeholder
 */
function isPlaceholder(url: string): boolean {
  if (!url || typeof url !== 'string') return true;
  if (url === '') return true;
  if (url.includes('placeholder') || url.includes('placehold.co')) return true;
  if (url.startsWith('/') && !url.startsWith('/api')) return true;
  return false;
}

/**
 * Call the image generation API
 */
async function callImageApi(
  prompt: string,
  size: string,
  style: string
): Promise<{ success: boolean; imageUrl?: string; cached?: boolean; error?: string }> {
  try {
    // Map size to aspect ratio
    const aspectRatioMap: Record<string, string> = {
      '256x256': '1:1',
      '512x512': '1:1',
      '1024x1024': '1:1',
      '1920x600': '21:9',
      '1344x768': '16:9',
    };
    
    const response = await fetch('/api/generate/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        style,
        aspectRatio: aspectRatioMap[size] || '1:1',
        model: 'schnell', // Fast model for previews
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    
    if (!data.success || !data.imageUrl) {
      return { success: false, error: data.error || 'No image URL returned' };
    }

    return { 
      success: true, 
      imageUrl: data.imageUrl,
      cached: data.cached || false,
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate images for all sections in a composition
 */
export async function generateCompositionSectionImages(
  sections: SectionComposition[],
  context: ImageGenerationContext,
  options: {
    skipLowPriority?: boolean;
    maxConcurrent?: number;
    onProgress?: (sectionIndex: number, totalSections: number, imageProgress: { current: number; total: number }) => void;
  } = {}
): Promise<{
  sections: SectionComposition[];
  stats: { generated: number; cached: number; failed: number };
}> {
  const updatedSections: SectionComposition[] = [];
  const stats = { generated: 0, cached: 0, failed: 0 };

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    if (patternNeedsImages(section.patternId)) {
      const result = await generatePatternImages(
        section.patternId,
        section.props,
        context,
        {
          skipLowPriority: options.skipLowPriority,
          maxConcurrent: options.maxConcurrent,
          onProgress: (current, total) => {
            options.onProgress?.(i, sections.length, { current, total });
          },
        }
      );
      
      updatedSections.push({ ...section, props: result.props });
      
      // Update stats
      for (const img of result.generatedImages) {
        if (img.cached) {
          stats.cached++;
        } else {
          stats.generated++;
        }
      }
      stats.failed += result.errors.length;
    } else {
      updatedSections.push(section);
    }
  }

  return { sections: updatedSections, stats };
}

/**
 * Get image generation stats for a composition
 */
export function getImageGenerationStats(sections: SectionComposition[]): {
  patternsNeedingImages: number;
  estimatedImages: number;
  estimatedTime: string;
} {
  let patterns = 0;
  let images = 0;

  for (const section of sections) {
    const config = getPatternImageConfig(section.patternId);
    if (config) {
      patterns++;
      for (const slot of config.slots) {
        if (slot.propPath.includes('[]')) {
          const [arrayProp] = slot.propPath.split('[].');
          const array = section.props[arrayProp] as unknown[];
          images += array?.length || 3; // Estimate 3 if not known
        } else {
          images++;
        }
      }
    }
  }

  // Estimate ~2 seconds per image
  const seconds = images * 2;
  const estimatedTime = seconds < 60 
    ? `~${seconds}s` 
    : `~${Math.ceil(seconds / 60)}m`;

  return { patternsNeedingImages: patterns, estimatedImages: images, estimatedTime };
}

