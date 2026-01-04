"use client";

/**
 * CloudinaryUpload Component
 * 
 * Drag and drop upload widget for Cloudinary.
 */

import { useState, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface CloudinaryUploadProps {
  folder?: string;
  maxFiles?: number;
  resourceType?: "image" | "video" | "raw" | "auto";
  onUpload?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

interface UploadResult {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
}

export function CloudinaryUpload({
  folder,
  maxFiles = 1,
  resourceType = "image",
  onUpload,
  onError,
  children,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSuccess = useCallback(
    (result: any) => {
      setIsUploading(false);
      if (onUpload && result.info) {
        onUpload({
          publicId: result.info.public_id,
          secureUrl: result.info.secure_url,
          width: result.info.width,
          height: result.info.height,
          format: result.info.format,
        });
      }
    },
    [onUpload]
  );

  const handleError = useCallback(
    (error: any) => {
      setIsUploading(false);
      if (onError) {
        onError(new Error(error.statusText || "Upload failed"));
      }
    },
    [onError]
  );

  return (
    <CldUploadWidget
      uploadPreset="unsigned_preset" // Create this in Cloudinary settings
      options={{
        folder,
        maxFiles,
        resourceType,
        sources: ["local", "url", "camera"],
        styles: {
          palette: {
            window: "#1a1a2e",
            windowBorder: "#2a2a3e",
            tabIcon: "#ffffff",
            menuIcons: "#ffffff",
            textDark: "#000000",
            textLight: "#ffffff",
            link: "#3b82f6",
            action: "#3b82f6",
            inactiveTabIcon: "#9ca3af",
            error: "#ef4444",
            inProgress: "#3b82f6",
            complete: "#22c55e",
            sourceBg: "#0f0f23",
          },
        },
      }}
      onSuccess={handleSuccess}
      onError={handleError}
      onOpen={() => setIsUploading(true)}
      onClose={() => setIsUploading(false)}
    >
      {({ open }) => (
        children || (
          <button
            type="button"
            onClick={() => open()}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload Image
              </>
            )}
          </button>
        )
      )}
    </CldUploadWidget>
  );
}

