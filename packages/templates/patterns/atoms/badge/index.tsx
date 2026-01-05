/**
 * Badge Atom
 * 
 * Small label for status or categories.
 */

export interface BadgeProps {
  text: string;
  color?: "primary" | "success" | "warning" | "error" | "gray";
  variant?: "solid" | "outline" | "subtle";
  className?: string;
}

export function Badge({
  text,
  color = "primary",
  variant = "solid",
  className = "",
}: BadgeProps) {
  const colorClasses = {
    primary: {
      solid: "bg-primary text-white",
      outline: "border-primary text-primary",
      subtle: "bg-primary/10 text-primary",
    },
    success: {
      solid: "bg-green-500 text-white",
      outline: "border-green-500 text-green-500",
      subtle: "bg-green-500/10 text-green-600",
    },
    warning: {
      solid: "bg-yellow-500 text-white",
      outline: "border-yellow-500 text-yellow-500",
      subtle: "bg-yellow-500/10 text-yellow-600",
    },
    error: {
      solid: "bg-red-500 text-white",
      outline: "border-red-500 text-red-500",
      subtle: "bg-red-500/10 text-red-600",
    },
    gray: {
      solid: "bg-gray-500 text-white",
      outline: "border-gray-500 text-gray-500",
      subtle: "bg-gray-500/10 text-gray-600",
    },
  };

  const baseClasses = `
    inline-flex items-center
    px-2.5 py-0.5
    text-xs font-medium
    rounded-full
    ${variant === "outline" ? "border" : ""}
    ${colorClasses[color][variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return <span className={baseClasses}>{text}</span>;
}

export default Badge;

