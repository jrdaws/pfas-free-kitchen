"use client";

import { useEffect, useState } from "react";
import { StockLevelBar } from "@/components/inventory/StockLevelBar";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";

interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reorderPoint: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low">("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter === "low") params.set("lowStock", "true");

    fetch(`/api/admin/inventory?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const lowStockCount = items.filter((i) => i.quantity <= i.reorderPoint).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Inventory</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Stock
        </button>
      </div>

      {lowStockCount > 0 && <LowStockAlert count={lowStockCount} />}

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 dark:text-white"
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`px-4 py-2 rounded-lg ${
            filter === "low"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 dark:text-white"
          }`}
        >
          Low Stock
          {lowStockCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  SKU
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stock Level
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.productId}
                  className="border-b border-gray-100 dark:border-gray-700"
                >
                  <td className="py-3 px-4 dark:text-white">{item.productName}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono text-sm">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4">
                    <StockLevelBar
                      quantity={item.quantity}
                      reorderPoint={item.reorderPoint}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

