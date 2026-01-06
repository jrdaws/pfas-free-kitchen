"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type CardCorners = "rounded" | "sharp" | "pill";
export type CardStyle = "elevated" | "flat" | "bordered" | "glass";

export interface ComponentStyleCard {
  corners?: CardCorners;
  style?: CardStyle;
  hasShadow?: boolean;
  hasHover?: boolean;
}

interface StyledCardProps {
  children: ReactNode;
  componentStyle?: ComponentStyleCard;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StyledCard({
  children,
  componentStyle,
  backgroundColor,
  borderColor,
  className,
  onClick,
}: StyledCardProps) {
  const corners = componentStyle?.corners || "rounded";
  const style = componentStyle?.style || "elevated";
  const hasShadow = componentStyle?.hasShadow ?? (style === "elevated");
  const hasHover = componentStyle?.hasHover ?? true;

  const cornerClasses = {
    rounded: "rounded-xl",
    sharp: "rounded-none",
    pill: "rounded-3xl",
  };

  const styleClasses = {
    elevated: "bg-white shadow-lg",
    flat: "bg-gray-50",
    bordered: "bg-white border-2",
    glass: "bg-white/80 backdrop-blur-md border border-white/20",
  };

  const inlineStyle: React.CSSProperties = {};
  
  if (backgroundColor) {
    inlineStyle.backgroundColor = backgroundColor;
  }
  
  if (style === "bordered" && borderColor) {
    inlineStyle.borderColor = borderColor;
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-6 transition-all duration-200",
        cornerClasses[corners],
        styleClasses[style],
        hasShadow && style === "elevated" && "shadow-lg",
        hasHover && "hover:shadow-xl hover:-translate-y-1",
        onClick && "cursor-pointer",
        className
      )}
      style={inlineStyle}
    >
      {children}
    </div>
  );
}

// Feature Card - specialized styled card for features
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  componentStyle?: ComponentStyleCard;
  accentColor?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  componentStyle,
  accentColor,
}: FeatureCardProps) {
  return (
    <StyledCard componentStyle={componentStyle} className="text-center">
      <div
        className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center text-2xl"
        style={{
          backgroundColor: accentColor ? `${accentColor}20` : "var(--preview-primary, #F97316)20",
          color: accentColor || "var(--preview-primary, #F97316)",
        }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </StyledCard>
  );
}

// Pricing Card - specialized styled card for pricing
interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  componentStyle?: ComponentStyleCard;
  primaryColor?: string;
}

export function PricingCard({
  name,
  price,
  period = "/mo",
  features,
  isPopular,
  ctaText = "Get Started",
  onCtaClick,
  componentStyle,
  primaryColor,
}: PricingCardProps) {
  const color = primaryColor || "var(--preview-primary, #F97316)";
  
  return (
    <StyledCard
      componentStyle={componentStyle}
      className={cn(
        "relative",
        isPopular && "ring-2 scale-105"
      )}
      borderColor={isPopular ? color : undefined}
    >
      {isPopular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-white rounded-full"
          style={{ backgroundColor: color }}
        >
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold" style={{ color }}>
          {price}
        </span>
        <span className="text-gray-500">{period}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <span style={{ color }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onCtaClick}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-colors",
          isPopular ? "text-white" : "text-gray-900 bg-gray-100 hover:bg-gray-200"
        )}
        style={isPopular ? { backgroundColor: color } : undefined}
      >
        {ctaText}
      </button>
    </StyledCard>
  );
}

