"use client";

import { useEffect } from "react";

// Check if Sentry is configured
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isSentryConfigured = 
  SENTRY_DSN && 
  SENTRY_DSN.startsWith("https://") && 
  !SENTRY_DSN.includes("placeholder");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only report to Sentry if configured
    if (isSentryConfigured) {
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error);
      });
    } else {
      // Log to console if Sentry isn't configured
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Something went wrong</h2>
            <p className="mt-2 text-gray-600">
              {isSentryConfigured 
                ? "Our team has been notified." 
                : "Please try again or contact support."}
            </p>
            {error.digest && (
              <p className="mt-2 text-sm text-gray-400">Error ID: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
