"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "currency" | "percent";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  trend,
  format = "number",
  className,
}: StatsCardProps) {
  // Determine trend from change if not provided
  const effectiveTrend = trend ?? (change ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : undefined);

  // Format value based on type
  const formattedValue = (() => {
    if (typeof value === "string") return value;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value);
      case "percent":
        return `${value}%`;
      default:
        return new Intl.NumberFormat("en-US").format(value);
    }
  })();

  // Format change percentage
  const formattedChange = change !== undefined ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%` : null;

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6 transition-shadow hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{formattedValue}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      {/* Change indicator */}
      {formattedChange && (
        <div className="flex items-center gap-1.5 mt-4">
          <div
            className={cn(
              "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium",
              {
                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400":
                  effectiveTrend === "up",
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400":
                  effectiveTrend === "down",
                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400":
                  effectiveTrend === "neutral",
              }
            )}
          >
            {effectiveTrend === "up" && <ArrowUp className="h-3 w-3" />}
            {effectiveTrend === "down" && <ArrowDown className="h-3 w-3" />}
            {effectiveTrend === "neutral" && <Minus className="h-3 w-3" />}
            {formattedChange}
          </div>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Stats card skeleton for loading states
 */
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-12 w-12 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Grid wrapper for stats cards
 */
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

