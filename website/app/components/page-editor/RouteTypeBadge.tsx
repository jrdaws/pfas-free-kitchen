"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lock, Zap, Hash, MoreHorizontal } from "lucide-react";

export type RouteType = "static" | "dynamic" | "catch-all" | "api" | "layout";

interface RouteTypeBadgeProps {
  type: RouteType;
  isProtected?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const ROUTE_CONFIG: Record<RouteType, {
  label: string;
  icon: typeof Lock;
  color: string;
  bg: string;
}> = {
  static: {
    label: "Static",
    icon: Hash,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  dynamic: {
    label: "Dynamic",
    icon: Hash,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  "catch-all": {
    label: "Catch-All",
    icon: MoreHorizontal,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  api: {
    label: "API",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  layout: {
    label: "Layout",
    icon: Hash,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
};

export function RouteTypeBadge({
  type,
  isProtected,
  size = "sm",
  className,
}: RouteTypeBadgeProps) {
  const config = ROUTE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {type !== "static" && (
        <Badge
          variant="secondary"
          className={cn(
            "font-normal",
            config.bg,
            config.color,
            size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
          )}
        >
          <Icon className={cn(
            "mr-1",
            size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"
          )} />
          {config.label}
        </Badge>
      )}
      {isProtected && (
        <Badge
          variant="secondary"
          className={cn(
            "font-normal bg-rose-100 text-rose-600",
            size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
          )}
        >
          <Lock className={cn(
            "mr-1",
            size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"
          )} />
          Protected
        </Badge>
      )}
    </div>
  );
}

export default RouteTypeBadge;

