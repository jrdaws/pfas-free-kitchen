/**
 * Website Analyzer
 * 
 * Combines all analysis modules to provide comprehensive website analysis.
 * This is the main entry point for deep website analysis from inspiration URLs.
 */

import { takeScreenshot, type ScreenshotResult } from "./screenshot";
import { analyzePageStructure, type PageStructure } from "./structure-analyzer";
import { detectComponents, type DetectedComponents } from "./component-detector";
import { detectFeatures, type DetectedFeatures } from "./feature-detector";
import { extractColorsFromScreenshot, type ColorPalette } from "./color-extractor";

// ============================================================================
// Types
// ============================================================================

export interface WebsiteAnalysis {
  url: string;
  analyzedAt: string;
  
  // Visual analysis
  visual: {
    colors: ColorPalette;
    screenshot?: string;  // base64 (optional, can be large)
  };
  
  // Structure analysis
  structure: PageStructure;
  
  // Component styles
  components: DetectedComponents;
  
  // Detected features
  features: DetectedFeatures;
  
  // Raw content (for AI context)
  extractedContent?: string;
  
  // Analysis metadata
  metadata: {
    screenshotSuccess: boolean;
    structureSuccess: boolean;
    componentSuccess: boolean;
    featureSuccess: boolean;
    colorSuccess: boolean;
    totalAnalysisTime: number;
  };
}

export interface AnalysisOptions {
  includeScreenshot?: boolean;  // Include base64 screenshot in results
  extractContent?: boolean;     // Also extract text content
  parallel?: boolean;           // Run analyses in parallel (faster but more API calls)
}

export interface AnalysisResult {
  success: boolean;
  analysis: WebsiteAnalysis | null;
  error?: string;
  warnings?: string[];
}

// ============================================================================
// Default Analysis (when all else fails)
// ============================================================================

function getDefaultAnalysis(url: string): WebsiteAnalysis {
  return {
    url,
    analyzedAt: new Date().toISOString(),
    visual: {
      colors: {
        primary: "#F97316",
        secondary: "#EA580C",
        accent: "#FB923C",
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        muted: "#78716C",
      },
    },
    structure: {
      sections: [
        { type: "hero", position: 1, layout: "centered", hasImage: false, hasVideo: false, estimatedHeight: "full-viewport" },
        { type: "features", position: 2, layout: "grid", hasImage: true, hasVideo: false, estimatedHeight: "large" },
        { type: "cta", position: 3, layout: "centered", hasImage: false, hasVideo: false, estimatedHeight: "medium" },
        { type: "footer", position: 4, layout: "full-width", hasImage: false, hasVideo: false, estimatedHeight: "small" },
      ],
      navigation: { type: "sticky", items: ["Home", "Features", "Pricing"], hasCta: true, hasLogo: true, hasMobileMenu: true },
      footer: { columns: 4, hasNewsletter: true, hasSocialLinks: true, hasLogo: true },
      overallStyle: "modern",
      colorTheme: "dark",
    },
    components: {
      buttons: { style: "solid", shape: "rounded", sizes: ["md", "lg"] },
      cards: { style: "elevated", hasImage: true, hasIcon: true, rounded: "lg" },
      forms: { inputStyle: "outline", hasLabels: true, hasFloatingLabels: false, rounded: "md" },
      images: { style: "rounded", hasOverlays: false, hasShadows: true },
      typography: { headingStyle: "bold", bodyStyle: "regular", hasAccentFont: false, textAlignment: "left" },
      spacing: { density: "comfortable", sectionPadding: "large" },
      animations: { hasAnimations: true, types: ["fade"] },
    },
    features: {
      auth: { hasLogin: true, hasSignup: true, hasSocialAuth: false, providers: [] },
      ecommerce: { hasCart: false, hasProducts: false, hasCheckout: false, hasPricing: true, hasWishlist: false },
      content: { hasBlog: false, hasSearch: false, hasFilters: false, hasPagination: false, hasCategories: false },
      social: { hasProfiles: false, hasComments: false, hasLikes: false, hasSharing: false, hasFollowing: false },
      communication: { hasContactForm: true, hasChat: false, hasNewsletter: true, hasSupport: false },
      dashboard: { hasDashboard: false, hasAnalytics: false, hasSettings: false, hasNotifications: false },
      summary: ["Default analysis - screenshot failed"],
    },
    metadata: {
      screenshotSuccess: false,
      structureSuccess: false,
      componentSuccess: false,
      featureSuccess: false,
      colorSuccess: false,
      totalAnalysisTime: 0,
    },
  };
}

// ============================================================================
// Main Analyzer
// ============================================================================

/**
 * Perform comprehensive analysis of a website.
 */
export async function analyzeWebsite(
  url: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  
  const { 
    includeScreenshot = false,
    parallel = true,
  } = options;

  // Step 1: Take screenshot
  console.log("[WebsiteAnalyzer] Taking screenshot of:", url);
  const screenshotResult = await takeScreenshot(url);
  
  if (!screenshotResult.success || !screenshotResult.viewport) {
    warnings.push(`Screenshot failed: ${screenshotResult.error}`);
    console.warn("[WebsiteAnalyzer] Screenshot failed, using defaults");
    
    return {
      success: true,  // Partial success is still success
      analysis: getDefaultAnalysis(url),
      warnings,
    };
  }

  const screenshot = screenshotResult.viewport;
  
  // Step 2: Run analyses (in parallel or sequential)
  let structureResult;
  let componentResult;
  let featureResult;
  let colorResult;

  if (parallel) {
    console.log("[WebsiteAnalyzer] Running parallel analysis...");
    
    [structureResult, componentResult, featureResult, colorResult] = await Promise.all([
      analyzePageStructure(screenshot),
      detectComponents(screenshot),
      detectFeatures(screenshot),
      extractColorsFromScreenshot(screenshot),
    ]);
  } else {
    console.log("[WebsiteAnalyzer] Running sequential analysis...");
    
    structureResult = await analyzePageStructure(screenshot);
    componentResult = await detectComponents(screenshot);
    featureResult = await detectFeatures(screenshot);
    colorResult = await extractColorsFromScreenshot(screenshot);
  }

  // Collect warnings
  if (!structureResult.success) warnings.push(`Structure analysis: ${structureResult.error}`);
  if (!componentResult.success) warnings.push(`Component detection: ${componentResult.error}`);
  if (!featureResult.success) warnings.push(`Feature detection: ${featureResult.error}`);
  if (!colorResult.success) warnings.push(`Color extraction: ${colorResult.error}`);

  const totalTime = Date.now() - startTime;
  console.log(`[WebsiteAnalyzer] Analysis complete in ${totalTime}ms`);

  const analysis: WebsiteAnalysis = {
    url,
    analyzedAt: new Date().toISOString(),
    visual: {
      colors: colorResult.palette || getDefaultAnalysis(url).visual.colors,
      screenshot: includeScreenshot ? screenshot : undefined,
    },
    structure: structureResult.structure || getDefaultAnalysis(url).structure,
    components: componentResult.components || getDefaultAnalysis(url).components,
    features: featureResult.features || getDefaultAnalysis(url).features,
    metadata: {
      screenshotSuccess: screenshotResult.success,
      structureSuccess: structureResult.success,
      componentSuccess: componentResult.success,
      featureSuccess: featureResult.success,
      colorSuccess: colorResult.success,
      totalAnalysisTime: totalTime,
    },
  };

  return {
    success: true,
    analysis,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Quick analysis - just structure and colors (faster).
 */
export async function quickAnalyzeWebsite(url: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  
  const screenshotResult = await takeScreenshot(url);
  
  if (!screenshotResult.success || !screenshotResult.viewport) {
    return {
      success: true,
      analysis: getDefaultAnalysis(url),
      warnings: [`Screenshot failed: ${screenshotResult.error}`],
    };
  }

  const [structureResult, colorResult] = await Promise.all([
    analyzePageStructure(screenshotResult.viewport),
    extractColorsFromScreenshot(screenshotResult.viewport),
  ]);

  const analysis: WebsiteAnalysis = {
    url,
    analyzedAt: new Date().toISOString(),
    visual: {
      colors: colorResult.palette || getDefaultAnalysis(url).visual.colors,
    },
    structure: structureResult.structure || getDefaultAnalysis(url).structure,
    components: getDefaultAnalysis(url).components,
    features: getDefaultAnalysis(url).features,
    metadata: {
      screenshotSuccess: true,
      structureSuccess: structureResult.success,
      componentSuccess: false,
      featureSuccess: false,
      colorSuccess: colorResult.success,
      totalAnalysisTime: Date.now() - startTime,
    },
  };

  return { success: true, analysis };
}

// Re-export types for convenience
export type { ColorPalette } from "./color-extractor";
export type { PageStructure, SectionInfo, NavigationInfo, FooterInfo } from "./structure-analyzer";
export type { DetectedComponents, ButtonStyle, CardStyle, FormStyle, TypographyStyle } from "./component-detector";
export type { DetectedFeatures, AuthFeatures, EcommerceFeatures, ContentFeatures } from "./feature-detector";

