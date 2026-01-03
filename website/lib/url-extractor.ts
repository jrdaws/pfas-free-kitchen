/**
 * URL Content Extractor
 * Uses Jina Reader API to extract clean content from URLs
 * Free tier: https://jina.ai/reader/
 */

export interface ExtractedContent {
  url: string;
  title: string;
  description: string;
  content: string;
  links: string[];
  images: string[];
  success: boolean;
  error?: string;
}

/**
 * Extract content from a URL using Jina Reader API
 * Jina Reader is free and doesn't require an API key for basic usage
 */
export async function extractUrlContent(url: string): Promise<ExtractedContent> {
  try {
    // Jina Reader API - prefix URL with r.jina.ai to get clean markdown
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    const response = await fetch(jinaUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Return-Format": "markdown",
      },
    });

    if (!response.ok) {
      // Fallback: try text format
      const textResponse = await fetch(jinaUrl, {
        method: "GET",
        headers: {
          "Accept": "text/plain",
        },
      });
      
      if (!textResponse.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const text = await textResponse.text();
      return {
        url,
        title: extractTitle(text) || url,
        description: extractDescription(text),
        content: text.slice(0, 5000), // Limit content size
        links: extractLinks(text),
        images: [],
        success: true,
      };
    }

    const data = await response.json();
    
    return {
      url,
      title: data.title || extractTitle(data.content) || url,
      description: data.description || extractDescription(data.content),
      content: (data.content || "").slice(0, 5000),
      links: data.links || extractLinks(data.content),
      images: data.images || [],
      success: true,
    };
  } catch (error) {
    console.error(`[URL Extractor] Failed to extract ${url}:`, error);
    return {
      url,
      title: url,
      description: "",
      content: "",
      links: [],
      images: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract content",
    };
  }
}

/**
 * Extract content from multiple URLs in parallel
 */
export async function extractMultipleUrls(urls: string[]): Promise<ExtractedContent[]> {
  const results = await Promise.allSettled(
    urls.map(url => extractUrlContent(url))
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

