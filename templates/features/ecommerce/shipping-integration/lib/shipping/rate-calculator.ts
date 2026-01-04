/**
 * Shipping Rate Calculator
 * 
 * Calculate shipping costs based on various factors.
 */

import { Address, Package, ShippingRate, getShippingRates } from "./carriers";

export interface ShippingCalculation {
  rates: ShippingRate[];
  freeShippingEligible: boolean;
  freeShippingThreshold: number;
  subtotal: number;
  amountToFreeShipping: number;
}

// Configuration
const FREE_SHIPPING_THRESHOLD = 50; // $50 for free shipping
const FREE_SHIPPING_SERVICE = "usps_ground"; // Service to use for free shipping

/**
 * Calculate shipping for cart
 */
export async function calculateShipping(
  origin: Address,
  destination: Address,
  packages: Package[],
  subtotal: number
): Promise<ShippingCalculation> {
  const rates = await getShippingRates(origin, destination, packages);
  const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // If eligible for free shipping, add a $0 option
  if (freeShippingEligible) {
    const freeRate = rates.find((r) => r.id === FREE_SHIPPING_SERVICE);
    if (freeRate) {
      rates.unshift({
        ...freeRate,
        id: "free_shipping",
        service: "Free Standard Shipping",
        price: 0,
      });
    }
  }

  return {
    rates,
    freeShippingEligible,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    subtotal,
    amountToFreeShipping,
  };
}

/**
 * Get estimated delivery date
 */
export function getEstimatedDeliveryDate(days: number): Date {
  const date = new Date();
  let addedDays = 0;

  while (addedDays < days) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return date;
}

/**
 * Format delivery estimate
 */
export function formatDeliveryEstimate(days: number): string {
  if (days === 1) return "Tomorrow";
  if (days <= 2) return "1-2 business days";

  const date = getEstimatedDeliveryDate(days);
  return `${days} business days (by ${date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })})`;
}

/**
 * Calculate dimensional weight
 */
export function calculateDimensionalWeight(pkg: Package): number {
  const dimFactor = 139; // Standard DIM factor for USPS/UPS/FedEx
  return Math.ceil((pkg.length * pkg.width * pkg.height) / dimFactor);
}

/**
 * Get billable weight (higher of actual or dimensional)
 */
export function getBillableWeight(pkg: Package): number {
  const dimWeight = calculateDimensionalWeight(pkg);
  const actualWeight = Math.ceil(pkg.weight / 16); // Convert oz to lbs
  return Math.max(dimWeight, actualWeight);
}

/**
 * Validate address (basic)
 */
export function validateAddress(address: Address): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!address.street1?.trim()) {
    errors.push("Street address is required");
  }
  if (!address.city?.trim()) {
    errors.push("City is required");
  }
  if (!address.state?.trim()) {
    errors.push("State is required");
  }
  if (!address.postalCode?.trim()) {
    errors.push("Postal code is required");
  }
  if (!address.country?.trim()) {
    errors.push("Country is required");
  }

  // Basic US postal code validation
  if (address.country === "US" && address.postalCode) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(address.postalCode)) {
      errors.push("Invalid US postal code format");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

