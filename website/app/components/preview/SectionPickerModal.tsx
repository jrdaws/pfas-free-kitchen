"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { X, Search } from "lucide-react";

// Section templates with categories
const SECTION_TEMPLATES = {
  hero: {
    label: "Hero",
    emoji: "🌟",
    patterns: [
      { id: "hero-centered", name: "Centered Hero", description: "Classic centered headline with CTA" },
      { id: "hero-split", name: "Split Hero", description: "Text on left, image on right" },
      { id: "hero-gradient", name: "Gradient Hero", description: "Bold gradient background" },
      { id: "hero-video", name: "Video Hero", description: "Background video with overlay" },
      { id: "hero-animated", name: "Animated Hero", description: "Text with typing animation" },
    ],
  },
  features: {
    label: "Features",
    emoji: "✨",
    patterns: [
      { id: "features-grid", name: "Feature Grid", description: "3-column icon grid" },
      { id: "features-bento", name: "Bento Grid", description: "Asymmetric card layout" },
      { id: "features-alternating", name: "Alternating Rows", description: "Image-text alternating sections" },
      { id: "features-comparison", name: "Comparison Table", description: "Side-by-side feature comparison" },
      { id: "features-cards", name: "Feature Cards", description: "Expandable feature cards" },
    ],
  },
  "social-proof": {
    label: "Social Proof",
    emoji: "💬",
    patterns: [
      { id: "testimonials-grid", name: "Testimonial Cards", description: "Customer quote cards" },
      { id: "testimonials-carousel", name: "Testimonial Carousel", description: "Sliding testimonials" },
      { id: "logos-wall", name: "Logo Wall", description: "Client/partner logos grid" },
      { id: "stats-section", name: "Stats Section", description: "Key metrics display" },
    ],
  },
  pricing: {
    label: "Pricing",
    emoji: "💰",
    patterns: [
      { id: "pricing-three-tier", name: "3-Tier Pricing", description: "Standard pricing table" },
      { id: "pricing-comparison", name: "Pricing Comparison", description: "Feature comparison pricing" },
      { id: "pricing-toggle", name: "Toggle Pricing", description: "Monthly/yearly toggle" },
    ],
  },
  cta: {
    label: "Call to Action",
    emoji: "📢",
    patterns: [
      { id: "cta-simple", name: "Simple CTA", description: "Centered headline with button" },
      { id: "cta-split", name: "Split CTA", description: "Text and form side by side" },
      { id: "cta-banner", name: "Banner CTA", description: "Full-width promotional banner" },
    ],
  },
  faq: {
    label: "FAQ",
    emoji: "❓",
    patterns: [
      { id: "faq-accordion", name: "FAQ Accordion", description: "Expandable Q&A list" },
      { id: "faq-grid", name: "FAQ Grid", description: "Two-column FAQ layout" },
      { id: "faq-tabs", name: "FAQ Tabs", description: "Categorized FAQ with tabs" },
    ],
  },
  team: {
    label: "Team",
    emoji: "👥",
    patterns: [
      { id: "team-grid", name: "Team Grid", description: "Team member cards" },
      { id: "team-carousel", name: "Team Carousel", description: "Sliding team members" },
    ],
  },
  product: {
    label: "Product",
    emoji: "🛍️",
    patterns: [
      { id: "product-grid", name: "Product Grid", description: "E-commerce product cards" },
      { id: "product-featured", name: "Featured Product", description: "Single product showcase" },
    ],
  },
};

type CategoryId = keyof typeof SECTION_TEMPLATES;

interface SectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patternId: string) => void;
}

export function SectionPickerModal({
  isOpen,
  onClose,
  onSelect,
}: SectionPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("hero");
  const [searchQuery, setSearchQuery] = useState("");

  // Get all patterns filtered by search
  const filteredPatterns = useMemo(() => {
    if (!searchQuery.trim()) {
      return SECTION_TEMPLATES[activeCategory].patterns.map(p => ({
        ...p,
        category: activeCategory,
      }));
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{ id: string; name: string; description: string; category: CategoryId }> = [];

    for (const [categoryId, category] of Object.entries(SECTION_TEMPLATES)) {
      for (const pattern of category.patterns) {
        if (
          pattern.name.toLowerCase().includes(query) ||
          pattern.description.toLowerCase().includes(query)
        ) {
          results.push({ ...pattern, category: categoryId as CategoryId });
        }
      }
    }

    return results;
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-stone-900 rounded-2xl w-full max-w-4xl max-h-[80vh] flex overflow-hidden border border-stone-700/50 shadow-2xl">
        {/* Sidebar */}
        <div className="w-48 border-r border-stone-700/50 p-4 flex-shrink-0 bg-stone-900/50">
          <h2 className="text-lg font-semibold text-white mb-4">Add Section</h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2",
                "bg-stone-800 border border-stone-700",
                "rounded-lg text-sm text-white placeholder:text-stone-500",
                "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
              )}
            />
          </div>

          {/* Categories */}
          <nav className="space-y-1">
            {Object.entries(SECTION_TEMPLATES).map(([id, category]) => (
              <button
                key={id}
                onClick={() => {
                  setActiveCategory(id as CategoryId);
                  setSearchQuery("");
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeCategory === id && !searchQuery
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-stone-400 hover:text-white hover:bg-stone-800"
                )}
              >
                <span>{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Pattern grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {filteredPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => {
                  onSelect(pattern.id);
                  onClose();
                }}
                className={cn(
                  "group relative text-left",
                  "bg-stone-800/50 hover:bg-stone-800",
                  "border border-stone-700/50 hover:border-orange-500/50",
                  "rounded-xl overflow-hidden transition-all duration-200",
                  "hover:shadow-lg hover:shadow-orange-500/10"
                )}
              >
                {/* Pattern preview/thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-stone-700/50 to-stone-800 flex items-center justify-center">
                  <span className="text-4xl opacity-50 group-hover:opacity-75 transition-opacity">
                    {SECTION_TEMPLATES[pattern.category]?.emoji || "📐"}
                  </span>
                </div>

                {/* Pattern info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                    {pattern.name}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                    {pattern.description}
                  </p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg shadow-lg">
                    Add Section
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredPatterns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-500">No patterns found</p>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-stone-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>
      </div>
    </div>
  );
}

export default SectionPickerModal;

