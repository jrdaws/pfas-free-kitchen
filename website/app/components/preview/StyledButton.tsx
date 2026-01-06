"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ButtonShape = "pill" | "rounded" | "square";
export type ButtonStyle = "solid" | "gradient" | "outline" | "ghost";

export interface ComponentStyleButton {
  shape?: ButtonShape;
  style?: ButtonStyle;
  hasIcon?: boolean;
  hasShadow?: boolean;
}

interface StyledButtonProps {
  children: ReactNode;
  componentStyle?: ComponentStyleButton;
  primaryColor?: string;
  secondaryColor?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary";
}

export function StyledButton({
  children,
  componentStyle,
  primaryColor,
  secondaryColor,
  onClick,
  className,
  variant = "primary",
}: StyledButtonProps) {
  const shape = componentStyle?.shape || "rounded";
  const style = componentStyle?.style || "solid";
  const hasShadow = componentStyle?.hasShadow ?? true;

  // Build classes based on detected style
  const shapeClasses = {
    pill: "rounded-full",
    rounded: "rounded-lg",
    square: "rounded-none",
  };

  const styleClasses = {
    solid: "text-white hover:opacity-90",
    gradient: "text-white hover:opacity-90",
    outline: "border-2 bg-transparent hover:bg-opacity-10",
    ghost: "bg-transparent hover:bg-gray-100",
  };

  // Apply custom colors via inline styles if provided
  const inlineStyle: React.CSSProperties = {};
  
  if (style === "solid" && primaryColor) {
    inlineStyle.backgroundColor = primaryColor;
  } else if (style === "gradient" && primaryColor && secondaryColor) {
    inlineStyle.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
  } else if (style === "outline" && primaryColor) {
    inlineStyle.borderColor = primaryColor;
    inlineStyle.color = primaryColor;
  } else if (style === "ghost" && primaryColor) {
    inlineStyle.color = primaryColor;
  }

  // Default colors if none provided - fallback matches globals.css --primary (orange)
  if (!primaryColor) {
    if (style === "solid") {
      inlineStyle.backgroundColor = variant === "primary" ? "var(--preview-primary, #F97316)" : "var(--preview-secondary, #64748b)";
    } else if (style === "gradient") {
      inlineStyle.background = `linear-gradient(135deg, var(--preview-primary, #F97316) 0%, var(--preview-secondary, #EA580C) 100%)`;
    } else if (style === "outline") {
      inlineStyle.borderColor = "var(--preview-primary, #F97316)";
      inlineStyle.color = "var(--preview-primary, #F97316)";
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 font-medium transition-all duration-200",
        shapeClasses[shape],
        styleClasses[style],
        hasShadow && style !== "ghost" && style !== "outline" && "shadow-lg hover:shadow-xl",
        className
      )}
      style={inlineStyle}
    >
      {children}
    </button>
  );
}

