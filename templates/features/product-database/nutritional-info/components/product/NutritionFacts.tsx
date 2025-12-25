"use client";

import { NutritionalInfo, formatNutrient, formatDailyValue } from "@/lib/data/nutrition-schema";

interface NutritionFactsProps {
  nutrition: NutritionalInfo;
  className?: string;
}

export function NutritionFacts({ nutrition, className = "" }: NutritionFactsProps) {
  return (
    <div className={`border-2 border-black p-4 max-w-xs font-sans ${className}`}>
      <h3 className="text-3xl font-black mb-1">Nutrition Facts</h3>
      
      <div className="border-b-8 border-black pb-1 mb-1">
        <p className="text-sm">{nutrition.servingsPerContainer || 1} servings per container</p>
        <div className="flex justify-between items-end">
          <span className="font-bold">Serving size</span>
          <span className="font-bold">{nutrition.servingSize}</span>
        </div>
      </div>

      <div className="border-b-4 border-black py-1">
        <p className="text-sm font-bold">Amount per serving</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-black">Calories</span>
          <span className="text-3xl font-black">{nutrition.calories}</span>
        </div>
      </div>

      <div className="text-right text-sm font-bold py-1 border-b border-black">
        % Daily Value*
      </div>

      <NutrientRow 
        label="Total Fat" 
        value={formatNutrient(nutrition.totalFat)} 
        dailyValue={formatDailyValue(nutrition.totalFat)} 
        bold 
      />
      
      {nutrition.saturatedFat && (
        <NutrientRow 
          label="Saturated Fat" 
          value={formatNutrient(nutrition.saturatedFat)} 
          dailyValue={formatDailyValue(nutrition.saturatedFat)} 
          indent 
        />
      )}
      
      {nutrition.transFat && (
        <NutrientRow 
          label="Trans Fat" 
          value={formatNutrient(nutrition.transFat)} 
          indent 
        />
      )}

      {nutrition.cholesterol && (
        <NutrientRow 
          label="Cholesterol" 
          value={formatNutrient(nutrition.cholesterol)} 
          dailyValue={formatDailyValue(nutrition.cholesterol)} 
          bold 
        />
      )}

      <NutrientRow 
        label="Sodium" 
        value={formatNutrient(nutrition.sodium)} 
        dailyValue={formatDailyValue(nutrition.sodium)} 
        bold 
      />

      <NutrientRow 
        label="Total Carbohydrate" 
        value={formatNutrient(nutrition.totalCarbohydrate)} 
        dailyValue={formatDailyValue(nutrition.totalCarbohydrate)} 
        bold 
      />

      {nutrition.dietaryFiber && (
        <NutrientRow 
          label="Dietary Fiber" 
          value={formatNutrient(nutrition.dietaryFiber)} 
          dailyValue={formatDailyValue(nutrition.dietaryFiber)} 
          indent 
        />
      )}

      {nutrition.totalSugars && (
        <NutrientRow 
          label="Total Sugars" 
          value={formatNutrient(nutrition.totalSugars)} 
          indent 
        />
      )}

      <NutrientRow 
        label="Protein" 
        value={formatNutrient(nutrition.protein)} 
        dailyValue={formatDailyValue(nutrition.protein)} 
        bold 
        noBorder 
      />

      <div className="border-t-8 border-black pt-2 mt-2 text-xs">
        * The % Daily Value tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
      </div>
    </div>
  );
}

interface NutrientRowProps {
  label: string;
  value: string;
  dailyValue?: string;
  bold?: boolean;
  indent?: boolean;
  noBorder?: boolean;
}

function NutrientRow({ label, value, dailyValue, bold, indent, noBorder }: NutrientRowProps) {
  return (
    <div className={`flex justify-between py-1 ${noBorder ? "" : "border-b border-gray-300"}`}>
      <span className={`${bold ? "font-bold" : ""} ${indent ? "pl-4" : ""}`}>
        {label} {value}
      </span>
      {dailyValue && <span className="font-bold">{dailyValue}</span>}
    </div>
  );
}

