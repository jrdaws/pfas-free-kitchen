import Link from "next/link";
import { Suspense } from "react";

interface SuccessPageProps {
  searchParams: { order?: string };
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderId = searchParams.order;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-2 dark:text-white">
            Order Confirmed!
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your purchase. We&apos;ll send you an email with order
            details and tracking information.
          </p>

          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order Number
              </p>
              <p className="font-mono font-semibold dark:text-white">
                {orderId}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/orders"
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              View Order Details
            </Link>
            <Link
              href="/"
              className="block w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Questions about your order?{" "}
          <Link href="/contact" className="text-blue-600 hover:text-blue-700">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "Order Confirmed",
    description: "Your order has been successfully placed.",
  };
}

