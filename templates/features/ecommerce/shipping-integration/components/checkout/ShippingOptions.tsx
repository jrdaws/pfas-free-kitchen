"use client";

import { ShippingRate } from "@/lib/shipping/carriers";
import { formatDeliveryEstimate } from "@/lib/shipping/rate-calculator";

interface ShippingOptionsProps {
  rates: ShippingRate[];
  selectedRateId: string | null;
  onSelect: (rateId: string) => void;
  freeShippingEligible?: boolean;
  amountToFreeShipping?: number;
  loading?: boolean;
  className?: string;
}

export function ShippingOptions({
  rates,
  selectedRateId,
  onSelect,
  freeShippingEligible = false,
  amountToFreeShipping = 0,
  loading = false,
  className = "",
}: ShippingOptionsProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {!freeShippingEligible && amountToFreeShipping > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Add{" "}
            <span className="font-medium">${amountToFreeShipping.toFixed(2)}</span>{" "}
            more for free shipping!
          </p>
        </div>
      )}

      <div className="space-y-2">
        {rates.map((rate) => {
          const isSelected = selectedRateId === rate.id;
          const isFree = rate.price === 0;

          return (
            <label
              key={rate.id}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={rate.id}
                  checked={isSelected}
                  onChange={() => onSelect(rate.id)}
                  className="text-blue-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium dark:text-white">
                      {rate.service}
                    </span>
                    {isFree && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rate.carrier} • {formatDeliveryEstimate(rate.estimatedDays)}
                  </p>
                </div>
              </div>
              <span
                className={`font-medium ${
                  isFree
                    ? "text-green-600 dark:text-green-400"
                    : "dark:text-white"
                }`}
              >
                {formatPrice(rate.price)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

