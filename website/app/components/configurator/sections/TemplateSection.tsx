"use client";

import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface TemplateSectionProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

// Icons for each template
const TEMPLATE_ICONS: Record<string, string> = {
  saas: "🚀",
  ecommerce: "🛒",
  blog: "📝",
  portfolio: "💼",
  dashboard: "📊",
  landing: "🎯",
};

const TEMPLATE_LIST = Object.entries(TEMPLATES).map(([templateId, template]) => ({
  id: templateId,
  name: template.name,
  description: template.description,
  icon: TEMPLATE_ICONS[templateId] || "📦",
}));

export function TemplateSection({
  selectedTemplate,
  onTemplateChange,
}: TemplateSectionProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-white/50">
        Choose a template
      </p>
      
      <div className="space-y-1">
        {TEMPLATE_LIST.slice(0, 4).map((template) => {
          const isSelected = selectedTemplate === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => onTemplateChange(template.id)}
              className={cn(
                "w-full text-left p-2 rounded-md border transition-all",
                isSelected
                  ? "bg-[var(--primary)]/15 border-[var(--primary)]/40"
                  : "bg-black/20 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{template.icon}</span>
                <span className={cn(
                  "font-medium text-xs flex-1 truncate",
                  isSelected ? "text-[var(--primary)]" : "text-white/90"
                )}>
                  {template.name}
                </span>
                {isSelected && (
                  <Check className="h-3 w-3 text-[var(--primary)] shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedTemplate && (
        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
          <Sparkles className="h-2.5 w-2.5" />
          <span>Selected</span>
        </div>
      )}
    </div>
  );
}

