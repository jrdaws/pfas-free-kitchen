"use client";

interface StockLevelBarProps {
  quantity: number;
  reorderPoint: number;
  maxQuantity?: number;
}

export function StockLevelBar({
  quantity,
  reorderPoint,
  maxQuantity = reorderPoint * 5,
}: StockLevelBarProps) {
  const percentage = Math.min((quantity / maxQuantity) * 100, 100);
  const isLow = quantity <= reorderPoint;
  const isCritical = quantity <= reorderPoint * 0.5;

  const getColor = () => {
    if (isCritical) return "bg-red-500";
    if (isLow) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`text-sm font-medium ${
          isCritical
            ? "text-red-600 dark:text-red-400"
            : isLow
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {quantity}
      </span>
      {isLow && (
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            isCritical
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {isCritical ? "Critical" : "Low"}
        </span>
      )}
    </div>
  );
}

