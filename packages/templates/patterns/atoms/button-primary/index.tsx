/**
 * Button Primary Atom
 * 
 * Primary action button with hover states.
 */

import Link from "next/link";

export interface ButtonPrimaryProps {
  text: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ButtonPrimary({
  text,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  size = "md",
}: ButtonPrimaryProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    bg-primary text-white
    hover:bg-primary/90
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {text}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {text}
    </button>
  );
}

export default ButtonPrimary;

