/**
 * Example Integration - File Upload Component
 * 
 * This file demonstrates the pattern for UI components.
 */

"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  url: string;
  id: string;
}

interface FileUploadProps {
  onUpload?: (result: UploadResult) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  maxSizeMB = 5,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File too large. Maximum size is ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/example/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        setResult(data);
        onUpload?.(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
      } finally {
        setUploading(false);
      }
    },
    [maxSizeMB, onUpload]
  );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          accept={accept}
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>

      {uploading && (
        <p className="text-sm text-gray-500">Uploading...</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {result && (
        <div className="text-sm text-green-600">
          <p>Upload complete!</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View file
          </a>
        </div>
      )}
    </div>
  );
}

