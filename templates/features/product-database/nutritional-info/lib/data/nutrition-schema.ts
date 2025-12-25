/**
 * Nutrition Schema
 * 
 * Data types and utilities for nutritional information.
 */

export interface NutritionalInfo {
  servingSize: string;
  servingsPerContainer?: number;
  calories: number;
  totalFat: NutrientValue;
  saturatedFat?: NutrientValue;
  transFat?: NutrientValue;
  cholesterol?: NutrientValue;
  sodium: NutrientValue;
  totalCarbohydrate: NutrientValue;
  dietaryFiber?: NutrientValue;
  totalSugars?: NutrientValue;
  addedSugars?: NutrientValue;
  protein: NutrientValue;
  vitaminD?: NutrientValue;
  calcium?: NutrientValue;
  iron?: NutrientValue;
  potassium?: NutrientValue;
}

export interface NutrientValue {
  amount: number;
  unit: "g" | "mg" | "mcg" | "%";
  dailyValue?: number; // Percentage of daily value
}

/**
 * Format nutrient for display
 */
export function formatNutrient(value: NutrientValue): string {
  return `${value.amount}${value.unit}`;
}

/**
 * Format daily value percentage
 */
export function formatDailyValue(value: NutrientValue | undefined): string {
  if (!value?.dailyValue) return "";
  return `${value.dailyValue}%`;
}

/**
 * Calculate calories from macros
 */
export function calculateCalories(
  protein: number,
  carbs: number,
  fat: number
): number {
  return protein * 4 + carbs * 4 + fat * 9;
}

/**
 * Default empty nutritional info
 */
export const EMPTY_NUTRITION: NutritionalInfo = {
  servingSize: "1 serving",
  calories: 0,
  totalFat: { amount: 0, unit: "g", dailyValue: 0 },
  sodium: { amount: 0, unit: "mg", dailyValue: 0 },
  totalCarbohydrate: { amount: 0, unit: "g", dailyValue: 0 },
  protein: { amount: 0, unit: "g", dailyValue: 0 },
};

/**
 * Parse nutrition from API response
 */
export function parseNutrition(data: Record<string, unknown>): NutritionalInfo {
  return {
    servingSize: (data.servingSize as string) || "1 serving",
    servingsPerContainer: data.servingsPerContainer as number | undefined,
    calories: (data.calories as number) || 0,
    totalFat: parseNutrientValue(data.totalFat),
    saturatedFat: data.saturatedFat ? parseNutrientValue(data.saturatedFat) : undefined,
    sodium: parseNutrientValue(data.sodium),
    totalCarbohydrate: parseNutrientValue(data.totalCarbohydrate),
    dietaryFiber: data.dietaryFiber ? parseNutrientValue(data.dietaryFiber) : undefined,
    protein: parseNutrientValue(data.protein),
  };
}

function parseNutrientValue(value: unknown): NutrientValue {
  if (typeof value === "object" && value !== null) {
    const v = value as Record<string, unknown>;
    return {
      amount: (v.amount as number) || 0,
      unit: (v.unit as NutrientValue["unit"]) || "g",
      dailyValue: v.dailyValue as number | undefined,
    };
  }
  return { amount: 0, unit: "g" };
}

