import * as Sentry from "@sentry/nextjs";

export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email, username: user.username });
  } else {
    Sentry.setUser(null);
  }
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
) {
  Sentry.captureMessage(message, { level, extra: context });
}

export function addBreadcrumb(message: string, category = "custom", data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({ message, category, data, level: "info" });
}

export async function withSentry<T>(fn: () => Promise<T>, operation: string): Promise<T> {
  return Sentry.startSpan({ name: operation }, async () => {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error) captureError(error, { operation });
      throw error;
    }
  });
}

