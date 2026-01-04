/**
 * File Preview Component
 *
 * Displays uploaded files with preview and delete functionality.
 * Supports images, documents, and other file types.
 */

"use client";

import { useState } from "react";
import { formatFileSize, getFileExtension } from "@/lib/uploadthing";

interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

interface FilePreviewProps {
  /**
   * List of uploaded files to display.
   */
  files: UploadedFile[];

  /**
   * Callback when a file is removed.
   */
  onRemove?: (file: UploadedFile) => void;

  /**
   * Whether to show the remove button.
   */
  showRemove?: boolean;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

export function FilePreview({
  files,
  onRemove,
  showRemove = true,
  className = "",
}: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {files.map((file, index) => (
        <FileItem
          key={`${file.url}-${index}`}
          file={file}
          onRemove={showRemove ? onRemove : undefined}
        />
      ))}
    </div>
  );
}

interface FileItemProps {
  file: UploadedFile;
  onRemove?: (file: UploadedFile) => void;
}

function FileItem({ file, onRemove }: FileItemProps) {
  const [imageError, setImageError] = useState(false);
  const extension = getFileExtension(file.name);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Preview */}
      <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
        {isImage && !imageError ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <FileIcon extension={extension} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
          title="Open in new tab"
        >
          <ExternalLinkIcon className="w-4 h-4" />
        </a>

        {onRemove && (
          <button
            onClick={() => onRemove(file)}
            className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function FileIcon({ extension }: { extension: string }) {
  const iconMap: Record<string, string> = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "📽️",
    pptx: "📽️",
    mp4: "🎬",
    mov: "🎬",
    mp3: "🎵",
    wav: "🎵",
    zip: "📦",
    rar: "📦",
  };

  return (
    <span className="text-2xl" role="img" aria-label={`${extension} file`}>
      {iconMap[extension] || "📁"}
    </span>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}






