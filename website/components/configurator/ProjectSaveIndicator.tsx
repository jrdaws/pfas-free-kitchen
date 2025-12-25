"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/lib/use-project";
import { cn } from "@/lib/utils";

interface ProjectSaveIndicatorProps {
  className?: string;
}

/**
 * Displays the current project save status.
 * 
 * Shows:
 * - Cloud icon when synced
 * - Saving spinner when auto-saving
 * - Warning when not logged in (local only)
 * - Error state on save failure
 */
export function ProjectSaveIndicator({ className }: ProjectSaveIndicatorProps) {
  const { user, isConfigured } = useAuth();
  const { project, isDirty, isSaving, error } = useProject();
  const [showSaved, setShowSaved] = useState(false);

  // Show "Saved" briefly after successful save
  useEffect(() => {
    if (!isSaving && !isDirty && project) {
      setShowSaved(true);
      const timeout = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSaving, isDirty, project]);

  // Not configured - show nothing
  if (!isConfigured) {
    return null;
  }

  // Not logged in - show local-only indicator
  if (!user) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-zinc-500",
          className
        )}
        title="Sign in to sync your project across devices"
      >
        <CloudOff className="h-3.5 w-3.5" />
        <span>Local only</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-red-500",
          className
        )}
        title={error}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Save failed</span>
      </div>
    );
  }

  // Saving state
  if (isSaving) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-[#0052FF]",
          className
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  // Just saved
  if (showSaved) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-emerald-500",
          className
        )}
      >
        <Check className="h-3.5 w-3.5" />
        <span>Saved</span>
      </div>
    );
  }

  // Has unsaved changes
  if (isDirty) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-amber-500",
          className
        )}
      >
        <Cloud className="h-3.5 w-3.5" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  // Synced with cloud
  if (project) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-zinc-500",
          className
        )}
        title={`Project: ${project.name}`}
      >
        <Cloud className="h-3.5 w-3.5" />
        <span>Synced</span>
      </div>
    );
  }

  // No project yet
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-zinc-500",
        className
      )}
    >
      <Cloud className="h-3.5 w-3.5" />
      <span>New project</span>
    </div>
  );
}

export default ProjectSaveIndicator;

