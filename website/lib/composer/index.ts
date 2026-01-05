/**
 * AI Pattern Composer
 * 
 * The core engine that selects and combines modular patterns into complete,
 * personalized page compositions based on user requirements.
 * 
 * Flow:
 * User Vision + Research → Composer → Composed Page Structure → Renderer
 */

import type {
  ComposerInput,
  ComposerOutput,
  PageComposition,
  ProjectComposition,
  SectionComposition,
  PatternReasoning,
  GlobalStyles,
  CompositionMetadata,
  PageConfig,
  LayoutType,
  ColorScheme,
} from "./types";
import { selectPatterns, getAvailablePatterns, getPatternById } from "./selector";
import { generatePatternProps, generatePropsForPattern } from "./prop-generator";
import { generateCustomSection, canFulfillWithPattern } from "./gap-filler";

// ============================================================================
// Color Scheme Extraction
// ============================================================================

function extractColorScheme(input: ComposerInput): ColorScheme {
  // Default dark theme colors
  const defaults: ColorScheme = {
    primary: "#F97316",    // Orange
    secondary: "#EA580C",
    accent: "#FB923C",
    background: "#0A0A0A",
    foreground: "#FFFFFF",
    muted: "#78716C",
  };
  
  // Could be enhanced to extract from research or integrations
  // For now, use defaults or template-based overrides
  const templateColors: Record<string, Partial<ColorScheme>> = {
    saas: { primary: "#F97316", secondary: "#EA580C" },
    ecommerce: { primary: "#10B981", secondary: "#059669" },
    blog: { primary: "#6366F1", secondary: "#4F46E5" },
    portfolio: { primary: "#8B5CF6", secondary: "#7C3AED" },
    dashboard: { primary: "#3B82F6", secondary: "#2563EB" },
  };
  
  return {
    ...defaults,
    ...templateColors[input.template] || {},
  };
}

// ============================================================================
// Single Page Composition
// ============================================================================

export async function composePage(
  input: ComposerInput,
  page: PageConfig
): Promise<PageComposition> {
  const startTime = Date.now();
  const patterns = getAvailablePatterns();
  
  // Step 1: Select patterns for this page
  const selection = await selectPatterns({
    vision: input.vision,
    research: input.research,
    availablePatterns: patterns,
    pageType: page.type,
  });
  
  // Step 2: Generate props for each selected pattern
  const sections: SectionComposition[] = [];
  
  for (const selected of selection.sections) {
    const pattern = getPatternById(selected.patternId);
    
    if (!pattern) {
      console.warn(`[Composer] Pattern not found: ${selected.patternId}`);
      continue;
    }
    
    const propsResult = await generatePatternProps({
      pattern,
      context: input,
      sectionIndex: selected.order,
    });
    
    sections.push({
      patternId: selected.patternId,
      variant: selected.variant,
      order: selected.order,
      props: propsResult.props,
      isCustomGenerated: false,
    });
  }
  
  // Sort sections by order
  sections.sort((a, b) => a.order - b.order);
  
  return {
    pageId: `${page.path.replace(/\//g, "-").replace(/^-/, "")}`,
    path: page.path,
    layout: selection.layoutRecommendation,
    sections,
  };
}

// ============================================================================
// Full Project Composition
// ============================================================================

export async function composeProject(
  input: ComposerInput
): Promise<ComposerOutput> {
  const startTime = Date.now();
  const pages: PageComposition[] = [];
  const allReasoning: PatternReasoning[] = [];
  const warnings: string[] = [];
  
  // Compose each page
  for (const page of input.pages) {
    try {
      const pageComposition = await composePage(input, page);
      pages.push(pageComposition);
      
      // Collect reasoning (from selection step)
      const patterns = getAvailablePatterns();
      const selection = await selectPatterns({
        vision: input.vision,
        research: input.research,
        availablePatterns: patterns,
        pageType: page.type,
      });
      
      for (const selected of selection.sections) {
        allReasoning.push({
          patternId: selected.patternId,
          pageId: pageComposition.pageId,
          reason: selected.reason,
          confidenceScore: selected.confidenceScore,
        });
      }
    } catch (error) {
      console.error(`[Composer] Failed to compose page ${page.path}:`, error);
      warnings.push(`Failed to compose page: ${page.path}`);
    }
  }
  
  // Identify shared components (patterns used across multiple pages)
  const patternUsage: Record<string, number> = {};
  for (const page of pages) {
    for (const section of page.sections) {
      patternUsage[section.patternId] = (patternUsage[section.patternId] || 0) + 1;
    }
  }
  const sharedComponents = Object.entries(patternUsage)
    .filter(([_, count]) => count > 1)
    .map(([patternId]) => patternId);
  
  // Calculate overall confidence
  const confidenceScores = allReasoning.map(r => r.confidenceScore);
  const averageConfidence = confidenceScores.length > 0
    ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
    : 75;
  
  const generationTime = Date.now() - startTime;
  
  const composition: ProjectComposition = {
    projectId: generateProjectId(input.vision.projectName),
    pages,
    globalStyles: {
      colorScheme: extractColorScheme(input),
      fontFamily: {
        heading: "Inter",
        body: "Inter",
        mono: "JetBrains Mono",
      },
      borderRadius: "md",
      spacing: "comfortable",
    },
    sharedComponents,
    metadata: {
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      confidence: averageConfidence,
      generationTime,
    },
  };
  
  return {
    composition,
    reasoning: allReasoning,
    confidence: averageConfidence,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// ============================================================================
// Regenerate Section
// ============================================================================

export async function regenerateSection(
  composition: ProjectComposition,
  pageId: string,
  sectionIndex: number,
  feedback?: string,
  context?: ComposerInput
): Promise<SectionComposition> {
  const page = composition.pages.find(p => p.pageId === pageId);
  if (!page) {
    throw new Error(`Page not found: ${pageId}`);
  }
  
  const section = page.sections[sectionIndex];
  if (!section) {
    throw new Error(`Section not found at index: ${sectionIndex}`);
  }
  
  const pattern = getPatternById(section.patternId);
  if (!pattern || !context) {
    // Return existing section if we can't regenerate
    return section;
  }
  
  // Regenerate props with feedback context
  const enhancedContext: ComposerInput = {
    ...context,
    preferences: {
      ...context.preferences,
      customInstructions: feedback,
    },
  };
  
  const propsResult = await generatePatternProps({
    pattern,
    context: enhancedContext,
    sectionIndex,
  });
  
  return {
    ...section,
    props: propsResult.props,
  };
}

// ============================================================================
// Fill Gap with Custom Section
// ============================================================================

export async function fillGap(
  requirement: string,
  context: ComposerInput,
  surroundingSections: SectionComposition[] = []
): Promise<SectionComposition> {
  const patterns = getAvailablePatterns();
  
  // First, check if an existing pattern can fulfill this
  const matchingPattern = canFulfillWithPattern(requirement, patterns);
  
  if (matchingPattern) {
    const propsResult = await generatePatternProps({
      pattern: matchingPattern,
      context,
      sectionIndex: 0,
    });
    
    return {
      patternId: matchingPattern.id,
      variant: "dark",
      order: 0,
      props: propsResult.props,
      isCustomGenerated: false,
    };
  }
  
  // Generate custom component
  const customResult = await generateCustomSection({
    requirement,
    context,
    existingPatterns: patterns,
    surroundingSections,
  });
  
  return {
    patternId: customResult.patternId,
    variant: "custom",
    order: 0,
    props: customResult.props,
    isCustomGenerated: true,
    customizations: {
      className: "custom-generated-section",
    },
  };
}

// ============================================================================
// Utilities
// ============================================================================

function generateProjectId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const hash = Math.random().toString(36).substring(2, 8);
  return `${slug}-${hash}`;
}

// ============================================================================
// Re-exports
// ============================================================================

export { getAvailablePatterns, getPatternById, getPatternsByCategory } from "./selector";
export { generatePatternProps, generatePropsForPattern } from "./prop-generator";
export { generateCustomSection, canFulfillWithPattern } from "./gap-filler";
export * from "./types";

