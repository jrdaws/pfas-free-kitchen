"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  editable?: boolean;
  placeholder?: string;
  multiline?: boolean;
}

export function InlineEditor({
  value,
  onChange,
  tag = 'span',
  className,
  editable = true,
  placeholder = 'Click to edit...',
  multiline = false,
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  // Sync draft with value prop
  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = useCallback(() => {
    setIsEditing(false);
    if (draft !== value && draft.trim()) {
      onChange(draft.trim());
    } else {
      setDraft(value); // Restore original if empty
    }
  }, [draft, value, onChange]);
  
  const handleCancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.shiftKey) {
      // Allow new lines with Shift+Enter in multiline mode
    } else if (e.key === 'Enter' && multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel, multiline]);
  
  const handleDoubleClick = useCallback(() => {
    if (editable) {
      setIsEditing(true);
    }
  }, [editable]);
  
  const Tag = tag;
  
  // Non-editable mode
  if (!editable) {
    return <Tag className={className}>{value || placeholder}</Tag>;
  }
  
  // Editing mode
  if (isEditing) {
    const inputClassName = cn(
      "bg-stone-800/50 border border-primary/50 rounded px-2 py-1 outline-none w-full",
      "focus:border-primary focus:ring-1 focus:ring-primary/30",
      "text-inherit font-inherit",
      className
    );
    
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(inputClassName, "min-h-[80px] resize-y")}
          placeholder={placeholder}
        />
      );
    }
    
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        placeholder={placeholder}
      />
    );
  }
  
  // Display mode (double-click to edit)
  return (
    <Tag
      onDoubleClick={handleDoubleClick}
      className={cn(
        className,
        "cursor-text transition-all duration-200",
        "hover:bg-primary/5 hover:outline hover:outline-1 hover:outline-primary/30",
        "rounded px-1 -mx-1",
        !value && "text-stone-500 italic"
      )}
      title="Double-click to edit"
    >
      {value || placeholder}
    </Tag>
  );
}

// ============================================================================
// Specialized Inline Editors
// ============================================================================

interface HeadlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  editable?: boolean;
}

export function HeadlineEditor({
  value,
  onChange,
  level = 1,
  className,
  editable = true,
}: HeadlineEditorProps) {
  const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  
  return (
    <InlineEditor
      value={value}
      onChange={onChange}
      tag={tag}
      className={className}
      editable={editable}
      placeholder={`Heading ${level}`}
    />
  );
}

interface ParagraphEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  editable?: boolean;
}

export function ParagraphEditor({
  value,
  onChange,
  className,
  editable = true,
}: ParagraphEditorProps) {
  return (
    <InlineEditor
      value={value}
      onChange={onChange}
      tag="p"
      className={className}
      editable={editable}
      placeholder="Click to add text..."
      multiline
    />
  );
}

export default InlineEditor;

