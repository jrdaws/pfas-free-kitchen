/**
 * UploadThing Dropzone Component
 *
 * A drag-and-drop file upload zone with visual feedback.
 * Great for uploading multiple files or larger uploads.
 */

"use client";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

interface UploadDropzoneProps {
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
   * Additional CSS classes for the dropzone container.
   */
  className?: string;
}

export function StorageUploadDropzone({
  endpoint,
  onUploadComplete,
  onUploadError,
  onUploadBegin,
  className = "",
}: UploadDropzoneProps) {
  return (
    <UploadDropzone<OurFileRouter, typeof endpoint>
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
        container: `
          border-2 border-dashed border-gray-300 
          rounded-lg p-8
          hover:border-blue-400 hover:bg-blue-50/50
          transition-colors duration-200
          cursor-pointer
          ${className}
        `.trim(),
        label: "text-gray-600 font-medium",
        allowedContent: "text-sm text-gray-500 mt-2",
        uploadIcon: "text-gray-400 w-12 h-12",
        button: `
          bg-blue-600 hover:bg-blue-700 
          text-white font-medium 
          px-4 py-2 rounded-lg mt-4
          transition-colors duration-200
        `.trim(),
      }}
      content={{
        label: "Drop files here or click to upload",
        allowedContent: ({ ready, isUploading }) => {
          if (isUploading) return "Uploading...";
          if (!ready) return "Getting ready...";
          return "Images, documents, and videos supported";
        },
      }}
    />
  );
}






