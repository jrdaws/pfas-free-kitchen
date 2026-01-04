import { TriggerClient } from "@trigger.dev/sdk";

// Create a Trigger.dev client
export const triggerClient = new TriggerClient({
  id: "my-app",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});

