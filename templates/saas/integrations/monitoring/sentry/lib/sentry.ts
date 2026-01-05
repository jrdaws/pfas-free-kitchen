/**
 * Sentry Utilities with Lazy Initialization
 * 
 * These utilities gracefully handle missing Sentry configuration.
 * All functions are no-ops if SENTRY_DSN is not set.
 */

// Check if Sentry is configured
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const isSentryConfigured = 
  SENTRY_DSN && 
  SENTRY_DSN.startsWith("https://") && 
  !SENTRY_DSN.includes("placeholder");

// Lazy load Sentry to avoid initialization errors
let sentryModule: typeof import("@sentry/nextjs") | null = null;

async function getSentry() {
  if (!isSentryConfigured) {
    return null;
  }
  if (!sentryModule) {
    sentryModule = await import("@sentry/nextjs");
  }
  return sentryModule;
}

/**
 * Check if Sentry is configured
 */
export function isSentryEnabled(): boolean {
  return isSentryConfigured;
}

/**
 * Set the current user for Sentry tracking
 */
export async function setUser(user: { id: string; email?: string; username?: string } | null) {
  const Sentry = await getSentry();
  if (!Sentry) return;

  if (user) {
    Sentry.setUser({ id: user.id, email: user.email, username: user.username });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture an error in Sentry
 */
export async function captureError(error: Error, context?: Record<string, unknown>) {
  const Sentry = await getSentry();
  if (!Sentry) {
    console.error("[Sentry not configured]", error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message in Sentry
 */
export async function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
) {
  const Sentry = await getSentry();
  if (!Sentry) {
    console.log(`[Sentry not configured] [${level}]`, message, context);
    return;
  }
  Sentry.captureMessage(message, { level, extra: context });
}

/**
 * Add a breadcrumb for debugging
 */
export async function addBreadcrumb(message: string, category = "custom", data?: Record<string, unknown>) {
  const Sentry = await getSentry();
  if (!Sentry) return;
  Sentry.addBreadcrumb({ message, category, data, level: "info" });
}

/**
 * Wrap an async function with Sentry tracing
 */
export async function withSentry<T>(fn: () => Promise<T>, operation: string): Promise<T> {
  const Sentry = await getSentry();
  
  // If Sentry is not configured, just run the function
  if (!Sentry) {
    return fn();
  }

  return Sentry.startSpan({ name: operation }, async () => {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error) {
        Sentry.captureException(error, { extra: { operation } });
      }
      throw error;
    }
  });
}
