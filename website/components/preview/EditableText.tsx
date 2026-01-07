"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  maxLength?: number;
}

export function EditableText({
  value,
  onChange,
  as: Component = "span",
  className = "",
  placeholder = "Click to edit...",
  editable = true,
  multiline = false,
  maxLength,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync external value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    if (editValue !== value) {
      setIsSaving(true);
      onChange(editValue);
      // Show save feedback briefly
      setTimeout(() => setIsSaving(false), 300);
    }
  }, [editValue, value, onChange]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !multiline) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel, multiline]
  );

  // Not editable - render as static
  if (!editable) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  // In edit mode
  if (isEditing) {
    const inputClasses = cn(
      className,
      "bg-transparent border-2 border-primary rounded-md outline-none w-full px-1",
      "focus:ring-2 focus:ring-primary/30"
    );

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={cn(inputClasses, "resize-none min-h-[3em]")}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className={inputClasses}
      />
    );
  }

  // Display mode with hover effect
  return (
    <Component
      className={cn(
        className,
        "cursor-text transition-all duration-150",
        "hover:outline hover:outline-2 hover:outline-primary/50 hover:outline-offset-2 hover:rounded",
        isSaving && "animate-pulse"
      )}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || <span className="opacity-50 italic">{placeholder}</span>}
    </Component>
  );
}

