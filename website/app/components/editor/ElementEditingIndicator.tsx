"use client";

import React from "react";
import { UserPresence } from "@dawson-framework/collaboration";
import { Edit3 } from "lucide-react";

interface ElementEditingIndicatorProps {
  user: UserPresence;
  elementPosition: { top: number; left: number; width: number; height: number };
}

/**
 * Visual indicator showing which user is editing an element
 * Displays a colored border around the element and a user badge
 */
export function ElementEditingIndicator({
  user,
  elementPosition,
}: ElementEditingIndicatorProps) {
  const { top, left, width, height } = elementPosition;

  return (
    <>
      {/* Colored border outline */}
      <div
        className="absolute pointer-events-none z-40 transition-all duration-200"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: `2px solid ${user.color}`,
          boxShadow: `0 0 0 1px ${user.color}40, inset 0 0 0 1px ${user.color}40`,
          borderRadius: "4px",
        }}
      >
        {/* User badge - top left corner */}
        <div
          className="absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-white text-xs font-medium shadow-lg whitespace-nowrap"
          style={{
            backgroundColor: user.color,
          }}
        >
          <Edit3 className="w-3 h-3" />
          <span>{user.name}</span>
        </div>

        {/* Pulsing corner dots */}
        <div
          className="absolute -top-1 -left-1 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: user.color }}
        />
        <div
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: user.color, animationDelay: "0.5s" }}
        />
        <div
          className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: user.color, animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: user.color, animationDelay: "1.5s" }}
        />
      </div>

      {/* Subtle overlay */}
      <div
        className="absolute pointer-events-none z-39 transition-all duration-200"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: `${user.color}10`,
          borderRadius: "4px",
        }}
      />
    </>
  );
}
