"use client";

import { TEMPLATES } from "@/lib/templates";
import { Package, ShoppingCart, FileText, BarChart3, Code, FolderTree, Rocket, LucideIcon } from "lucide-react";

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  saas: Package,
  ecommerce: ShoppingCart,
  blog: FileText,
  dashboard: BarChart3,
  "landing-page": Rocket,
  "api-backend": Code,
  "seo-directory": FolderTree,
};

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
          Choose Your Template
        </h2>
        <p className="text-terminal-dim">
          Select a starting point for your project. All templates are production-ready.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(TEMPLATES).map((template) => {
          const Icon = TEMPLATE_ICONS[template.id] || Package;
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`
                p-6 rounded-lg border-2 transition-all text-left
                hover:scale-105 hover:shadow-lg
                ${
                  isSelected
                    ? "border-terminal-accent bg-terminal-accent/10 shadow-lg shadow-terminal-accent/20"
                    : "border-terminal-text/30 hover:border-terminal-text/50"
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    p-3 rounded-lg
                    ${
                      isSelected
                        ? "bg-terminal-accent/20 text-terminal-accent"
                        : "bg-terminal-text/10 text-terminal-text"
                    }
                  `}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-terminal-text mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-terminal-dim mb-3">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-terminal-text/10 text-terminal-text font-mono">
                      {template.category}
                    </span>
                    {template.requiredIntegrations.length > 0 && (
                      <span className="text-xs text-terminal-accent font-mono">
                        {template.requiredIntegrations.length} required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-terminal-accent/30">
                  <p className="text-xs text-terminal-accent font-mono">
                    ✓ Selected
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
