import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderStatusDisplay } from "@/lib/checkout/process-order";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Mock order data - replace with real data from your database
const mockOrders: Record<string, {
  id: string;
  status: string;
  total: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  shipping_address: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  order_items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}> = {
  "ORD-123456": {
    id: "ORD-123456",
    status: "processing",
    total: 299.99,
    customer_name: "John Doe",
    customer_email: "john@example.com",
    created_at: new Date().toISOString(),
    shipping_address: {
      address: "123 Main St",
      city: "New York",
      postalCode: "10001",
      country: "USA",
    },
    order_items: [
      {
        id: "1",
        product_id: "prod-1",
        product_name: "Premium Headphones",
        quantity: 1,
        unit_price: 299.99,
        total_price: 299.99,
      },
    ],
  },
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = mockOrders[id];

  if (!order) {
    notFound();
  }

  const statusDisplay = getOrderStatusDisplay(order.status);

  const statusColors = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/orders"
        className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
      >
        ← Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Order {order.id}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[statusDisplay.color]}`}>
          {statusDisplay.label}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4 dark:text-white">Items</h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.order_items.map((item) => (
                <li key={item.id} className="py-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium dark:text-white">
                      ${item.total_price.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4 dark:text-white">Order Timeline</h2>
            <div className="space-y-4">
              <TimelineItem
                title="Order Placed"
                date={new Date(order.created_at).toLocaleString()}
                completed
              />
              <TimelineItem
                title="Payment Confirmed"
                date={order.status !== "pending" ? "Completed" : "Pending"}
                completed={order.status !== "pending"}
              />
              <TimelineItem
                title="Shipped"
                date={order.shipped_at ? new Date(order.shipped_at).toLocaleString() : "Pending"}
                completed={!!order.shipped_at}
              />
              <TimelineItem
                title="Delivered"
                date={order.delivered_at ? new Date(order.delivered_at).toLocaleString() : "Pending"}
                completed={!!order.delivered_at}
                isLast
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4 dark:text-white">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Subtotal</dt>
                <dd className="dark:text-white">${(order.total * 0.9).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
                <dd className="dark:text-white">${(order.total * 0.1).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <dt className="font-semibold dark:text-white">Total</dt>
                <dd className="font-semibold dark:text-white">${order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4 dark:text-white">Shipping Address</h2>
            <address className="not-italic text-sm text-gray-600 dark:text-gray-400">
              {order.customer_name}<br />
              {order.shipping_address.address}<br />
              {order.shipping_address.city}, {order.shipping_address.postalCode}<br />
              {order.shipping_address.country}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  title,
  date,
  completed,
  isLast = false,
}: {
  title: string;
  date: string;
  completed: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${
            completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        />
        {!isLast && (
          <div
            className={`w-0.5 flex-1 mt-1 ${
              completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        )}
      </div>
      <div className="pb-4">
        <p className={`font-medium ${completed ? "dark:text-white" : "text-gray-400"}`}>
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: "View order details and tracking information",
  };
}

export function generateStaticParams() {
  return Object.keys(mockOrders).map((id) => ({ id }));
}
