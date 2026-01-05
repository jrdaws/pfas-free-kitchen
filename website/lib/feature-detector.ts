/**
 * Feature Detector
 * 
 * Combines visual analysis and text content to detect
 * what features/functionality a website has.
 */

import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// Types
// ============================================================================

export interface AuthFeatures {
  hasLogin: boolean;
  hasSignup: boolean;
  hasSocialAuth: boolean;
  providers: string[];
}

export interface EcommerceFeatures {
  hasCart: boolean;
  hasProducts: boolean;
  hasCheckout: boolean;
  hasPricing: boolean;
  hasWishlist: boolean;
}

export interface ContentFeatures {
  hasBlog: boolean;
  hasSearch: boolean;
  hasFilters: boolean;
  hasPagination: boolean;
  hasCategories: boolean;
}

export interface SocialFeatures {
  hasProfiles: boolean;
  hasComments: boolean;
  hasLikes: boolean;
  hasSharing: boolean;
  hasFollowing: boolean;
}

export interface CommunicationFeatures {
  hasContactForm: boolean;
  hasChat: boolean;
  hasNewsletter: boolean;
  hasSupport: boolean;
}

export interface DashboardFeatures {
  hasDashboard: boolean;
  hasAnalytics: boolean;
  hasSettings: boolean;
  hasNotifications: boolean;
}

export interface DetectedFeatures {
  auth: AuthFeatures;
  ecommerce: EcommerceFeatures;
  content: ContentFeatures;
  social: SocialFeatures;
  communication: CommunicationFeatures;
  dashboard: DashboardFeatures;
  summary: string[];
}

export interface FeatureDetectionResult {
  success: boolean;
  features: DetectedFeatures | null;
  error?: string;
  rawResponse?: string;
}

// ============================================================================
// Prompt
// ============================================================================

const FEATURE_DETECTION_PROMPT = `Analyze this website screenshot and the extracted text content to identify what features and functionality the website has.

## Page Content (extracted text)
{{pageContent}}

## Instructions

Look for visual indicators and text that suggest these features:

1. **Authentication**: Login/signup buttons, "Sign in", "Create account", social login icons
2. **E-commerce**: Shopping cart icon, "Add to Cart", product cards, pricing tables
3. **Content**: Blog section, search bar, filters, pagination controls
4. **Social**: User profiles, comment sections, like/share buttons
5. **Communication**: Contact forms, chat widgets, newsletter signup
6. **Dashboard**: User dashboard, analytics, settings, notifications

## Output Format

Return ONLY valid JSON:

{
  "auth": {
    "hasLogin": true,
    "hasSignup": true,
    "hasSocialAuth": true,
    "providers": ["google", "github"]
  },
  "ecommerce": {
    "hasCart": false,
    "hasProducts": false,
    "hasCheckout": false,
    "hasPricing": true,
    "hasWishlist": false
  },
  "content": {
    "hasBlog": true,
    "hasSearch": true,
    "hasFilters": false,
    "hasPagination": false,
    "hasCategories": true
  },
  "social": {
    "hasProfiles": false,
    "hasComments": false,
    "hasLikes": false,
    "hasSharing": true,
    "hasFollowing": false
  },
  "communication": {
    "hasContactForm": true,
    "hasChat": false,
    "hasNewsletter": true,
    "hasSupport": false
  },
  "dashboard": {
    "hasDashboard": true,
    "hasAnalytics": false,
    "hasSettings": true,
    "hasNotifications": false
  },
  "summary": ["SaaS landing page", "User authentication", "Pricing tiers", "Newsletter signup"]
}`;

// ============================================================================
// Default Features
// ============================================================================

const DEFAULT_FEATURES: DetectedFeatures = {
  auth: { hasLogin: true, hasSignup: true, hasSocialAuth: false, providers: [] },
  ecommerce: { hasCart: false, hasProducts: false, hasCheckout: false, hasPricing: true, hasWishlist: false },
  content: { hasBlog: false, hasSearch: false, hasFilters: false, hasPagination: false, hasCategories: false },
  social: { hasProfiles: false, hasComments: false, hasLikes: false, hasSharing: false, hasFollowing: false },
  communication: { hasContactForm: true, hasChat: false, hasNewsletter: true, hasSupport: false },
  dashboard: { hasDashboard: false, hasAnalytics: false, hasSettings: false, hasNotifications: false },
  summary: ["Landing page", "Basic features"],
};

// ============================================================================
// Parser
// ============================================================================

function parseFeatureResponse(text: string): DetectedFeatures | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      auth: {
        hasLogin: parsed.auth?.hasLogin ?? false,
        hasSignup: parsed.auth?.hasSignup ?? false,
        hasSocialAuth: parsed.auth?.hasSocialAuth ?? false,
        providers: parsed.auth?.providers || [],
      },
      ecommerce: {
        hasCart: parsed.ecommerce?.hasCart ?? false,
        hasProducts: parsed.ecommerce?.hasProducts ?? false,
        hasCheckout: parsed.ecommerce?.hasCheckout ?? false,
        hasPricing: parsed.ecommerce?.hasPricing ?? false,
        hasWishlist: parsed.ecommerce?.hasWishlist ?? false,
      },
      content: {
        hasBlog: parsed.content?.hasBlog ?? false,
        hasSearch: parsed.content?.hasSearch ?? false,
        hasFilters: parsed.content?.hasFilters ?? false,
        hasPagination: parsed.content?.hasPagination ?? false,
        hasCategories: parsed.content?.hasCategories ?? false,
      },
      social: {
        hasProfiles: parsed.social?.hasProfiles ?? false,
        hasComments: parsed.social?.hasComments ?? false,
        hasLikes: parsed.social?.hasLikes ?? false,
        hasSharing: parsed.social?.hasSharing ?? false,
        hasFollowing: parsed.social?.hasFollowing ?? false,
      },
      communication: {
        hasContactForm: parsed.communication?.hasContactForm ?? false,
        hasChat: parsed.communication?.hasChat ?? false,
        hasNewsletter: parsed.communication?.hasNewsletter ?? false,
        hasSupport: parsed.communication?.hasSupport ?? false,
      },
      dashboard: {
        hasDashboard: parsed.dashboard?.hasDashboard ?? false,
        hasAnalytics: parsed.dashboard?.hasAnalytics ?? false,
        hasSettings: parsed.dashboard?.hasSettings ?? false,
        hasNotifications: parsed.dashboard?.hasNotifications ?? false,
      },
      summary: parsed.summary || [],
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Text-based Feature Detection (Fast fallback)
// ============================================================================

function detectFeaturesFromText(content: string): DetectedFeatures {
  const lower = content.toLowerCase();
  
  return {
    auth: {
      hasLogin: /log\s*in|sign\s*in|login/.test(lower),
      hasSignup: /sign\s*up|create\s*account|register|get\s*started/.test(lower),
      hasSocialAuth: /sign\s*in\s*with|continue\s*with\s*(google|github|apple)/.test(lower),
      providers: [
        /google/.test(lower) ? "google" : "",
        /github/.test(lower) ? "github" : "",
        /apple/.test(lower) ? "apple" : "",
      ].filter(Boolean),
    },
    ecommerce: {
      hasCart: /cart|basket|bag/.test(lower),
      hasProducts: /product|item|shop|store/.test(lower),
      hasCheckout: /checkout|buy\s*now|purchase/.test(lower),
      hasPricing: /pricing|plans?|subscription|\$\d+/.test(lower),
      hasWishlist: /wishlist|save\s*for\s*later|favorites/.test(lower),
    },
    content: {
      hasBlog: /blog|articles?|posts?|news/.test(lower),
      hasSearch: /search/.test(lower),
      hasFilters: /filter|sort|category/.test(lower),
      hasPagination: /page\s*\d|next|previous|load\s*more/.test(lower),
      hasCategories: /category|categories|topics?/.test(lower),
    },
    social: {
      hasProfiles: /profile|account|my\s+/.test(lower),
      hasComments: /comment|reply|discussion/.test(lower),
      hasLikes: /like|upvote|heart/.test(lower),
      hasSharing: /share|tweet|post\s+to/.test(lower),
      hasFollowing: /follow|subscribe/.test(lower),
    },
    communication: {
      hasContactForm: /contact|get\s*in\s*touch|message\s*us/.test(lower),
      hasChat: /chat|support|help\s*desk/.test(lower),
      hasNewsletter: /newsletter|subscribe|email\s*updates/.test(lower),
      hasSupport: /support|help|faq/.test(lower),
    },
    dashboard: {
      hasDashboard: /dashboard|overview|home/.test(lower),
      hasAnalytics: /analytics|metrics|statistics|insights/.test(lower),
      hasSettings: /settings|preferences|configuration/.test(lower),
      hasNotifications: /notification|alert|updates/.test(lower),
    },
    summary: ["Analyzed from text content"],
  };
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Detect features from screenshot and/or text content.
 */
export async function detectFeatures(
  screenshotBase64?: string,
  pageContent?: string
): Promise<FeatureDetectionResult> {
  // If no screenshot, use text-based detection
  if (!screenshotBase64) {
    if (pageContent) {
      return {
        success: true,
        features: detectFeaturesFromText(pageContent),
      };
    }
    return {
      success: true,
      features: DEFAULT_FEATURES,
      error: "No input provided - using defaults",
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    // Fall back to text-based detection
    if (pageContent) {
      return {
        success: true,
        features: detectFeaturesFromText(pageContent),
        error: "No API key - using text-based detection",
      };
    }
    return {
      success: true,
      features: DEFAULT_FEATURES,
      error: "No API key - using defaults",
    };
  }
  
  const client = new Anthropic({ apiKey });
  const prompt = FEATURE_DETECTION_PROMPT.replace(
    "{{pageContent}}",
    pageContent ? pageContent.slice(0, 2000) : "No text content available."
  );
  
  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: screenshotBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    const features = parseFeatureResponse(content.text);
    
    if (!features) {
      // Fall back to text-based
      if (pageContent) {
        return {
          success: true,
          features: detectFeaturesFromText(pageContent),
          error: "Failed to parse - using text-based detection",
          rawResponse: content.text,
        };
      }
      return {
        success: false,
        features: DEFAULT_FEATURES,
        error: "Failed to parse feature response",
        rawResponse: content.text,
      };
    }
    
    return {
      success: true,
      features,
      rawResponse: content.text,
    };
  } catch (error) {
    console.error("[FeatureDetector] Detection failed:", error);
    
    // Fall back to text-based
    if (pageContent) {
      return {
        success: true,
        features: detectFeaturesFromText(pageContent),
        error: "Vision failed - using text-based detection",
      };
    }
    
    return {
      success: false,
      features: DEFAULT_FEATURES,
      error: error instanceof Error ? error.message : "Detection failed",
    };
  }
}

export function getDefaultFeatures(): DetectedFeatures {
  return { ...DEFAULT_FEATURES };
}

