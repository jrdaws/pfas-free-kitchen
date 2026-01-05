/**
 * Next.js Instrumentation with Lazy Sentry Initialization
 * 
 * Only initializes Sentry if SENTRY_DSN is properly configured.
 */

// Check if Sentry is configured
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const isSentryConfigured = 
  SENTRY_DSN && 
  SENTRY_DSN.startsWith("https://") && 
  !SENTRY_DSN.includes("placeholder");

export async function register() {
  // Skip Sentry initialization if not configured
  if (!isSentryConfigured) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Instrumentation] Sentry not configured, skipping initialization");
    }
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
