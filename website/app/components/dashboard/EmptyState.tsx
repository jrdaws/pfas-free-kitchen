"use client";

import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Sparkles, Zap, Layers } from "lucide-react";

interface EmptyStateProps {
  onCreate?: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FolderOpen className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Create your first project
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start building something amazing. Configure your stack, pick your integrations, 
        and export a production-ready codebase in minutes.
      </p>

      {/* CTA */}
      <Button onClick={onCreate} size="lg" className="gap-2 mb-8">
        <Plus className="w-5 h-5" />
        Create Project
      </Button>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Templates</p>
            <p className="text-xs text-muted-foreground">SaaS, E-commerce, Blog</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Integrations</p>
            <p className="text-xs text-muted-foreground">Auth, Payments, AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Export-First</p>
            <p className="text-xs text-muted-foreground">Own your code</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

