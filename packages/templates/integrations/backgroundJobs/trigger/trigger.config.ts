import type { TriggerConfig } from "@trigger.dev/sdk";

export const config: TriggerConfig = {
  // The project ref from your Trigger.dev dashboard
  project: "my-project",
  
  // Retry configuration
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  
  // Concurrent jobs limit
  maxConcurrentRuns: 10,
  
  // Dependencies to include
  dependenciesToBundle: [],
  
  // Telemetry
  telemetry: {
    disabled: false,
  },
};

