/**
 * URL Content Extractor
 * Primary: Firecrawl (better quality, JS rendering, structured extraction)
 * Fallback: Jina Reader API (free, no API key required)
 */

import FirecrawlApp from "@mendable/firecrawl-js";

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
  // Firecrawl structured extraction (when available)
  structured?: {
    features?: string[];
    designPatterns?: string[];
    targetAudience?: string;
    techStack?: string[];
    pricing?: string;
  };
}

// Firecrawl extraction schema for websites
const EXTRACTION_SCHEMA = {
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
  },
  required: ["features"],
};

/**
 * Extract content using Firecrawl (primary method)
 */
async function extractWithFirecrawl(url: string): Promise<ExtractedContent | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.log("[URL Extractor] Firecrawl API key not configured, skipping");
    return null;
  }

  try {
    const firecrawl = new FirecrawlApp({ apiKey });

    // Use any to handle varying API responses
    const result = await firecrawl.scrape(url, {
      formats: ["markdown"],
    }) as Record<string, unknown>;

    // Handle both old and new API response formats
    const isSuccess = result.success !== false && !result.error;
    if (!isSuccess) {
      console.warn(`[Firecrawl] Failed for ${url}:`, result.error);
      return null;
    }

    const markdown = (result.markdown || result.content || "") as string;
    const metadata = (result.metadata || {}) as Record<string, unknown>;
    const links = (result.links || []) as string[];
    
    const extractData = (result.extract || {}) as {
      features?: string[];
      designPatterns?: string[];
      targetAudience?: string;
      techStack?: string[];
      pricing?: string;
    };

    return {
      url,
      title: (metadata.title as string) || extractTitle(markdown) || url,
      description: (metadata.description as string) || extractDescription(markdown),
      content: markdown.slice(0, 5000),
      links,
      images: metadata.ogImage ? [metadata.ogImage as string] : [],
      success: true,
      source: "firecrawl",
      structured: extractData.features ? {
        features: extractData.features || [],
        designPatterns: extractData.designPatterns || [],
        targetAudience: extractData.targetAudience,
        techStack: extractData.techStack || [],
        pricing: extractData.pricing,
      } : undefined,
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

/**
 * Extract content from a URL
 * Tries Firecrawl first (if configured), falls back to Jina
 */
export async function extractUrlContent(url: string): Promise<ExtractedContent> {
  console.log(`[URL Extractor] Extracting: ${url}`);

  // Try Firecrawl first (better quality)
  const firecrawlResult = await extractWithFirecrawl(url);
  if (firecrawlResult) {
    console.log(`[URL Extractor] Success via Firecrawl: ${url}`);
    return firecrawlResult;
  }

  // Fall back to Jina Reader
  const jinaResult = await extractWithJina(url);
  if (jinaResult) {
    console.log(`[URL Extractor] Success via Jina: ${url}`);
    return jinaResult;
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
export async function extractMultipleUrls(urls: string[]): Promise<ExtractedContent[]> {
  const results = await Promise.allSettled(urls.map((url) => extractUrlContent(url)));

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

// Helper functions
function extractTitle(text: string): string {
  // Try to find a title in markdown format
  const h1Match = text.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  // Try first line if it looks like a title
  const firstLine = text.split("\n")[0]?.trim();
  if (firstLine && firstLine.length < 100) return firstLine;

  return "";
}

function extractDescription(text: string): string {
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

function extractLinks(text: string): string[] {
  const linkRegex = /https?:\/\/[^\s\)>\]]+/g;
  const matches = text.match(linkRegex) || [];
  return [...new Set(matches)].slice(0, 20);
}
