/**
 * Product Variants
 * 
 * Handle product options like size, color, and other attributes.
 */

import { createClient } from "@/lib/supabase";

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  options: VariantOption[];
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image?: string;
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

/**
 * Get variants for a product
 */
export async function getProductVariants(productId: string): Promise<Variant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at");

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    options: row.options || [],
    price: row.price,
    compareAtPrice: row.compare_at_price,
    quantity: row.quantity,
    image: row.image_url,
  }));
}

/**
 * Get variant by selected options
 */
export async function getVariantByOptions(
  productId: string,
  selectedOptions: VariantOption[]
): Promise<Variant | null> {
  const variants = await getProductVariants(productId);

  return (
    variants.find((variant) =>
      selectedOptions.every((selected) =>
        variant.options.some(
          (opt) => opt.name === selected.name && opt.value === selected.value
        )
      )
    ) || null
  );
}

/**
 * Get available option values for a product
 */
export async function getAvailableOptions(productId: string): Promise<ProductOption[]> {
  const variants = await getProductVariants(productId);

  const optionMap = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const option of variant.options) {
      if (!optionMap.has(option.name)) {
        optionMap.set(option.name, new Set());
      }
      optionMap.get(option.name)!.add(option.value);
    }
  }

  return Array.from(optionMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
}

/**
 * Check if option combination is available
 */
export function isOptionAvailable(
  variants: Variant[],
  currentSelection: VariantOption[],
  optionName: string,
  optionValue: string
): boolean {
  const testSelection = [
    ...currentSelection.filter((o) => o.name !== optionName),
    { name: optionName, value: optionValue },
  ];

  return variants.some((variant) =>
    variant.quantity > 0 &&
    testSelection.every((selected) =>
      variant.options.some(
        (opt) => opt.name === selected.name && opt.value === selected.value
      )
    )
  );
}

/**
 * Generate size chart data
 */
export interface SizeChartEntry {
  size: string;
  measurements: Record<string, string>;
}

export const SIZE_CHARTS: Record<string, SizeChartEntry[]> = {
  clothing: [
    { size: "XS", measurements: { chest: "32-34", waist: "24-26", hips: "34-36" } },
    { size: "S", measurements: { chest: "34-36", waist: "26-28", hips: "36-38" } },
    { size: "M", measurements: { chest: "36-38", waist: "28-30", hips: "38-40" } },
    { size: "L", measurements: { chest: "38-40", waist: "30-32", hips: "40-42" } },
    { size: "XL", measurements: { chest: "40-42", waist: "32-34", hips: "42-44" } },
    { size: "XXL", measurements: { chest: "42-44", waist: "34-36", hips: "44-46" } },
  ],
  shoes: [
    { size: "6", measurements: { us: "6", uk: "5.5", eu: "38" } },
    { size: "7", measurements: { us: "7", uk: "6.5", eu: "39" } },
    { size: "8", measurements: { us: "8", uk: "7.5", eu: "40" } },
    { size: "9", measurements: { us: "9", uk: "8.5", eu: "41" } },
    { size: "10", measurements: { us: "10", uk: "9.5", eu: "42" } },
    { size: "11", measurements: { us: "11", uk: "10.5", eu: "43" } },
  ],
};

/**
 * Color definitions
 */
export interface ColorDefinition {
  name: string;
  hex: string;
  image?: string;
}

export const COMMON_COLORS: ColorDefinition[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#001F3F" },
  { name: "Red", hex: "#FF4136" },
  { name: "Blue", hex: "#0074D9" },
  { name: "Green", hex: "#2ECC40" },
  { name: "Yellow", hex: "#FFDC00" },
  { name: "Orange", hex: "#FF851B" },
  { name: "Purple", hex: "#B10DC9" },
  { name: "Pink", hex: "#F012BE" },
  { name: "Gray", hex: "#AAAAAA" },
  { name: "Brown", hex: "#8B4513" },
];

