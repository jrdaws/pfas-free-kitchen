/**
 * Service Limits & Quota Management
 * 
 * Centralized handling of service limits, quotas, and billing notifications
 * for all external services used by the framework.
 */

export type ServiceCode = 
  | "replicate"     // Image generation
  | "anthropic"     // AI/Claude
  | "openai"        // OpenAI models
  | "supabase"      // Database/storage
  | "vercel"        // Hosting
  | "stripe"        // Payments
  | "resend"        // Email
  | "clerk"         // Auth
  | "sentry";       // Monitoring

export type LimitCode = 
  | "RATE_LIMITED"
  | "CREDITS_EXHAUSTED"
  | "QUOTA_EXCEEDED"
  | "INVALID_API_KEY"
  | "SERVICE_UNAVAILABLE"
  | "FREE_TIER_LIMIT";

export interface ServiceLimitError {
  service: ServiceCode;
  code: LimitCode;
  message: string;
  action: string;
  upgradeUrl?: string;
  docsUrl?: string;
  retryAfter?: number; // seconds
}

/**
 * Service configuration for limit handling
 */
const SERVICE_CONFIG: Record<ServiceCode, {
  name: string;
  billingUrl: string;
  docsUrl: string;
  freeTierInfo?: string;
}> = {
  replicate: {
    name: "Replicate (Image Generation)",
    billingUrl: "https://replicate.com/account/billing",
    docsUrl: "https://replicate.com/docs",
    freeTierInfo: "Free tier includes limited generations per month",
  },
  anthropic: {
    name: "Anthropic (Claude AI)",
    billingUrl: "https://console.anthropic.com/settings/billing",
    docsUrl: "https://docs.anthropic.com",
    freeTierInfo: "API credits required for Claude usage",
  },
  openai: {
    name: "OpenAI",
    billingUrl: "https://platform.openai.com/account/billing",
    docsUrl: "https://platform.openai.com/docs",
    freeTierInfo: "Free credits expire after 3 months",
  },
  supabase: {
    name: "Supabase (Database)",
    billingUrl: "https://supabase.com/dashboard/account/billing",
    docsUrl: "https://supabase.com/docs",
    freeTierInfo: "500MB database, 1GB storage free",
  },
  vercel: {
    name: "Vercel (Hosting)",
    billingUrl: "https://vercel.com/account/billing",
    docsUrl: "https://vercel.com/docs",
    freeTierInfo: "100GB bandwidth, 100 deployments/day free",
  },
  stripe: {
    name: "Stripe (Payments)",
    billingUrl: "https://dashboard.stripe.com/settings/billing",
    docsUrl: "https://stripe.com/docs",
    freeTierInfo: "No monthly fees, pay per transaction",
  },
  resend: {
    name: "Resend (Email)",
    billingUrl: "https://resend.com/settings/billing",
    docsUrl: "https://resend.com/docs",
    freeTierInfo: "100 emails/day free",
  },
  clerk: {
    name: "Clerk (Auth)",
    billingUrl: "https://dashboard.clerk.com/settings/billing",
    docsUrl: "https://clerk.com/docs",
    freeTierInfo: "10,000 MAUs free",
  },
  sentry: {
    name: "Sentry (Monitoring)",
    billingUrl: "https://sentry.io/settings/billing/",
    docsUrl: "https://docs.sentry.io",
    freeTierInfo: "5,000 errors/month free",
  },
};

/**
 * Parse an error and detect if it's a service limit issue
 */
export function detectServiceLimit(
  error: unknown,
  service: ServiceCode
): ServiceLimitError | null {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();
  const config = SERVICE_CONFIG[service];

  // Rate limiting
  if (errorLower.includes("rate") || errorLower.includes("429") || errorLower.includes("too many")) {
    return {
      service,
      code: "RATE_LIMITED",
      message: `Rate limit reached for ${config.name}`,
      action: "Wait a few minutes before retrying",
      upgradeUrl: config.billingUrl,
      docsUrl: config.docsUrl,
      retryAfter: 60,
    };
  }

  // Credits/billing exhausted
  if (errorLower.includes("payment") || errorLower.includes("credit") || 
      errorLower.includes("billing") || errorLower.includes("402") || 
      errorLower.includes("quota") || errorLower.includes("insufficient")) {
    return {
      service,
      code: "CREDITS_EXHAUSTED",
      message: `${config.name} credits or quota exhausted`,
      action: `Add credits or upgrade your plan at ${config.billingUrl}`,
      upgradeUrl: config.billingUrl,
      docsUrl: config.docsUrl,
    };
  }

  // Invalid API key
  if (errorLower.includes("unauthorized") || errorLower.includes("401") || 
      (errorLower.includes("invalid") && errorLower.includes("key"))) {
    return {
      service,
      code: "INVALID_API_KEY",
      message: `Invalid or expired API key for ${config.name}`,
      action: "Check your API key configuration in .env.local",
      docsUrl: config.docsUrl,
    };
  }

  // Free tier exceeded
  if (errorLower.includes("free") && (errorLower.includes("limit") || errorLower.includes("exceeded"))) {
    return {
      service,
      code: "FREE_TIER_LIMIT",
      message: `Free tier limit reached for ${config.name}`,
      action: config.freeTierInfo || `Upgrade your plan at ${config.billingUrl}`,
      upgradeUrl: config.billingUrl,
      docsUrl: config.docsUrl,
    };
  }

  // Service unavailable
  if (errorLower.includes("503") || errorLower.includes("unavailable") || 
      errorLower.includes("maintenance") || errorLower.includes("down")) {
    return {
      service,
      code: "SERVICE_UNAVAILABLE",
      message: `${config.name} is temporarily unavailable`,
      action: "This is usually temporary. Try again in a few minutes.",
      docsUrl: config.docsUrl,
      retryAfter: 300,
    };
  }

  return null;
}

/**
 * Get user-friendly message for a service limit error
 */
export function getServiceLimitMessage(error: ServiceLimitError): {
  title: string;
  description: string;
  actionText: string;
  actionUrl?: string;
} {
  const config = SERVICE_CONFIG[error.service];
  
  switch (error.code) {
    case "RATE_LIMITED":
      return {
        title: "Rate Limit Reached",
        description: `You've made too many requests to ${config.name}. Please wait before trying again.`,
        actionText: "Upgrade for higher limits",
        actionUrl: error.upgradeUrl,
      };
    case "CREDITS_EXHAUSTED":
      return {
        title: "Credits Exhausted",
        description: `Your ${config.name} credits have run out. Add credits to continue.`,
        actionText: "Add Credits",
        actionUrl: error.upgradeUrl,
      };
    case "QUOTA_EXCEEDED":
      return {
        title: "Quota Exceeded",
        description: `You've exceeded your ${config.name} quota for this billing period.`,
        actionText: "Upgrade Plan",
        actionUrl: error.upgradeUrl,
      };
    case "INVALID_API_KEY":
      return {
        title: "Invalid API Key",
        description: `Your ${config.name} API key is invalid or expired.`,
        actionText: "Get New Key",
        actionUrl: config.docsUrl,
      };
    case "FREE_TIER_LIMIT":
      return {
        title: "Free Tier Limit",
        description: config.freeTierInfo || `Free tier limit reached for ${config.name}.`,
        actionText: "Upgrade to Pro",
        actionUrl: error.upgradeUrl,
      };
    case "SERVICE_UNAVAILABLE":
      return {
        title: "Service Unavailable",
        description: `${config.name} is temporarily unavailable. This is usually brief.`,
        actionText: "Check Status",
        actionUrl: config.docsUrl,
      };
    default:
      return {
        title: "Service Error",
        description: error.message,
        actionText: "View Documentation",
        actionUrl: error.docsUrl,
      };
  }
}

/**
 * Get all service configurations for display in settings/billing page
 */
export function getServiceConfigs() {
  return SERVICE_CONFIG;
}

