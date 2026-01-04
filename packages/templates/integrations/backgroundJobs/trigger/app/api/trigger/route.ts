import { createAppRoute } from "@trigger.dev/nextjs";
import { triggerClient } from "@/lib/trigger/client";

// Import all jobs to register them
import "@/jobs/example-job";
import "@/jobs/scheduled-job";

// Create the API route handler
export const { POST } = createAppRoute(triggerClient);

// Optional: Handle other methods
export function GET() {
  return new Response("Trigger.dev webhook endpoint", { status: 200 });
}

