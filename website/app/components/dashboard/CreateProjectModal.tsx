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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Layers,
  ShoppingCart,
  FileText,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    description?: string;
    template: string;
  }) => Promise<void>;
}

const TEMPLATES = [
  {
    id: "blank",
    name: "Start Blank",
    description: "Empty project, configure everything",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "saas",
    name: "SaaS",
    description: "Auth, billing, dashboard",
    icon: Layers,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Cart, checkout, products",
    icon: ShoppingCart,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "blog",
    name: "Blog",
    description: "Posts, CMS, SEO",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Charts, tables, analytics",
    icon: LayoutDashboard,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

export function CreateProjectModal({
  open,
  onOpenChange,
  onCreate,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("blank");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        template,
      });
      // Reset form
      setName("");
      setDescription("");
      setTemplate("blank");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName("");
      setDescription("");
      setTemplate("blank");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Start with a template or create from scratch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome App"
              disabled={isCreating}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project..."
              rows={2}
              disabled={isCreating}
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Template</Label>
            <RadioGroup
              value={template}
              onValueChange={setTemplate}
              disabled={isCreating}
              className="grid grid-cols-2 gap-3"
            >
              {TEMPLATES.map((t) => (
                <div key={t.id}>
                  <RadioGroupItem
                    value={t.id}
                    id={t.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={t.id}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer",
                      "hover:bg-muted/50 transition-colors",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                      "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", t.bg)}>
                      <t.icon className={cn("w-5 h-5", t.color)} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProjectModal;

