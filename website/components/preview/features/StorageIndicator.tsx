"use client";

import { cn } from "@/lib/utils";
import { Upload, Image, File, Film, HardDrive, X, Check } from "lucide-react";

interface StorageIndicatorProps {
  provider?: string;
  variant?: "button" | "dropzone" | "usage" | "files";
  className?: string;
}

const STORAGE_PROVIDERS: Record<string, { name: string; color: string; icon: string }> = {
  "uploadthing": { name: "UploadThing", color: "#FF0000", icon: "📤" },
  "cloudflare-r2": { name: "R2", color: "#F48120", icon: "☁️" },
  "supabase-storage": { name: "Supabase", color: "#3ECF8E", icon: "💾" },
  "aws-s3": { name: "S3", color: "#FF9900", icon: "🪣" },
};

/**
 * Preview component showing file storage/upload
 * Displays when storage features are selected
 */
export function StorageIndicator({ 
  provider, 
  variant = "button",
  className 
}: StorageIndicatorProps) {
  const providerInfo = provider ? STORAGE_PROVIDERS[provider] : null;

  const mockFiles = [
    { name: "hero-image.png", type: "image", size: "2.4 MB", status: "complete" },
    { name: "product-video.mp4", type: "video", size: "45 MB", status: "uploading", progress: 67 },
    { name: "document.pdf", type: "file", size: "1.2 MB", status: "complete" },
  ];

  if (variant === "dropzone") {
    return (
      <div className={cn("border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer", className)}>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="text-sm font-medium text-foreground mb-1">
          Drop files here or click to upload
        </div>
        <div className="text-xs text-foreground-muted mb-3">
          PNG, JPG, GIF, MP4 up to 50MB
        </div>
        {providerInfo && (
          <span 
            className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
            style={{ backgroundColor: `${providerInfo.color}15`, color: providerInfo.color }}
          >
            {providerInfo.icon} Powered by {providerInfo.name}
          </span>
        )}
      </div>
    );
  }

  if (variant === "usage") {
    const usedGB = 3.2;
    const totalGB = 10;
    const percentage = (usedGB / totalGB) * 100;

    return (
      <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-foreground-muted" />
            <span className="font-medium text-foreground text-sm">Storage</span>
          </div>
          {providerInfo && (
            <span 
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${providerInfo.color}20`, color: providerInfo.color }}
            >
              {providerInfo.icon} {providerInfo.name}
            </span>
          )}
        </div>
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{usedGB}</span>
            <span className="text-sm text-foreground-muted">/ {totalGB} GB</span>
          </div>
        </div>
        <div className="h-2 bg-background-alt rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: percentage > 80 ? '#EF4444' : '#F97316'
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-foreground-muted">
          <span>{percentage.toFixed(0)}% used</span>
          <span>{(totalGB - usedGB).toFixed(1)} GB free</span>
        </div>
      </div>
    );
  }

  if (variant === "files") {
    const FileIcon = ({ type }: { type: string }) => {
      switch (type) {
        case "image": return <Image className="h-4 w-4 text-blue-400" />;
        case "video": return <Film className="h-4 w-4 text-purple-400" />;
        default: return <File className="h-4 w-4 text-foreground-muted" />;
      }
    };

    return (
      <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-medium text-foreground text-sm">Recent Uploads</span>
          {providerInfo && (
            <span 
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${providerInfo.color}20`, color: providerInfo.color }}
            >
              {providerInfo.icon} {providerInfo.name}
            </span>
          )}
        </div>
        <div className="divide-y divide-border">
          {mockFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <FileIcon type={file.type} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">{file.name}</div>
                {file.status === "uploading" ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-background-alt rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-foreground-muted">{file.progress}%</span>
                  </div>
                ) : (
                  <div className="text-xs text-foreground-muted">{file.size}</div>
                )}
              </div>
              {file.status === "complete" ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <X className="h-4 w-4 text-foreground-muted cursor-pointer hover:text-destructive" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Button variant (default)
  return (
    <button className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-background-alt transition-colors",
      className
    )}>
      <Upload className="h-4 w-4 text-foreground-muted" />
      <span className="text-sm text-foreground">Upload File</span>
      {providerInfo && (
        <span 
          className="text-[9px] px-1.5 py-0.5 rounded ml-1"
          style={{ backgroundColor: `${providerInfo.color}20`, color: providerInfo.color }}
        >
          {providerInfo.icon}
        </span>
      )}
    </button>
  );
}

