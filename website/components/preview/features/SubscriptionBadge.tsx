"use client";

import { cn } from "@/lib/utils";
import { Crown, Zap, Star, Check, ArrowUpRight } from "lucide-react";

interface SubscriptionBadgeProps {
  plan?: "free" | "starter" | "pro" | "enterprise";
  variant?: "badge" | "card" | "banner";
  showUpgrade?: boolean;
  className?: string;
}

const PLAN_CONFIG = {
  free: { 
    name: "Free", 
    color: "#6B7280", 
    icon: Star,
    features: ["Basic features", "1 project", "Community support"]
  },
  starter: { 
    name: "Starter", 
    color: "#3B82F6", 
    icon: Zap,
    features: ["All Free features", "5 projects", "Email support", "Basic analytics"]
  },
  pro: { 
    name: "Pro", 
    color: "#F97316", 
    icon: Crown,
    features: ["All Starter features", "Unlimited projects", "Priority support", "Advanced analytics", "API access"]
  },
  enterprise: { 
    name: "Enterprise", 
    color: "#8B5CF6", 
    icon: Crown,
    features: ["All Pro features", "SSO", "Custom integrations", "Dedicated manager", "SLA"]
  },
};

/**
 * Preview component showing subscription/plan status
 * Displays when billing features are selected
 */
export function SubscriptionBadge({ 
  plan = "pro", 
  variant = "badge",
  showUpgrade = true,
  className 
}: SubscriptionBadgeProps) {
  const config = PLAN_CONFIG[plan];
  const Icon = config.icon;

  if (variant === "banner") {
    return (
      <div 
        className={cn("w-full px-4 py-2 flex items-center justify-between", className)}
        style={{ backgroundColor: `${config.color}15` }}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: config.color }} />
          <span className="text-sm font-medium" style={{ color: config.color }}>
            {config.name} Plan
          </span>
        </div>
        {showUpgrade && plan !== "enterprise" && (
          <button 
            className="text-xs px-3 py-1 rounded-full font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: config.color }}
          >
            Upgrade
          </button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="h-4 w-4" style={{ color: config.color }} />
            </div>
            <div>
              <div className="font-semibold text-foreground">{config.name}</div>
              <div className="text-xs text-foreground-muted">Current Plan</div>
            </div>
          </div>
          {showUpgrade && plan !== "enterprise" && (
            <button 
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-white flex items-center gap-1 transition-colors hover:opacity-90"
              style={{ backgroundColor: config.color }}
            >
              Upgrade <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {config.features.slice(0, 3).map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-xs text-foreground-secondary">
              <Check className="h-3 w-3 text-success" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Badge variant (default)
  return (
    <span 
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", className)}
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      <Icon className="h-3 w-3" />
      {config.name}
    </span>
  );
}

