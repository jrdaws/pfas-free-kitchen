"use client";

import { useState } from "react";

interface ProductFiltersProps {
  categories: string[];
  onFilterChange?: (filters: { category?: string; priceRange?: [number, number] }) => void;
}

export function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange?.({ category: category === "All" ? undefined : category, priceRange });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
        <div className="space-y-2">
          {[
            { label: "Under $50", range: [0, 50] },
            { label: "$50 - $100", range: [50, 100] },
            { label: "$100 - $200", range: [100, 200] },
            { label: "Over $200", range: [200, 10000] },
          ].map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <input
                type="checkbox"
                className="rounded border-border"
                onChange={(e) => {
                  if (e.target.checked) {
                    setPriceRange(option.range as [number, number]);
                    onFilterChange?.({ category: selectedCategory === "All" ? undefined : selectedCategory, priceRange: option.range as [number, number] });
                  }
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setSelectedCategory("All");
          setPriceRange([0, 1000]);
          onFilterChange?.({});
        }}
        className="text-sm text-primary hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}

