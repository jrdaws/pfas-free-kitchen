/**
 * Inventory Manager
 * 
 * Track stock levels, handle restocking, and manage inventory alerts.
 */

import { createClient } from "@/lib/supabase";

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  warehouse?: string;
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  userId: string;
  timestamp: Date;
}

/**
 * Get all inventory items
 */
export async function getInventory(options: {
  lowStockOnly?: boolean;
  warehouse?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: InventoryItem[]; total: number }> {
  const supabase = createClient();
  const { limit = 50, offset = 0 } = options;

  let query = supabase
    .from("inventory")
    .select("*, products(name, sku)", { count: "exact" })
    .range(offset, offset + limit - 1)
    .order("updated_at", { ascending: false });

  if (options.lowStockOnly) {
    query = query.lte("quantity", supabase.rpc("get_reorder_point", {}));
  }

  if (options.warehouse) {
    query = query.eq("warehouse", options.warehouse);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to get inventory:", error);
    return { items: [], total: 0 };
  }

  return {
    items: (data || []).map((row) => ({
      productId: row.product_id,
      productName: (row.products as Record<string, unknown>)?.name as string || "",
      sku: (row.products as Record<string, unknown>)?.sku as string || "",
      quantity: row.quantity,
      reorderPoint: row.reorder_point,
      reorderQuantity: row.reorder_quantity,
      warehouse: row.warehouse,
      lastUpdated: new Date(row.updated_at),
    })),
    total: count || 0,
  };
}

/**
 * Get low stock items
 */
export async function getLowStockItems(): Promise<InventoryItem[]> {
  const { items } = await getInventory({ lowStockOnly: true });
  return items.filter((item) => item.quantity <= item.reorderPoint);
}

/**
 * Update stock quantity
 */
export async function updateStock(
  productId: string,
  quantity: number,
  type: StockMovement["type"],
  reason: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  // Get current quantity
  const { data: current } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("product_id", productId)
    .single();

  if (!current) return false;

  let newQuantity: number;
  switch (type) {
    case "in":
      newQuantity = current.quantity + quantity;
      break;
    case "out":
      newQuantity = Math.max(0, current.quantity - quantity);
      break;
    case "adjustment":
      newQuantity = quantity;
      break;
  }

  // Update inventory
  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("product_id", productId);

  if (updateError) return false;

  // Log movement
  await supabase.from("stock_movements").insert({
    product_id: productId,
    type,
    quantity,
    reason,
    user_id: userId,
    created_at: new Date().toISOString(),
  });

  return true;
}

/**
 * Get stock movements for a product
 */
export async function getStockMovements(
  productId: string,
  limit = 50
): Promise<StockMovement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    type: row.type,
    quantity: row.quantity,
    reason: row.reason,
    userId: row.user_id,
    timestamp: new Date(row.created_at),
  }));
}

/**
 * Set reorder point
 */
export async function setReorderPoint(
  productId: string,
  reorderPoint: number,
  reorderQuantity: number
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("inventory")
    .update({
      reorder_point: reorderPoint,
      reorder_quantity: reorderQuantity,
    })
    .eq("product_id", productId);

  return !error;
}

/**
 * Calculate days until out of stock
 */
export function calculateDaysUntilOutOfStock(
  currentQuantity: number,
  avgDailySales: number
): number {
  if (avgDailySales <= 0) return Infinity;
  return Math.floor(currentQuantity / avgDailySales);
}

