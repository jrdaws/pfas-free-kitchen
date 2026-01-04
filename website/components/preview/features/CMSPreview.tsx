"use client";

import { cn } from "@/lib/utils";
import { FileText, Edit3, Eye, Calendar, User } from "lucide-react";

interface CMSPreviewProps {
  provider?: string;
  variant?: "card" | "editor" | "list";
  className?: string;
}

const CMS_PROVIDERS: Record<string, { name: string; color: string; icon: string }> = {
  "sanity": { name: "Sanity", color: "#F03E2F", icon: "📝" },
  "contentful": { name: "Contentful", color: "#2478CC", icon: "📄" },
  "payload": { name: "Payload", color: "#000000", icon: "🎯" },
  "strapi": { name: "Strapi", color: "#4945FF", icon: "📦" },
};

/**
 * Preview component showing CMS content management
 * Displays when CMS features are selected
 */
export function CMSPreview({ 
  provider, 
  variant = "card",
  className 
}: CMSPreviewProps) {
  const providerInfo = provider ? CMS_PROVIDERS[provider] : null;

  const mockContent = [
    { title: "Getting Started Guide", status: "published", date: "2 hours ago" },
    { title: "Product Launch Announcement", status: "draft", date: "Yesterday" },
    { title: "API Documentation", status: "published", date: "3 days ago" },
  ];

  if (variant === "editor") {
    return (
      <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-alt">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-foreground-muted" />
            <span className="font-medium text-foreground text-sm">Edit: Getting Started Guide</span>
          </div>
          <div className="flex items-center gap-2">
            {providerInfo && (
              <span 
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${providerInfo.color}20`, color: providerInfo.color }}
              >
                {providerInfo.icon} {providerInfo.name}
              </span>
            )}
            <button className="p-1.5 rounded hover:bg-background transition-colors">
              <Eye className="h-4 w-4 text-foreground-muted" />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium">
              Publish
            </button>
          </div>
        </div>
        
        {/* Editor Body */}
        <div className="p-4 space-y-3">
          <input 
            type="text" 
            defaultValue="Getting Started Guide"
            className="w-full text-xl font-bold bg-transparent border-none outline-none text-foreground"
          />
          <div className="space-y-2 text-sm text-foreground-secondary">
            <p>Welcome to our platform! This guide will help you get started...</p>
            <div className="h-20 bg-background-alt rounded-lg border border-dashed border-border flex items-center justify-center text-foreground-muted text-xs">
              Rich text editor area
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground-muted" />
            <span className="font-medium text-foreground text-sm">Content</span>
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
        <div className="divide-y divide-border">
          {mockContent.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-background-alt transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-foreground-muted" />
                <div>
                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-foreground-muted flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </div>
                </div>
              </div>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full",
                item.status === "published" 
                  ? "bg-success/20 text-success" 
                  : "bg-amber-500/20 text-amber-500"
              )}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Content</span>
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
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded-lg bg-background-alt">
          <div className="text-lg font-bold text-foreground">12</div>
          <div className="text-[10px] text-foreground-muted">Published</div>
        </div>
        <div className="p-2 rounded-lg bg-background-alt">
          <div className="text-lg font-bold text-foreground">3</div>
          <div className="text-[10px] text-foreground-muted">Drafts</div>
        </div>
        <div className="p-2 rounded-lg bg-background-alt">
          <div className="text-lg font-bold text-foreground">5</div>
          <div className="text-[10px] text-foreground-muted">Scheduled</div>
        </div>
      </div>
      <button className="w-full mt-3 py-2 rounded-lg border border-border text-sm text-foreground-secondary hover:bg-background-alt transition-colors flex items-center justify-center gap-2">
        <Edit3 className="h-3.5 w-3.5" />
        New Content
      </button>
    </div>
  );
}

