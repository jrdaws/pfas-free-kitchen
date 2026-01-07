"use client";

import { useState } from "react";
import { templates, type Template, type TemplateCategory } from "@/lib/patterns/templates";
import { cn } from "@/lib/utils";

interface TemplateGalleryProps {
  onSelect: (template: Template | null) => void;
  selectedId?: string;
}

const CATEGORIES: { id: "all" | TemplateCategory; label: string }[] = [
  { id: "all", label: "All Templates" },
  { id: "saas", label: "SaaS" },
  { id: "agency", label: "Agency" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "portfolio", label: "Portfolio" },
  { id: "startup", label: "Startup" },
];

/**
 * TemplateGallery
 * 
 * Displays a gallery of pre-designed templates for quick start.
 * Includes category filtering and a "blank" option.
 */
export function TemplateGallery({ onSelect, selectedId }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | TemplateCategory>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredTemplates =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          Start with a Template
        </h2>
        <p className="text-lg text-white/60 max-w-xl mx-auto">
          Choose a professionally designed template and customize it to match your brand
        </p>
      </div>

      {/* Category filter */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeCategory === cat.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blank template - always first */}
        <BlankTemplateCard 
          onSelect={() => onSelect(null)} 
          isSelected={selectedId === undefined}
        />

        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isHovered={hoveredId === template.id}
            isSelected={selectedId === template.id}
            onHover={() => setHoveredId(template.id)}
            onLeave={() => setHoveredId(null)}
            onSelect={() => onSelect(template)}
          />
        ))}
      </div>

      {/* Template count */}
      <div className="text-center mt-8 text-white/40 text-sm">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} available
      </div>
    </div>
  );
}

// ============================================================================
// Template Card
// ============================================================================

interface TemplateCardProps {
  template: Template;
  isHovered: boolean;
  isSelected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}

function TemplateCard({
  template,
  isHovered,
  isSelected,
  onHover,
  onLeave,
  onSelect,
}: TemplateCardProps) {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "group relative bg-slate-800/50 rounded-xl overflow-hidden border cursor-pointer transition-all duration-300",
        isSelected
          ? "border-orange-500 ring-2 ring-orange-500/30"
          : "border-white/5 hover:border-orange-500/50",
        isHovered && !isSelected && "-translate-y-1"
      )}
    >
      {/* Featured badge */}
      {template.featured && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
          Featured
        </div>
      )}

      {/* Preview image */}
      <div className="aspect-[16/10] bg-slate-700 relative overflow-hidden">
        {/* Placeholder gradient based on template colors */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${template.definition.branding.colors.primary}40, ${template.definition.branding.colors.secondary}40)`,
          }}
        />
        
        {/* Template name overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white/20">{template.name}</span>
        </div>

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end justify-center pb-4 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg shadow-lg">
            Use Template
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
          {isSelected && (
            <CheckIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-white/50 mt-1 line-clamp-2">
          {template.description}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-white/5 text-xs text-white/60 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Blank Template Card
// ============================================================================

function BlankTemplateCard({ 
  onSelect, 
  isSelected 
}: { 
  onSelect: () => void; 
  isSelected: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group bg-slate-800/30 rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[300px]",
        isSelected
          ? "border-orange-500 bg-orange-500/5"
          : "border-white/10 hover:border-orange-500/50 hover:bg-white/5"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
          isSelected ? "bg-orange-500/20" : "bg-slate-700 group-hover:bg-orange-500/20"
        )}
      >
        <PlusIcon
          className={cn(
            "w-8 h-8 transition-colors",
            isSelected ? "text-orange-400" : "text-white/40 group-hover:text-orange-400"
          )}
        />
      </div>
      <h3 className="text-lg font-semibold text-white">Start from Scratch</h3>
      <p className="text-sm text-white/50 mt-1">Build your own custom design</p>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default TemplateGallery;

