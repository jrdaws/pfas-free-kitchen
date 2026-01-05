/**
 * Product and E-commerce Types
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // In cents
  compareAtPrice?: number;
  images: string[];
  category: string;
  tags?: string[];
  variants?: ProductVariant[];
  inStock: boolean;
  stockQuantity?: number;
  sku?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  productCount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customer: CustomerInfo;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image?: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Address {
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/**
 * Format price from cents to currency string
 */
export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(price: number, compareAtPrice: number): number {
  return Math.round((1 - price / compareAtPrice) * 100);
}

