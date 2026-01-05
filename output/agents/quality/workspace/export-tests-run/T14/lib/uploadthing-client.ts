/**
 * UploadThing Client - React Hooks and Utilities
 * 
 * This file provides client-side React helpers for UploadThing.
 * Use in client components only.
 */

"use client";

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

/**
 * Generate type-safe React hooks and components for UploadThing
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

/**
 * Re-export types for convenience
 */
export type { UploadedFile, UploadError } from "./uploadthing";

