"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ComponentSlots } from "./ComponentSlots";
import type { PageNode, RouteType, ComponentSlot } from "./types";
import {
  File,
  Layout,
  Zap,
  Lock,
  Save,
  RotateCcw,
  Search,
} from "lucide-react";

interface PageSettingsProps {
  page: PageNode | null;
  onUpdate: (id: string, updates: Partial<PageNode>) => void;
  onUpdateSlot: (pageId: string, slotId: string, updates: Partial<ComponentSlot>) => void;
  onAddSlot: (pageId: string) => void;
  onRemoveSlot: (pageId: string, slotId: string) => void;
  className?: string;
}

const ROUTE_TYPES: { value: RouteType; label: string; icon: typeof File; description: string }[] = [
  {
    value: "static",
    label: "Page",
    icon: File,
    description: "Standard page route",
  },
  {
    value: "layout",
    label: "Layout",
    icon: Layout,
    description: "Wraps child pages",
  },
  {
    value: "api",
    label: "API",
    icon: Zap,
    description: "API endpoint route",
  },
];

export function PageSettings({
  page,
  onUpdate,
  onUpdateSlot,
  onAddSlot,
  onRemoveSlot,
  className,
}: PageSettingsProps) {
  const [localState, setLocalState] = useState<Partial<PageNode>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with page prop
  useEffect(() => {
    if (page) {
      setLocalState({
        title: page.title,
        path: page.path,
        description: page.description,
        routeType: page.routeType,
        authRequired: page.authRequired,
      });
      setHasChanges(false);
    }
  }, [page?.id]); // Only reset when page changes

  // Auto-save debounce
  useEffect(() => {
    if (!page || !hasChanges) return;

    const timer = setTimeout(() => {
      onUpdate(page.id, localState);
      setHasChanges(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [localState, page, hasChanges, onUpdate]);

  const handleChange = useCallback(
    <K extends keyof PageNode>(key: K, value: PageNode[K]) => {
      setLocalState((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    []
  );

  const handleReset = useCallback(() => {
    if (page) {
      setLocalState({
        title: page.title,
        path: page.path,
        description: page.description,
        routeType: page.routeType,
        authRequired: page.authRequired,
      });
      setHasChanges(false);
    }
  }, [page]);

  // Slugify path from title
  const handleTitleChange = useCallback((title: string) => {
    handleChange("title", title);
    // Auto-generate path from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!localState.path || localState.path === "/") {
      handleChange("path", `/${slug}`);
    }
  }, [handleChange, localState.path]);

  if (!page) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-center p-8", className)}>
        <File className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">
          Select a page from the tree to edit its settings
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Page Settings</h2>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Unsaved</span>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={localState.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Page title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <Input
              id="path"
              value={localState.path || ""}
              onChange={(e) => handleChange("path", e.target.value)}
              placeholder="/your-path"
            />
            <p className="text-xs text-muted-foreground">
              Use [param] for dynamic segments, [...slug] for catch-all
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={localState.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of this page..."
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Route Type */}
        <div className="space-y-3">
          <Label>Route Type</Label>
          <RadioGroup
            value={localState.routeType || "static"}
            onValueChange={(v) => handleChange("routeType", v as RouteType)}
            className="grid grid-cols-3 gap-2"
          >
            {ROUTE_TYPES.map((type) => (
              <div key={type.value}>
                <RadioGroupItem
                  value={type.value}
                  id={type.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={type.value}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer",
                    "hover:bg-muted/50 transition-colors text-center",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  )}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {type.description}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Protection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="auth">Authentication Required</Label>
                <p className="text-xs text-muted-foreground">
                  Require login to access this page
                </p>
              </div>
            </div>
            <Switch
              id="auth"
              checked={localState.authRequired || false}
              onCheckedChange={(checked) => handleChange("authRequired", checked)}
            />
          </div>
        </div>

        <Separator />

        {/* SEO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Label>SEO</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-title" className="text-xs">
              Meta Title
            </Label>
            <Input
              id="seo-title"
              value={localState.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Page title for search engines"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-desc" className="text-xs">
              Meta Description
            </Label>
            <Textarea
              id="seo-desc"
              value={localState.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description for search engines..."
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Component Slots */}
        <ComponentSlots
          slots={page.components}
          onUpdateSlot={(slotId, updates) => onUpdateSlot(page.id, slotId, updates)}
          onAddSlot={() => onAddSlot(page.id)}
          onRemoveSlot={(slotId) => onRemoveSlot(page.id, slotId)}
        />
      </div>
    </div>
  );
}

export default PageSettings;

