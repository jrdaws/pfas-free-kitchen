import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getOrderStatusDisplay } from "@/lib/checkout/process-order";
import { OrderCard } from "@/components/orders/OrderCard";
import { redirect } from "next/navigation";

async function getOrders(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        product_id,
        quantity,
        unit_price,
        products (name, image_url)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }

  return data || [];
}

async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const orders = await getOrders(user.id);

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
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "Your Orders",
    description: "View your order history and track shipments",
  };
}

