/**
 * URL Content Extractor - Enhanced
 * Primary: Firecrawl (better quality, JS rendering, structured extraction, screenshots)
 * Fallback: Jina Reader API (free, no API key required)
 * 
 * Enhanced capabilities:
 * - Structured section analysis (hero, features, pricing, etc.)
 * - Screenshot capture for visual analysis
 * - Navigation and feature detection
 * - Branding/color extraction
 * 
 * Note: All extractions have a 15-second timeout for screenshot capture
 */

import FirecrawlApp from "@mendable/firecrawl-js";

// Timeout for each URL extraction (15 seconds for screenshot capture)
const EXTRACTION_TIMEOUT_MS = 15000;

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

// Enhanced section analysis types
export interface WebsiteSection {
  type: "hero" | "features" | "pricing" | "testimonials" | "cta" | "faq" | "footer" | "other";
  headline?: string;
  description?: string;
  hasImage: boolean;
  hasCTA: boolean;
}

export interface NavigationAnalysis {
  items: string[];
  hasSearch: boolean;
  hasCTA: boolean;
}

export interface FeatureDetection {
  hasLogin: boolean;
  hasSignup: boolean;
  hasCart: boolean;
  hasPricing: boolean;
  hasBlog: boolean;
  hasSearch: boolean;
  hasNewsletter: boolean;
}

export interface BrandingAnalysis {
  primaryColor?: string;
  secondaryColor?: string;
  fontStyle: "modern" | "classic" | "playful" | "technical";
}

export interface EnhancedStructuredData {
  // Original fields
  features?: string[];
  designPatterns?: string[];
  targetAudience?: string;
  techStack?: string[];
  pricing?: string;
  // Enhanced fields
  sections?: WebsiteSection[];
  navigation?: NavigationAnalysis;
  detectedFeatures?: FeatureDetection;
  branding?: BrandingAnalysis;
}

export interface ExtractedContent {
  url: string;
  title: string;
  description: string;
  content: string;
  links: string[];
  images: string[];
  success: boolean;
  error?: string;
  source: "firecrawl" | "jina" | "failed";
  // Screenshot (base64) for visual analysis
  screenshot?: string;
  // Enhanced structured extraction
  structured?: EnhancedStructuredData;
}

// Enhanced Firecrawl extraction schema for comprehensive website analysis
const ENHANCED_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    features: {
      type: "array",
      items: { type: "string" },
      description: "List of product features or capabilities mentioned",
    },
    designPatterns: {
      type: "array",
      items: { type: "string" },
      description: "UI/UX design patterns observed (e.g., 'hero section', 'pricing table', 'testimonials')",
    },
    targetAudience: {
      type: "string",
      description: "Who this product/website is targeting",
    },
    techStack: {
      type: "array",
      items: { type: "string" },
      description: "Technologies or frameworks mentioned",
    },
    pricing: {
      type: "string",
      description: "Pricing information if available",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { 
            type: "string",
            enum: ["hero", "features", "pricing", "testimonials", "cta", "faq", "footer", "other"],
          },
          headline: { type: "string" },
          description: { type: "string" },
          hasImage: { type: "boolean" },
          hasCTA: { type: "boolean" },
        },
      },
      description: "Distinct sections from top to bottom of the page",
    },
    navigation: {
      type: "object",
      properties: {
        items: { type: "array", items: { type: "string" } },
        hasSearch: { type: "boolean" },
        hasCTA: { type: "boolean" },
      },
      description: "Navigation menu analysis",
    },
    detectedFeatures: {
      type: "object",
      properties: {
        hasLogin: { type: "boolean" },
        hasSignup: { type: "boolean" },
        hasCart: { type: "boolean" },
        hasPricing: { type: "boolean" },
        hasBlog: { type: "boolean" },
        hasSearch: { type: "boolean" },
        hasNewsletter: { type: "boolean" },
      },
      description: "Detected site features",
    },
    branding: {
      type: "object",
      properties: {
        primaryColor: { type: "string" },
        secondaryColor: { type: "string" },
        fontStyle: { 
          type: "string",
          enum: ["modern", "classic", "playful", "technical"],
        },
      },
      description: "Branding and color analysis",
    },
  },
  required: ["features"],
};

// System prompt for enhanced extraction
const EXTRACTION_SYSTEM_PROMPT = `
Analyze this webpage as a product designer would.
Identify all distinct sections from top to bottom.
Look for common patterns: hero sections, feature grids, testimonials, pricing tables.
Detect if the site has authentication, e-commerce, or content features.
Identify the color scheme and typography style.
For sections, describe what each section contains and its purpose.
`;

/**
 * Extract content using Firecrawl (primary method) - Enhanced with screenshots + structured data
 */
async function extractWithFirecrawl(url: string, options?: { 
  includeScreenshot?: boolean;
  enhancedExtraction?: boolean;
}): Promise<ExtractedContent | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.log("[URL Extractor] Firecrawl API key not configured, skipping");
    return null;
  }

  const { includeScreenshot = true, enhancedExtraction = true } = options || {};

  try {
    const firecrawl = new FirecrawlApp({ apiKey });

    // Build formats array based on options
    const formats: string[] = ["markdown"];
    if (includeScreenshot) {
      formats.push("screenshot@fullPage");
    }

    // Build scrape options
    const scrapeOptions: Record<string, unknown> = {
      formats,
    };

    // Add enhanced extraction schema if enabled
    if (enhancedExtraction) {
      scrapeOptions.extract = {
        schema: ENHANCED_EXTRACTION_SCHEMA,
        systemPrompt: EXTRACTION_SYSTEM_PROMPT,
      };
    }

    console.log(`[Firecrawl] Extracting ${url} with screenshot=${includeScreenshot}, enhanced=${enhancedExtraction}`);

    // Use any to handle varying API responses
    const result = await firecrawl.scrape(url, scrapeOptions) as Record<string, unknown>;

    // Handle both old and new API response formats
    const isSuccess = result.success !== false && !result.error;
    if (!isSuccess) {
      console.warn(`[Firecrawl] Failed for ${url}:`, result.error);
      return null;
    }

    const markdown = (result.markdown || result.content || "") as string;
    const metadata = (result.metadata || {}) as Record<string, unknown>;
    const links = (result.links || []) as string[];
    const screenshot = result.screenshot as string | undefined;
    
    const extractData = (result.extract || {}) as EnhancedStructuredData;

    // Build enhanced structured data
    const structured: EnhancedStructuredData | undefined = extractData.features ? {
      features: extractData.features || [],
      designPatterns: extractData.designPatterns || [],
      targetAudience: extractData.targetAudience,
      techStack: extractData.techStack || [],
      pricing: extractData.pricing,
      // Enhanced fields
      sections: extractData.sections,
      navigation: extractData.navigation,
      detectedFeatures: extractData.detectedFeatures,
      branding: extractData.branding,
    } : undefined;

    console.log(`[Firecrawl] Success for ${url}: screenshot=${!!screenshot}, sections=${structured?.sections?.length || 0}`);

    return {
      url,
      title: (metadata.title as string) || extractTitle(markdown) || url,
      description: (metadata.description as string) || extractDescription(markdown),
      content: markdown.slice(0, 5000),
      links,
      images: metadata.ogImage ? [metadata.ogImage as string] : [],
      success: true,
      source: "firecrawl",
      screenshot,
      structured,
    };
  } catch (error) {
    console.error(`[Firecrawl] Error for ${url}:`, error);
    return null;
  }
}

/**
 * Extract content using Jina Reader API (fallback)
 * Jina Reader is free and doesn't require an API key for basic usage
 */
async function extractWithJina(url: string): Promise<ExtractedContent | null> {
  try {
    // Jina Reader API - prefix URL with r.jina.ai to get clean markdown
    const jinaUrl = `https://r.jina.ai/${url}`;

    const response = await fetch(jinaUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain",
      },
    });

    if (!response.ok) {
      console.warn(`[Jina] Failed for ${url}: ${response.status}`);
      return null;
    }

    const text = await response.text();

    return {
      url,
      title: extractTitle(text) || url,
      description: extractDescription(text),
      content: text.slice(0, 5000),
      links: extractLinks(text),
      images: [],
      success: true,
      source: "jina",
    };
  } catch (error) {
    console.error(`[Jina] Error for ${url}:`, error);
    return null;
  }
}

export interface ExtractionOptions {
  /** Include full-page screenshot (default: true for Firecrawl) */
  includeScreenshot?: boolean;
  /** Use enhanced extraction schema with sections, navigation, branding (default: true) */
  enhancedExtraction?: boolean;
  /** Timeout in milliseconds (default: 15000) */
  timeout?: number;
}

/**
 * Extract content from a URL with timeout
 * Tries Firecrawl first (if configured), falls back to Jina
 * Enhanced mode includes screenshots and structured section analysis
 */
export async function extractUrlContent(
  url: string, 
  options?: ExtractionOptions
): Promise<ExtractedContent> {
  const { 
    includeScreenshot = true, 
    enhancedExtraction = true,
    timeout = EXTRACTION_TIMEOUT_MS,
  } = options || {};

  console.log(`[URL Extractor] Extracting: ${url} (screenshot=${includeScreenshot}, enhanced=${enhancedExtraction})`);

  // Try Firecrawl first (better quality) with timeout
  try {
    const firecrawlResult = await withTimeout(
      extractWithFirecrawl(url, { includeScreenshot, enhancedExtraction }),
      timeout,
      `Firecrawl timeout for ${url}`
    );
    if (firecrawlResult) {
      console.log(`[URL Extractor] Success via Firecrawl: ${url}`);
      return firecrawlResult;
    }
  } catch (error) {
    console.warn(`[URL Extractor] Firecrawl failed/timed out for ${url}:`, error);
  }

  // Fall back to Jina Reader with timeout (no screenshot support)
  try {
    const jinaResult = await withTimeout(
      extractWithJina(url),
      timeout,
      `Jina timeout for ${url}`
    );
    if (jinaResult) {
      console.log(`[URL Extractor] Success via Jina: ${url}`);
      return jinaResult;
    }
  } catch (error) {
    console.warn(`[URL Extractor] Jina failed/timed out for ${url}:`, error);
  }

  // Both failed
  console.error(`[URL Extractor] All methods failed for: ${url}`);
  return {
    url,
    title: url,
    description: "",
    content: "",
    links: [],
    images: [],
    success: false,
    error: "Failed to extract content from URL",
    source: "failed",
  };
}

/**
 * Extract content from multiple URLs in parallel
 */
export async function extractMultipleUrls(
  urls: string[], 
  options?: ExtractionOptions
): Promise<ExtractedContent[]> {
  const results = await Promise.allSettled(
    urls.map((url) => extractUrlContent(url, options))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      url: urls[index],
      title: urls[index],
      description: "",
      content: "",
      links: [],
      images: [],
      success: false,
      error: "Failed to extract",
      source: "failed" as const,
    };
  });
}

// Priority patterns for identifying important subpages
const PRIORITY_PAGE_PATTERNS = [
  /\/pricing/i,
  /\/features/i,
  /\/about/i,
  /\/product/i,
  /\/login/i,
  /\/signup/i,
  /\/blog/i,
  /\/docs/i,
  /\/solutions/i,
];

/**
 * Identify important subpages from a list of links
 */
export function identifyImportantPages(links: string[], baseUrl: string): string[] {
  const base = new URL(baseUrl);
  
  return links
    .filter(link => {
      try {
        const url = new URL(link, baseUrl);
        // Only same-domain links
        if (url.hostname !== base.hostname) return false;
        // Match priority patterns
        return PRIORITY_PAGE_PATTERNS.some(p => p.test(url.pathname));
      } catch {
        return false;
      }
    })
    .slice(0, 5);
}

/**
 * Analyze multiple pages from a website (homepage + key subpages)
 */
export async function analyzeMultiplePages(baseUrl: string, options?: {
  maxSubpages?: number;
  includeScreenshot?: boolean;
}): Promise<{
  homepage: ExtractedContent;
  subpages: Record<string, ExtractedContent>;
}> {
  const { maxSubpages = 3, includeScreenshot = true } = options || {};

  // First, get homepage
  const homepage = await extractUrlContent(baseUrl, { includeScreenshot });
  
  // Identify important subpages from navigation
  const importantPages = identifyImportantPages(homepage.links, baseUrl);
  
  // Analyze subpages (without screenshots to save time/cost)
  const subpages: Record<string, ExtractedContent> = {};
  
  for (const page of importantPages.slice(0, maxSubpages)) {
    try {
      const analysis = await extractUrlContent(page, { 
        includeScreenshot: false,  // Skip screenshots for subpages
        enhancedExtraction: true,
      });
      subpages[page] = analysis;
    } catch (e) {
      console.warn(`[Multi-page] Failed to analyze ${page}:`, e);
    }
  }
  
  return { homepage, subpages };
}

// Helper functions - all defensive against null/undefined
function extractTitle(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  
  // Try to find a title in markdown format
  const h1Match = text.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  // Try first line if it looks like a title
  const firstLine = text.split("\n")[0]?.trim();
  if (firstLine && firstLine.length < 100) return firstLine;

  return "";
}

function extractDescription(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  
  // Get first paragraph after title
  const paragraphs = text.split(/\n\n+/);
  for (const p of paragraphs) {
    const clean = p.replace(/^#+\s+/, "").trim();
    if (clean.length > 50 && clean.length < 500 && !clean.startsWith("#")) {
      return clean;
    }
  }
  return text.slice(0, 200).trim();
}

function extractLinks(text: string | null | undefined): string[] {
  if (!text || typeof text !== "string") return [];
  
  const linkRegex = /https?:\/\/[^\s\)>\]]+/g;
  const matches = text.match(linkRegex) || [];
  return [...new Set(matches)].slice(0, 20);
}
