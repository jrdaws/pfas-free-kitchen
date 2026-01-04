/**
 * UploadThing Integration - Core Library
 *
 * Type-safe file uploads for Next.js with UploadThing.
 * Supports images, documents, videos, and custom file types.
 */

import {
  createUploadthing,
  type FileRouter,
} from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

// ============================================================
// Environment Validation
// ============================================================

if (!process.env.UPLOADTHING_TOKEN) {
  console.warn(`
⚠️  UploadThing configuration missing

Required environment variable:
  UPLOADTHING_TOKEN

Get this from: https://uploadthing.com/dashboard
Add to: .env.local

File uploads will not work until configured.
  `);
}

// ============================================================
// File Router Configuration
// ============================================================

const f = createUploadthing();

/**
 * Define your file upload endpoints here.
 * Each key becomes an API endpoint.
 *
 * Example usage:
 * - imageUploader: General image uploads (max 4MB)
 * - documentUploader: PDF/doc uploads (max 16MB)
 * - avatarUploader: User profile images (max 2MB)
 */
export const ourFileRouter = {
  /**
   * Image uploader - accepts jpg, png, gif, webp
   * Max file size: 4MB
   */
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 4,
    },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // You can add authentication here

      // Example: Get user from session
      // const user = await auth(req);
      // if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete:", file.url);
      console.log("Metadata:", metadata);

      // Return data to the client
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        uploadedAt: metadata.uploadedAt,
      };
    }),

  /**
   * Document uploader - accepts PDF, Word docs, etc.
   * Max file size: 16MB
   */
  documentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document uploaded:", file.name);
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        uploadedAt: metadata.uploadedAt,
      };
    }),

  /**
   * Avatar uploader - small images for user profiles
   * Max file size: 2MB, single file only
   */
  avatarUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Add user authentication here
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploaded:", file.url);
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        uploadedAt: metadata.uploadedAt,
      };
    }),

  /**
   * Video uploader - for video content
   * Max file size: 64MB
   */
  videoUploader: f({
    video: {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Video uploaded:", file.url);
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        uploadedAt: metadata.uploadedAt,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// ============================================================
// Helper Types
// ============================================================

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface UploadError {
  code: string;
  message: string;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some((type) => {
    if (type.includes("*")) {
      // Handle wildcards like "image/*"
      const [category] = type.split("/");
      return file.type.startsWith(`${category}/`);
    }
    return file.type === type;
  });
}

/**
 * Check if file size is within limit
 */
export function isWithinSizeLimit(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName.replace(/\.[^/.]+$/, "");

  return `${baseName}-${timestamp}-${random}.${extension}`;
}

/**
 * Extract file extension from URL or filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Check if URL is an UploadThing URL
 */
export function isUploadThingUrl(url: string): boolean {
  return url.includes("uploadthing") || url.includes("utfs.io");
}
