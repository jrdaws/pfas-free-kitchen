import Link from "next/link";
import { getOrderStatusDisplay } from "@/lib/checkout/process-order";

// Mock orders data - replace with real data from your database
const mockOrders = [
  {
    id: "ORD-789012",
    status: "delivered",
    total: 499.99,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    items_count: 3,
  },
  {
    id: "ORD-456789",
    status: "shipped",
    total: 199.99,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    items_count: 1,
  },
  {
    id: "ORD-123456",
    status: "processing",
    total: 299.99,
    created_at: new Date().toISOString(),
    items_count: 2,
  },
];

export default function OrdersPage() {
  const orders = mockOrders;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            No orders yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            When you make a purchase, your orders will appear here.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusDisplay = getOrderStatusDisplay(order.status);
            const statusColors = {
              gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
              yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
              blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
              green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
            };

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold dark:text-white">{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[statusDisplay.color]}`}>
                    {statusDisplay.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold dark:text-white">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "T08-EcommerceFullStack",
    description: "View your order history and track shipments",
  };
}
