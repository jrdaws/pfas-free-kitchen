import type { CartItem } from "./cart-context";

/**
 * Format a price as currency
 */
export function formatPrice(
  price: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Calculate cart subtotal
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate total item count
 */
export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calculate tax amount
 */
export function calculateTax(subtotal: number, taxRate = 0.08): number {
  return subtotal * taxRate;
}

/**
 * Calculate shipping (example logic)
 */
export function calculateShipping(subtotal: number): number {
  if (subtotal === 0) return 0;
  if (subtotal >= 100) return 0; // Free shipping over $100
  return 9.99;
}

/**
 * Calculate order total
 */
export function calculateTotal(
  subtotal: number,
  taxRate = 0.08,
  shippingCost?: number
): number {
  const tax = calculateTax(subtotal, taxRate);
  const shipping = shippingCost ?? calculateShipping(subtotal);
  return subtotal + tax + shipping;
}

/**
 * Generate a unique cart item ID
 */
export function generateCartItemId(
  productId: string,
  variant?: string
): string {
  return variant ? `${productId}-${variant}` : productId;
}

/**
 * Check if cart has items
 */
export function isCartEmpty(items: CartItem[]): boolean {
  return items.length === 0;
}

/**
 * Get cart item by ID
 */
export function getCartItem(
  items: CartItem[],
  id: string
): CartItem | undefined {
  return items.find((item) => item.id === id);
}

/**
 * Cart summary for display
 */
export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  formattedSubtotal: string;
  formattedTax: string;
  formattedShipping: string;
  formattedTotal: string;
}

export function getCartSummary(
  items: CartItem[],
  taxRate = 0.08,
  currency = "USD"
): CartSummary {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  return {
    itemCount: calculateItemCount(items),
    subtotal,
    tax,
    shipping,
    total,
    formattedSubtotal: formatPrice(subtotal, currency),
    formattedTax: formatPrice(tax, currency),
    formattedShipping: shipping === 0 ? "FREE" : formatPrice(shipping, currency),
    formattedTotal: formatPrice(total, currency),
  };
}

