/**
 * Screenshot Service
 * 
 * Captures screenshots of websites using various providers.
 * Falls back through providers: Browserless -> thum.io -> placeholder
 */

// ============================================================================
// Types
// ============================================================================

export interface ScreenshotResult {
  success: boolean;
  viewport?: string;       // base64 of viewport screenshot
  fullPage?: string;       // base64 of full page (if available)
  metadata?: {
    width: number;
    height: number;
    url: string;
    capturedAt: string;
  };
  error?: string;
}

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  delay?: number;         // Wait time in ms before capture
  waitForSelector?: string;
}

const DEFAULT_OPTIONS: ScreenshotOptions = {
  width: 1280,
  height: 800,
  fullPage: false,
  delay: 2000,
};

// ============================================================================
// Provider: Browserless (Production)
// ============================================================================

async function screenshotWithBrowserless(
  url: string,
  options: ScreenshotOptions
): Promise<ScreenshotResult> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (!token) {
    return { success: false, error: "Browserless token not configured" };
  }

  try {
    const browserlessUrl = process.env.BROWSERLESS_URL || "https://chrome.browserless.io";
    
    const response = await fetch(`${browserlessUrl}/screenshot?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        options: {
          type: "png",
          fullPage: options.fullPage,
        },
        viewport: {
          width: options.width,
          height: options.height,
        },
        waitFor: options.delay,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Browserless error: ${response.status}` };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      success: true,
      viewport: base64,
      metadata: {
        width: options.width || 1280,
        height: options.height || 800,
        url,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Browserless failed",
    };
  }
}

// ============================================================================
// Provider: thum.io (Free fallback)
// ============================================================================

async function screenshotWithThumio(
  url: string,
  options: ScreenshotOptions
): Promise<ScreenshotResult> {
  try {
    const width = options.width || 1280;
    const height = options.height || 800;
    
    // thum.io provides free website thumbnails
    const thumbUrl = `https://image.thum.io/get/width/${width}/crop/${height}/noanimate/${encodeURIComponent(url)}`;
    
    const response = await fetch(thumbUrl);
    if (!response.ok) {
      return { success: false, error: `thum.io error: ${response.status}` };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      success: true,
      viewport: base64,
      metadata: {
        width,
        height,
        url,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "thum.io failed",
    };
  }
}

// ============================================================================
// Provider: ScreenshotAPI (Premium fallback)
// ============================================================================

async function screenshotWithApi(
  url: string,
  options: ScreenshotOptions
): Promise<ScreenshotResult> {
  const apiKey = process.env.SCREENSHOT_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Screenshot API key not configured" };
  }

  try {
    const width = options.width || 1280;
    const height = options.height || 800;
    
    const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodeURIComponent(url)}&output=image&file_type=png&wait_for_event=load&delay=${options.delay || 2000}&width=${width}&height=${height}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return { success: false, error: `Screenshot API error: ${response.status}` };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      success: true,
      viewport: base64,
      fullPage: options.fullPage ? base64 : undefined,
      metadata: {
        width,
        height,
        url,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Screenshot API failed",
    };
  }
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Take a screenshot of a URL using the best available provider.
 * Falls back through: Browserless -> thum.io -> ScreenshotAPI
 */
export async function takeScreenshot(
  url: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Try Browserless first (best quality)
  if (process.env.BROWSERLESS_TOKEN) {
    const result = await screenshotWithBrowserless(url, opts);
    if (result.success) return result;
    console.warn("[Screenshot] Browserless failed, trying fallback:", result.error);
  }

  // Try thum.io (free, good quality)
  const thumbResult = await screenshotWithThumio(url, opts);
  if (thumbResult.success) return thumbResult;
  console.warn("[Screenshot] thum.io failed, trying Screenshot API:", thumbResult.error);

  // Try Screenshot API (paid)
  if (process.env.SCREENSHOT_API_KEY) {
    const apiResult = await screenshotWithApi(url, opts);
    if (apiResult.success) return apiResult;
    console.warn("[Screenshot] Screenshot API failed:", apiResult.error);
  }

  return {
    success: false,
    error: "All screenshot providers failed",
  };
}

/**
 * Quick check if screenshot capability is available
 */
export function isScreenshotAvailable(): boolean {
  return !!(
    process.env.BROWSERLESS_TOKEN ||
    process.env.SCREENSHOT_API_KEY ||
    true // thum.io is always available
  );
}

