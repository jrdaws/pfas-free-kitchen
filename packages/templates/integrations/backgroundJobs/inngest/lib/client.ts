/**
 * Inngest Client
 * 
 * Configure the Inngest client for background jobs.
 */

import { Inngest } from "inngest";

// Validate environment
if (!process.env.INNGEST_EVENT_KEY) {
  console.warn(`
⚠️  Inngest configuration missing

Required environment variables:
  INNGEST_EVENT_KEY
  INNGEST_SIGNING_KEY

Get these from: https://www.inngest.com/dashboard
Add to: .env.local

For local development, run:
  npx inngest-cli@latest dev

Background jobs will not work until configured.
  `);
}

// Create the Inngest client
export const inngest = new Inngest({
  id: "my-app", // Replace with your app name
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// ============================================================
// Event Types
// ============================================================

/**
 * Define your event types here for type safety
 */
export type Events = {
  // User events
  "user/created": {
    data: {
      userId: string;
      email: string;
      name?: string;
    };
  };
  "user/deleted": {
    data: {
      userId: string;
    };
  };

  // Email events
  "email/send": {
    data: {
      to: string;
      subject: string;
      template: string;
      variables?: Record<string, unknown>;
    };
  };

  // Subscription events
  "subscription/created": {
    data: {
      userId: string;
      planId: string;
      subscriptionId: string;
    };
  };
  "subscription/cancelled": {
    data: {
      userId: string;
      subscriptionId: string;
      reason?: string;
    };
  };

  // Scheduled events
  "cron/daily-cleanup": {
    data: Record<string, never>;
  };
  "cron/weekly-report": {
    data: Record<string, never>;
  };
};

/**
 * Helper to send events with type safety
 */
export async function sendEvent<T extends keyof Events>(
  name: T,
  data: Events[T]["data"]
) {
  return inngest.send({ name, data });
}

