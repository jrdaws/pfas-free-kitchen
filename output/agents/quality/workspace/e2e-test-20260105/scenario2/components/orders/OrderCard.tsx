"use client";

import Link from "next/link";
import { getOrderStatusDisplay } from "@/lib/checkout/process-order";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  products?: {
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  className?: string;
}

export function OrderCard({ order, className = "" }: OrderCardProps) {
  const statusDisplay = getOrderStatusDisplay(order.status);
  const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

  const statusColors = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Link
      href={`/orders/${order.id}`}
      className={`block bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {order.id}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[statusDisplay.color]}`}
        >
          {statusDisplay.label}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {/* Item thumbnails */}
        <div className="flex -space-x-2">
          {order.order_items.slice(0, 3).map((item, index) => (
            <div
              key={item.id}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-white dark:border-gray-800"
              style={{ zIndex: 3 - index }}
            />
          ))}
          {order.order_items.length > 3 && (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium dark:text-gray-300">
              +{order.order_items.length - 3}
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm dark:text-gray-300">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold dark:text-white">${order.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
        View Details
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

/**
 * Order list with loading state
 */
interface OrderListProps {
  orders: Order[];
  isLoading?: boolean;
  className?: string;
}

export function OrderList({ orders, isLoading, className = "" }: OrderListProps) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No orders found
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

