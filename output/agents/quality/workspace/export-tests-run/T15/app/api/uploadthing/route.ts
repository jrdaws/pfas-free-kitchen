/**
 * UploadThing API Route Handler
 *
 * This file creates the API endpoints for file uploads.
 * UploadThing handles the complexity of file uploads, including:
 * - Presigned URLs for direct-to-storage uploads
 * - File type validation
 * - Size limit enforcement
 * - Upload progress tracking
 */

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing";

// Export routes for Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Configure CORS and other options
  config: {
    // Optional: Add callback URL for webhooks
    // callbackUrl: process.env.UPLOADTHING_CALLBACK_URL,

    // Optional: Log upload events
    // logLevel: "debug",
  },
});
