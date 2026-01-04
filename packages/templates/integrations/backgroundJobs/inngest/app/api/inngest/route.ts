/**
 * Inngest API Route
 * 
 * Handles incoming events and function invocations from Inngest.
 */

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

// Create the serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

