"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { RouteType } from "./types";
import {
  Loader2,
  File,
  Layout,
  Zap,
  Hash,
  MoreHorizontal,
  Lock,
} from "lucide-react";

interface AddPageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentPage?: { id: string; path: string; title: string } | null;
  onCreate: (data: {
    title: string;
    path: string;
    routeType: RouteType;
    authRequired: boolean;
    parentId?: string;
  }) => Promise<void>;
}

const PAGE_TYPES = [
  { value: "static", label: "Static", icon: File, description: "Regular page" },
  { value: "dynamic", label: "Dynamic", icon: Hash, description: "[param] route" },
  { value: "catch-all", label: "Catch-All", icon: MoreHorizontal, description: "[...slug] route" },
  { value: "layout", label: "Layout", icon: Layout, description: "Wraps children" },
  { value: "api", label: "API", icon: Zap, description: "API endpoint" },
];

export function AddPageModal({
  open,
  onOpenChange,
  parentPage,
  onCreate,
}: AddPageModalProps) {
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [routeType, setRouteType] = useState<RouteType>("static");
  const [authRequired, setAuthRequired] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate path from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    const basePath = parentPage ? parentPage.path : "";
    setPath(`${basePath}/${slug}`);
  };

  // Update path for dynamic routes
  const handleRouteTypeChange = (type: RouteType) => {
    setRouteType(type);
    
    // Adjust path based on route type
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "page";
    
    const basePath = parentPage ? parentPage.path : "";
    
    switch (type) {
      case "dynamic":
        setPath(`${basePath}/[${slug}]`);
        break;
      case "catch-all":
        setPath(`${basePath}/[...${slug}]`);
        break;
      case "api":
        setPath(`/api/${slug}`);
        break;
      default:
        setPath(`${basePath}/${slug}`);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Page title is required");
      return;
    }

    if (!path.trim()) {
      setError("Page path is required");
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      await onCreate({
        title: title.trim(),
        path: path.trim(),
        routeType,
        authRequired,
        parentId: parentPage?.id,
      });
      // Reset form
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create page");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle("");
      setPath("");
      setRouteType("static");
      setAuthRequired(false);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {parentPage ? `Add Child Page to "${parentPage.title}"` : "Add New Page"}
          </DialogTitle>
          <DialogDescription>
            {parentPage
              ? `This page will be nested under ${parentPage.path}`
              : "Create a new page in your application"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., About Us"
              disabled={isCreating}
              autoFocus
            />
          </div>

          {/* Path */}
          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <Input
              id="path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/about"
              disabled={isCreating}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use [param] for dynamic routes, [...slug] for catch-all
            </p>
          </div>

          {/* Route Type */}
          <div className="space-y-3">
            <Label>Route Type</Label>
            <RadioGroup
              value={routeType}
              onValueChange={(v) => handleRouteTypeChange(v as RouteType)}
              disabled={isCreating}
              className="grid grid-cols-5 gap-2"
            >
              {PAGE_TYPES.map((type) => (
                <div key={type.value}>
                  <RadioGroupItem
                    value={type.value}
                    id={`type-${type.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer",
                      "hover:bg-muted/50 transition-colors text-center",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                      "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                    )}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{type.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Auth Required */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="auth" className="text-sm">Protected</Label>
                <p className="text-xs text-muted-foreground">
                  Require authentication
                </p>
              </div>
            </div>
            <Switch
              id="auth"
              checked={authRequired}
              onCheckedChange={setAuthRequired}
              disabled={isCreating}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddPageModal;

