"use client";

import { cn } from "@/lib/utils";
import {
  User,
  ShoppingCart,
  FileText,
  MessageSquare,
  Search,
  CreditCard,
  Mail,
  Shield,
  Zap,
  Globe,
  Bell,
  Settings,
} from "lucide-react";

export interface DetectedFeatures {
  auth?: {
    hasLogin?: boolean;
    hasSignup?: boolean;
    hasSocialAuth?: boolean;
    hasMFA?: boolean;
  };
  ecommerce?: {
    hasCart?: boolean;
    hasCheckout?: boolean;
    hasProductCatalog?: boolean;
    hasWishlist?: boolean;
  };
  content?: {
    hasBlog?: boolean;
    hasCMS?: boolean;
    hasSearch?: boolean;
    hasCategories?: boolean;
  };
  social?: {
    hasComments?: boolean;
    hasSharing?: boolean;
    hasReviews?: boolean;
    hasProfiles?: boolean;
  };
  payments?: {
    hasSubscription?: boolean;
    hasOneTime?: boolean;
    hasInvoicing?: boolean;
  };
  communication?: {
    hasEmail?: boolean;
    hasNotifications?: boolean;
    hasChat?: boolean;
  };
}

interface FeatureBadgesProps {
  features: DetectedFeatures;
  showAll?: boolean;
  className?: string;
  variant?: "compact" | "detailed";
  primaryColor?: string;
}

interface BadgeConfig {
  label: string;
  icon: React.ReactNode;
  category: string;
}

export function FeatureBadges({
  features,
  showAll = false,
  className,
  variant = "compact",
  primaryColor,
}: FeatureBadgesProps) {
  const badges: BadgeConfig[] = [];

  // Auth features
  if (features.auth?.hasLogin) {
    badges.push({ label: "Auth", icon: <User className="w-3 h-3" />, category: "auth" });
  }
  if (features.auth?.hasSocialAuth) {
    badges.push({ label: "Social Login", icon: <Globe className="w-3 h-3" />, category: "auth" });
  }
  if (features.auth?.hasMFA) {
    badges.push({ label: "MFA", icon: <Shield className="w-3 h-3" />, category: "auth" });
  }

  // E-commerce features
  if (features.ecommerce?.hasCart) {
    badges.push({ label: "Cart", icon: <ShoppingCart className="w-3 h-3" />, category: "ecommerce" });
  }
  if (features.ecommerce?.hasCheckout) {
    badges.push({ label: "Checkout", icon: <CreditCard className="w-3 h-3" />, category: "ecommerce" });
  }

  // Content features
  if (features.content?.hasBlog) {
    badges.push({ label: "Blog", icon: <FileText className="w-3 h-3" />, category: "content" });
  }
  if (features.content?.hasSearch) {
    badges.push({ label: "Search", icon: <Search className="w-3 h-3" />, category: "content" });
  }

  // Social features
  if (features.social?.hasComments) {
    badges.push({ label: "Comments", icon: <MessageSquare className="w-3 h-3" />, category: "social" });
  }

  // Payment features
  if (features.payments?.hasSubscription) {
    badges.push({ label: "Subscriptions", icon: <Zap className="w-3 h-3" />, category: "payments" });
  }

  // Communication features
  if (features.communication?.hasEmail) {
    badges.push({ label: "Email", icon: <Mail className="w-3 h-3" />, category: "communication" });
  }
  if (features.communication?.hasNotifications) {
    badges.push({ label: "Notifications", icon: <Bell className="w-3 h-3" />, category: "communication" });
  }

  // Show limited badges unless showAll is true
  const displayBadges = showAll ? badges : badges.slice(0, 6);
  const remainingCount = badges.length - displayBadges.length;

  if (badges.length === 0) {
    return null;
  }

  const color = primaryColor || "var(--preview-primary, #6366f1)";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayBadges.map((badge, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center gap-1 font-medium transition-colors",
            variant === "compact"
              ? "px-2 py-1 text-xs rounded-full"
              : "px-3 py-1.5 text-sm rounded-lg"
          )}
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          {badge.icon}
          {badge.label}
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center font-medium",
            variant === "compact"
              ? "px-2 py-1 text-xs rounded-full"
              : "px-3 py-1.5 text-sm rounded-lg"
          )}
          style={{
            backgroundColor: `${color}10`,
            color: color,
          }}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// Settings icon for integration status
interface IntegrationBadgesProps {
  integrations: string[];
  className?: string;
}

export function IntegrationBadges({ integrations, className }: IntegrationBadgesProps) {
  if (integrations.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {integrations.slice(0, 8).map((integration, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
        >
          <Settings className="w-3 h-3" />
          {integration}
        </span>
      ))}
    </div>
  );
}

