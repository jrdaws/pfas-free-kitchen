/**
 * Transaction Management
 */

import { createClient } from "@/lib/supabase/client";

export type PaymentStatus = "pending" | "paid" | "refunded" | "disputed";
export type ShippingStatus = "pending" | "shipped" | "in_transit" | "delivered" | "returned";

export interface Transaction {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  
  // Pricing
  salePrice: number;
  shippingCost: number;
  platformFee: number;
  totalAmount: number;
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentIntentId?: string;
  paidAt?: string;
  
  // Shipping
  shippingStatus: ShippingStatus;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Address
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Relations
  listing?: {
    id: string;
    title: string;
    images: string[];
  };
  seller?: {
    displayName: string;
    avatarUrl?: string;
  };
  buyer?: {
    displayName: string;
    avatarUrl?: string;
  };
}

const supabase = createClient();

/**
 * Get transactions for current user (as buyer)
 */
export async function getMyPurchases(
  status?: PaymentStatus[]
): Promise<Transaction[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  let query = supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(id, title, images),
      seller:seller_profiles!seller_id(display_name, avatar_url)
    `)
    .eq("buyer_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (status && status.length > 0) {
    query = query.in("payment_status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(transformTransaction);
}

/**
 * Get transactions for current user (as seller)
 */
export async function getMySales(
  status?: PaymentStatus[]
): Promise<Transaction[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  let query = supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(id, title, images),
      buyer:seller_profiles!buyer_id(display_name, avatar_url)
    `)
    .eq("seller_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (status && status.length > 0) {
    query = query.in("payment_status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(transformTransaction);
}

/**
 * Get single transaction
 */
export async function getTransaction(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(id, title, images),
      seller:seller_profiles!seller_id(display_name, avatar_url),
      buyer:seller_profiles!buyer_id(display_name, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return transformTransaction(data);
}

/**
 * Create transaction (called after successful payment)
 */
export async function createTransaction(input: {
  listingId: string;
  sellerId: string;
  salePrice: number;
  shippingCost: number;
  paymentIntentId?: string;
  shippingAddress?: Transaction["shippingAddress"];
}): Promise<Transaction> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Must be logged in");
  }

  const platformFee = Math.round(input.salePrice * 0.05 * 100) / 100; // 5% fee
  const totalAmount = input.salePrice + input.shippingCost;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      listing_id: input.listingId,
      seller_id: input.sellerId,
      buyer_id: userData.user.id,
      sale_price: input.salePrice,
      shipping_cost: input.shippingCost,
      platform_fee: platformFee,
      total_amount: totalAmount,
      payment_intent_id: input.paymentIntentId,
      payment_status: input.paymentIntentId ? "paid" : "pending",
      paid_at: input.paymentIntentId ? new Date().toISOString() : null,
      shipping_address: input.shippingAddress,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update listing status to sold
  await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", input.listingId);

  return transformTransaction(data);
}

/**
 * Update shipping info (seller action)
 */
export async function updateShipping(
  transactionId: string,
  updates: {
    trackingNumber?: string;
    carrier?: string;
    shippingStatus?: ShippingStatus;
  }
): Promise<Transaction> {
  const updateData: Record<string, unknown> = {};

  if (updates.trackingNumber !== undefined) {
    updateData.tracking_number = updates.trackingNumber;
  }
  if (updates.carrier !== undefined) {
    updateData.carrier = updates.carrier;
  }
  if (updates.shippingStatus !== undefined) {
    updateData.shipping_status = updates.shippingStatus;
    if (updates.shippingStatus === "shipped") {
      updateData.shipped_at = new Date().toISOString();
    }
    if (updates.shippingStatus === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", transactionId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformTransaction(data);
}

/**
 * Get transaction stats for dashboard
 */
export async function getTransactionStats(): Promise<{
  totalPurchases: number;
  totalSales: number;
  pendingShipments: number;
  awaitingDelivery: number;
}> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      totalPurchases: 0,
      totalSales: 0,
      pendingShipments: 0,
      awaitingDelivery: 0,
    };
  }

  const [purchases, sales, pendingShip, awaitingDel] = await Promise.all([
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", userData.user.id)
      .eq("payment_status", "paid"),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", userData.user.id)
      .eq("payment_status", "paid"),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", userData.user.id)
      .eq("shipping_status", "pending"),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", userData.user.id)
      .in("shipping_status", ["shipped", "in_transit"]),
  ]);

  return {
    totalPurchases: purchases.count || 0,
    totalSales: sales.count || 0,
    pendingShipments: pendingShip.count || 0,
    awaitingDelivery: awaitingDel.count || 0,
  };
}

// Helper
function transformTransaction(data: Record<string, unknown>): Transaction {
  return {
    id: data.id as string,
    listingId: data.listing_id as string,
    sellerId: data.seller_id as string,
    buyerId: data.buyer_id as string,
    salePrice: Number(data.sale_price) || 0,
    shippingCost: Number(data.shipping_cost) || 0,
    platformFee: Number(data.platform_fee) || 0,
    totalAmount: Number(data.total_amount) || 0,
    paymentStatus: data.payment_status as PaymentStatus,
    paymentMethod: data.payment_method as string | undefined,
    paymentIntentId: data.payment_intent_id as string | undefined,
    paidAt: data.paid_at as string | undefined,
    shippingStatus: data.shipping_status as ShippingStatus,
    trackingNumber: data.tracking_number as string | undefined,
    carrier: data.carrier as string | undefined,
    shippedAt: data.shipped_at as string | undefined,
    deliveredAt: data.delivered_at as string | undefined,
    shippingAddress: data.shipping_address as Transaction["shippingAddress"],
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    listing: data.listing as Transaction["listing"],
    seller: data.seller
      ? {
          displayName: (data.seller as Record<string, unknown>).display_name as string,
          avatarUrl: (data.seller as Record<string, unknown>).avatar_url as string | undefined,
        }
      : undefined,
    buyer: data.buyer
      ? {
          displayName: (data.buyer as Record<string, unknown>).display_name as string,
          avatarUrl: (data.buyer as Record<string, unknown>).avatar_url as string | undefined,
        }
      : undefined,
  };
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Payment Pending",
  paid: "Paid",
  refunded: "Refunded",
  disputed: "Disputed",
};

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  pending: "Awaiting Shipment",
  shipped: "Shipped",
  in_transit: "In Transit",
  delivered: "Delivered",
  returned: "Returned",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-yellow-500",
  paid: "bg-emerald-500",
  refunded: "bg-red-500",
  disputed: "bg-orange-500",
};

export const SHIPPING_STATUS_COLORS: Record<ShippingStatus, string> = {
  pending: "bg-slate-500",
  shipped: "bg-blue-500",
  in_transit: "bg-blue-400",
  delivered: "bg-emerald-500",
  returned: "bg-red-500",
};

