/**
 * UploadThing File Upload Component
 *
 * A reusable upload component with drag-and-drop support.
 * Uses UploadThing's type-safe upload primitives.
 */

"use client";

import { useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFile } from "@/lib/uploadthing";

interface FileUploadProps {
  /**
   * The endpoint to use (must match one defined in core.ts)
   */
  endpoint: "imageUploader" | "documentUploader" | "avatarUploader" | "fileUploader";
  
  /**
   * Callback when upload completes successfully
   */
  onUploadComplete?: (files: UploadedFile[]) => void;
  
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: Error) => void;
  
  /**
   * Maximum number of files (default: 1)
   */
  maxFiles?: number;
  
  /**
   * Accepted file types (default: depends on endpoint)
   */
  accept?: string;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Whether the upload is disabled
   */
  disabled?: boolean;
}

export function FileUpload({
  endpoint,
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  accept,
  className = "",
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const uploaded = res.map((file) => ({
        key: file.key,
        url: file.url,
        name: file.name,
        size: file.size,
      }));
      setUploadedFiles((prev) => [...prev, ...uploaded]);
      setFiles([]);
      onUploadComplete?.(uploaded);
    },
    onUploadError: (err) => {
      setError(err.message);
      onUploadError?.(err);
    },
  });

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;
      
      setError(null);
      const fileArray = Array.from(newFiles).slice(0, maxFiles);
      setFiles(fileArray);
      
      // Auto-start upload
      startUpload(fileArray);
    },
    [maxFiles, startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeUploadedFile = useCallback((key: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.key !== key));
  }, []);

  // Get file info from endpoint config
  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo.config).join(", ")
    : "files";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 cursor-pointer
          ${isDragging 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}
          ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          multiple={maxFiles > 1}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="text-center">
          {/* Upload Icon */}
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <div className="mt-4">
            {isUploading ? (
              <p className="text-sm text-gray-500">Uploading...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {fileTypes} (max {maxFiles} {maxFiles === 1 ? "file" : "files"})
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {isUploading && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse w-full" />
          </div>
          <span className="text-sm text-gray-500">Uploading...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files
          </p>
          {uploadedFiles.map((file) => (
            <div
              key={file.key}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* File Icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View
                </a>
                <button
                  onClick={() => removeUploadedFile(file.key)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Simple Image Upload Preview Component
 * Shows preview of uploaded image
 */
export function ImageUploadPreview({
  endpoint = "imageUploader",
  onUploadComplete,
  className = "",
}: {
  endpoint?: "imageUploader" | "avatarUploader";
  onUploadComplete?: (url: string) => void;
  className?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const handleComplete = (files: UploadedFile[]) => {
    if (files[0]) {
      setImageUrl(files[0].url);
      onUploadComplete?.(files[0].url);
    }
  };

  return (
    <div className={className}>
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={() => setImageUrl(null)}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <FileUpload
          endpoint={endpoint}
          onUploadComplete={handleComplete}
          accept="image/*"
          maxFiles={1}
        />
      )}
    </div>
  );
}

