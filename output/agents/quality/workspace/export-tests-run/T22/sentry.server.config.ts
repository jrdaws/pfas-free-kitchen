import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === "development",
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") return null;
    return event;
  },
  environment: process.env.NODE_ENV,
});

