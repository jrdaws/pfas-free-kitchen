"use client";

import { useState, useEffect } from "react";
import { ColorSwatches } from "./ColorSwatches";

interface VariantOption {
  name: string;
  value: string;
}

interface Variant {
  id: string;
  options: VariantOption[];
  price: number;
  quantity: number;
  image?: string;
}

interface ProductOption {
  name: string;
  values: string[];
}

interface VariantSelectorProps {
  options: ProductOption[];
  variants: Variant[];
  onVariantChange: (variant: Variant | null) => void;
  className?: string;
}

export function VariantSelector({
  options,
  variants,
  onVariantChange,
  className = "",
}: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<VariantOption[]>([]);

  // Initialize with first available variant
  useEffect(() => {
    if (options.length > 0 && selectedOptions.length === 0) {
      const initial = options.map((opt) => ({
        name: opt.name,
        value: opt.values[0],
      }));
      setSelectedOptions(initial);
    }
  }, [options, selectedOptions.length]);

  // Find matching variant when selection changes
  useEffect(() => {
    if (selectedOptions.length !== options.length) return;

    const matchingVariant = variants.find((variant) =>
      selectedOptions.every((selected) =>
        variant.options.some(
          (opt) => opt.name === selected.name && opt.value === selected.value
        )
      )
    );

    onVariantChange(matchingVariant || null);
  }, [selectedOptions, variants, options.length, onVariantChange]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) =>
      prev.map((opt) =>
        opt.name === optionName ? { ...opt, value } : opt
      )
    );
  };

  const isOptionAvailable = (optionName: string, value: string): boolean => {
    const testSelection = [
      ...selectedOptions.filter((o) => o.name !== optionName),
      { name: optionName, value },
    ];

    return variants.some(
      (variant) =>
        variant.quantity > 0 &&
        testSelection.every((selected) =>
          variant.options.some(
            (opt) => opt.name === selected.name && opt.value === selected.value
          )
        )
    );
  };

  const getSelectedValue = (optionName: string): string => {
    return selectedOptions.find((o) => o.name === optionName)?.value || "";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {options.map((option) => (
        <div key={option.name}>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            {option.name}:{" "}
            <span className="font-normal">{getSelectedValue(option.name)}</span>
          </label>

          {option.name.toLowerCase() === "color" ? (
            <ColorSwatches
              colors={option.values}
              selectedColor={getSelectedValue(option.name)}
              onSelect={(value) => handleOptionChange(option.name, value)}
              isAvailable={(value) => isOptionAvailable(option.name, value)}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = getSelectedValue(option.name) === value;
                const isAvailable = isOptionAvailable(option.name, value);

                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : isAvailable
                        ? "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:text-white"
                        : "border-gray-200 text-gray-400 line-through cursor-not-allowed dark:border-gray-700"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

