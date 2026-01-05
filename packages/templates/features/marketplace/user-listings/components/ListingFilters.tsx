"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { ListingFilters, ItemCondition, ListingType, ListingCategory } from "../lib/listing-types";
import { CONDITION_LABELS, LISTING_TYPE_LABELS } from "../lib/listing-types";
import { getCategories } from "../lib/listings";

interface ListingFiltersProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
}

export function ListingFiltersBar({ filters, onChange }: ListingFiltersProps) {
  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...filters, search: searchValue || undefined });
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    onChange({ ...filters, categoryId });
  };

  const handleConditionToggle = (condition: ItemCondition) => {
    const current = filters.condition || [];
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    onChange({ ...filters, condition: updated.length > 0 ? updated : undefined });
  };

  const handleTypeChange = (listingType: ListingType | undefined) => {
    onChange({ ...filters, listingType });
  };

  const handlePriceChange = (min?: number, max?: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleEndingSoonToggle = () => {
    onChange({ ...filters, endingSoon: !filters.endingSoon });
  };

  const clearFilters = () => {
    setSearchValue("");
    onChange({});
  };

  const hasActiveFilters =
    filters.search ||
    filters.categoryId ||
    (filters.condition && filters.condition.length > 0) ||
    filters.listingType ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.endingSoon;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-orange-500 text-white"
              : "bg-slate-800 border border-slate-700 text-white hover:border-orange-500"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-white" />
          )}
        </button>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl space-y-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !filters.categoryId
                    ? "bg-orange-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.categoryId === cat.id
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Listing Type
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeChange(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !filters.listingType
                    ? "bg-orange-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All
              </button>
              {(Object.keys(LISTING_TYPE_LABELS) as ListingType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.listingType === type
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {LISTING_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CONDITION_LABELS) as ItemCondition[]).map((condition) => (
                <button
                  key={condition}
                  onClick={() => handleConditionToggle(condition)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.condition?.includes(condition)
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {CONDITION_LABELS[condition]}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  handlePriceChange(
                    e.target.value ? Number(e.target.value) : undefined,
                    filters.maxPrice
                  )
                }
                className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <span className="text-slate-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  handlePriceChange(
                    filters.minPrice,
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <button
              onClick={handleEndingSoonToggle}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filters.endingSoon
                  ? "bg-red-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              🔥 Ending Soon
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingFiltersBar;

