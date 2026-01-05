"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PreviewLinkProps {
  href: string;
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  className?: string;
}

export function PreviewLink({
  href,
  children,
  onNavigate,
  className,
}: PreviewLinkProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // Check if this is an internal link
      if (href.startsWith("/") || href.startsWith("#")) {
        onNavigate(href);
      } else {
        // External link - show tooltip
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    },
    [href, onNavigate]
  );

  return (
    <span className="relative inline-block">
      <a
        href={href}
        onClick={handleClick}
        className={cn(
          "cursor-pointer hover:underline transition-colors",
          className
        )}
      >
        {children}
      </a>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-slate-800 text-white rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-1">
          External link - would open in new tab
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}

