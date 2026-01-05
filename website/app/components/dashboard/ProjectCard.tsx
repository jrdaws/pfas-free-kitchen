"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProjectMenu } from "./ProjectMenu";
import {
  Clock,
  CheckCircle2,
  Archive,
  Layers,
} from "lucide-react";

export interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  template?: string;
  features?: string[];
  integrations?: string[];
  status: "draft" | "active" | "archived";
  thumbnailUrl?: string;
  npxToken?: string;
  createdAt: string;
  updatedAt?: string;
  onOpen?: (id: string) => void;
  onClone?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  isLoading?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  active: {
    icon: CheckCircle2,
    label: "Active",
    dotColor: "bg-emerald-400",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  draft: {
    icon: Clock,
    label: "Draft",
    dotColor: "bg-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  archived: {
    icon: Archive,
    label: "Archived",
    dotColor: "bg-slate-400",
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
};

const TEMPLATE_GRADIENTS: Record<string, string> = {
  saas: "from-violet-500 to-purple-600",
  ecommerce: "from-emerald-500 to-teal-600",
  blog: "from-blue-500 to-cyan-600",
  dashboard: "from-orange-500 to-amber-600",
  default: "from-slate-600 to-slate-700",
};

export function ProjectCard({
  id,
  name,
  description,
  template,
  features = [],
  integrations = [],
  status,
  thumbnailUrl,
  npxToken,
  createdAt,
  updatedAt,
  onOpen,
  onClone,
  onArchive,
  onDelete,
  isLoading,
  className,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[status];
  const gradient = TEMPLATE_GRADIENTS[template || "default"] || TEMPLATE_GRADIENTS.default;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl border border-border overflow-hidden",
        "transition-all duration-200 hover:shadow-lg hover:border-primary/30",
        "cursor-pointer focus-within:ring-2 focus-within:ring-primary/50",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen?.(id)}
    >
      {/* Thumbnail / Preview */}
      <div className={cn(
        "relative h-32 bg-gradient-to-br",
        gradient
      )}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/20 text-6xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Template badge */}
        {template && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-black/40 text-white border-none backdrop-blur-sm capitalize text-xs"
            >
              <Layers className="w-3 h-3 mr-1" />
              {template}
            </Badge>
          </div>
        )}

        {/* Menu */}
        <div
          className={cn(
            "absolute top-2 right-2 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ProjectMenu
            projectId={id}
            projectName={name}
            onOpen={() => onOpen?.(id)}
            onClone={() => onClone?.(id)}
            onArchive={() => onArchive?.(id)}
            onDelete={() => onDelete?.(id, name)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Features/Integrations Tags */}
        {(features.length > 0 || integrations.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {[...features, ...integrations].slice(0, 3).map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="text-xs px-1.5 py-0"
              >
                {item}
              </Badge>
            ))}
            {[...features, ...integrations].length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{[...features, ...integrations].length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Badge variant="outline" className={cn("text-xs", statusConfig.badgeClass)}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusConfig.dotColor)} />
            {statusConfig.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(updatedAt || createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;

