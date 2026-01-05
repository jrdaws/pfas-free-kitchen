"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { getMyPurchases } from "@/lib/marketplace/transactions";
import { TransactionCard } from "@/components/marketplace/TransactionCard";
import type { Transaction, PaymentStatus } from "@/lib/marketplace/transactions";

type Tab = "all" | "awaiting" | "shipped" | "delivered";

export default function MyPurchasesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getMyPurchases();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load purchases:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "awaiting") return t.shippingStatus === "pending";
    if (activeTab === "shipped") return t.shippingStatus === "shipped" || t.shippingStatus === "in_transit";
    if (activeTab === "delivered") return t.shippingStatus === "delivered";
    return true;
  });

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All Orders", count: transactions.length },
    {
      id: "awaiting",
      label: "Awaiting Shipment",
      count: transactions.filter((t) => t.shippingStatus === "pending").length,
    },
    {
      id: "shipped",
      label: "In Transit",
      count: transactions.filter(
        (t) => t.shippingStatus === "shipped" || t.shippingStatus === "in_transit"
      ).length,
    },
    {
      id: "delivered",
      label: "Delivered",
      count: transactions.filter((t) => t.shippingStatus === "delivered").length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Purchases</h1>
            <p className="text-slate-400 text-sm">Track your orders and purchases</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                role="buyer"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">
              {activeTab === "all"
                ? "No purchases yet"
                : `No ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} orders`}
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors mt-4"
            >
              Browse Listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

