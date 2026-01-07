"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Save } from "lucide-react";

export interface EditorField {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "color" | "image" | "select" | "number" | "boolean";
  value: unknown;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface PropsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: EditorField[];
  onSave: (values: Record<string, unknown>) => void;
}

export function PropsEditorModal({
  isOpen,
  onClose,
  title,
  description,
  fields,
  onSave,
}: PropsEditorModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = Object.fromEntries(fields.map((f) => [f.key, f.value]));
      setValues(initial);
      setErrors({});
    }
  }, [isOpen, fields]);

  const updateValue = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear error when user edits
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    for (const field of fields) {
      if (field.required && !values[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
      if (field.type === "url" && values[field.key]) {
        try {
          new URL(values[field.key] as string);
        } catch {
          newErrors[field.key] = "Please enter a valid URL";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(values);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Enter" && e.metaKey) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* Fields */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-foreground">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {renderField(field, values[field.key], (v) => updateValue(field.key, v))}
              
              {errors[field.key] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function renderField(
  field: EditorField,
  value: unknown,
  onChange: (value: unknown) => void
) {
  const baseInputClasses = cn(
    "w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg",
    "text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
    "transition-colors"
  );

  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className={baseInputClasses}
        />
      );

    case "textarea":
      return (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={3}
          className={cn(baseInputClasses, "resize-none")}
        />
      );

    case "url":
      return (
        <input
          type="url"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "https://..."}
          className={baseInputClasses}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          min={field.min}
          max={field.max}
          className={baseInputClasses}
        />
      );

    case "color":
      return (
        <div className="flex items-center gap-2 mt-1.5">
          <input
            type="color"
            value={(value as string) || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded border border-border cursor-pointer"
          />
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className={cn(baseInputClasses, "mt-0")}
          />
        </div>
      );

    case "select":
      return (
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClasses}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">
            {field.placeholder || "Enabled"}
          </span>
        </label>
      );

    case "image":
      return (
        <div className="mt-1.5 space-y-2">
          <input
            type="url"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL..."
            className={baseInputClasses}
          />
          {typeof value === "string" && value && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

/**
 * Hook for managing modal state
 */
export function usePropsEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description?: string;
    fields: EditorField[];
    onSave: (values: Record<string, unknown>) => void;
  } | null>(null);

  const openEditor = (editorConfig: typeof config) => {
    setConfig(editorConfig);
    setIsOpen(true);
  };

  const closeEditor = () => {
    setIsOpen(false);
    setConfig(null);
  };

  return {
    isOpen,
    config,
    openEditor,
    closeEditor,
  };
}

