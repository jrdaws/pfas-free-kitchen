/**
 * UploadThing Upload Button Component
 *
 * A simple button that triggers file upload.
 * Uses UploadThing's built-in button component with custom styling.
 */

"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

interface UploadButtonProps {
  /**
   * Which endpoint to use for uploads.
   * Must match a key from your file router.
   */
  endpoint: keyof OurFileRouter;

  /**
   * Callback when upload completes successfully.
   */
  onUploadComplete?: (res: { url: string; name: string; size: number }[]) => void;

  /**
   * Callback when upload fails.
   */
  onUploadError?: (error: Error) => void;

  /**
   * Callback when upload begins.
   */
  onUploadBegin?: (fileName: string) => void;

  /**
   * Custom button text.
   */
  buttonText?: string;

  /**
   * Additional CSS classes for the button.
   */
  className?: string;
}

export function StorageUploadButton({
  endpoint,
  onUploadComplete,
  onUploadError,
  onUploadBegin,
  buttonText = "Upload File",
  className = "",
}: UploadButtonProps) {
  return (
    <UploadButton<OurFileRouter, typeof endpoint>
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res && onUploadComplete) {
          onUploadComplete(
            res.map((file) => ({
              url: file.url,
              name: file.name,
              size: file.size,
            }))
          );
        }
      }}
      onUploadError={(error: Error) => {
        console.error("[UploadThing] Error:", error);
        onUploadError?.(error);
      }}
      onUploadBegin={(fileName) => {
        console.log("[UploadThing] Upload starting:", fileName);
        onUploadBegin?.(fileName);
      }}
      appearance={{
        button: `
          bg-blue-600 hover:bg-blue-700 
          text-white font-medium 
          px-4 py-2 rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `.trim(),
        allowedContent: "text-sm text-gray-500 mt-2",
      }}
      content={{
        button: buttonText,
        allowedContent: ({ ready, isUploading }) => {
          if (isUploading) return "Uploading...";
          if (!ready) return "Getting ready...";
          return "";
        },
      }}
    />
  );
}






