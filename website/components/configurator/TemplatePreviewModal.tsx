"use client";

import { useEffect } from "react";
import { type Template } from "@/lib/patterns/templates";
import { DynamicPreviewRenderer } from "@/components/preview/DynamicPreviewRenderer";
import { cn } from "@/lib/utils";

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * TemplatePreviewModal
 * 
 * Full-screen preview of a template before selection.
 * Shows the template rendered in the DynamicPreviewRenderer.
 */
export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onConfirm,
}: TemplatePreviewModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div className="relative flex flex-col w-full h-full m-4 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/95 backdrop-blur">
          <div className="flex items-center gap-4">
            {/* Template info */}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">{template.name}</h2>
                <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded capitalize">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-white/50 mt-0.5">{template.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Tags */}
            <div className="hidden sm:flex gap-2 mr-4">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white/5 text-xs text-white/40 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-500/25"
            >
              Use This Template
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-slate-950">
          <DynamicPreviewRenderer
            definition={template.definition}
            currentPage="/"
            viewport="desktop"
            editable={false}
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/95 backdrop-blur flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-white/40">
            <span>
              <strong className="text-white/60">{template.definition.pages.length}</strong> page{template.definition.pages.length !== 1 ? "s" : ""}
            </span>
            <span>
              <strong className="text-white/60">{countSections(template)}</strong> sections
            </span>
          </div>
          <div className="text-white/40">
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Count total sections across all pages
 */
function countSections(template: Template): number {
  return template.definition.pages.reduce(
    (sum, page) => sum + page.sections.length,
    0
  );
}

export default TemplatePreviewModal;

