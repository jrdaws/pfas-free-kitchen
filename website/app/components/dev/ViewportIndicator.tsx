"use client";

import { useEffect, useState } from "react";

/**
 * Development-only component that shows current viewport size and breakpoint.
 * Only renders in development mode.
 * 
 * Usage: Add <ViewportIndicator /> anywhere in your layout during development.
 */
export function ViewportIndicator() {
  const [viewport, setViewport] = useState({ width: 0, height: 0, breakpoint: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") return;
    
    setMounted(true);

    const getBreakpoint = (width: number): string => {
      if (width < 640) return "xs";
      if (width < 768) return "sm";
      if (width < 1024) return "md";
      if (width < 1280) return "lg";
      if (width < 1536) return "xl";
      return "2xl";
    };

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        width,
        height,
        breakpoint: getBreakpoint(width),
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    
    // Log viewport changes to console
    console.log(`[Viewport] ${window.innerWidth}x${window.innerHeight} (${getBreakpoint(window.innerWidth)})`);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Don't render in production or before mount
  if (process.env.NODE_ENV !== "development" || !mounted) {
    return null;
  }

  const breakpointColors: Record<string, string> = {
    xs: "bg-red-500",
    sm: "bg-orange-500",
    md: "bg-yellow-500",
    lg: "bg-green-500",
    xl: "bg-blue-500",
    "2xl": "bg-amber-500",
  };

  return (
    <div
      className={`fixed bottom-2 left-2 z-[9999] px-2 py-1 rounded text-white text-xs font-mono shadow-lg ${breakpointColors[viewport.breakpoint]}`}
    >
      <span className="font-bold">{viewport.breakpoint.toUpperCase()}</span>
      <span className="opacity-75 ml-1">
        {viewport.width}×{viewport.height}
      </span>
    </div>
  );
}

