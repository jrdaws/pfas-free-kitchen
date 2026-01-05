"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Package, DollarSign, Truck, X } from "lucide-react";
import { getMySales, updateShipping } from "@/lib/marketplace/transactions";
import { TransactionCard } from "@/components/marketplace/TransactionCard";
import type { Transaction } from "@/lib/marketplace/transactions";

type Tab = "all" | "to_ship" | "shipped" | "completed";

export default function MySalesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [shippingModal, setShippingModal] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getMySales();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load sales:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddTracking = async () => {
    if (!shippingModal || !trackingNumber.trim()) return;

    setSavingTracking(true);
    try {
      const updated = await updateShipping(shippingModal, {
        trackingNumber: trackingNumber.trim(),
        carrier: carrier.trim() || undefined,
        shippingStatus: "shipped",
      });

      setTransactions((prev) =>
        prev.map((t) => (t.id === shippingModal ? updated : t))
      );
      setShippingModal(null);
      setTrackingNumber("");
      setCarrier("");
    } catch (error) {
      console.error("Failed to update shipping:", error);
    } finally {
      setSavingTracking(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "to_ship") return t.paymentStatus === "paid" && t.shippingStatus === "pending";
    if (activeTab === "shipped") return t.shippingStatus === "shipped" || t.shippingStatus === "in_transit";
    if (activeTab === "completed") return t.shippingStatus === "delivered";
    return true;
  });

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All Sales", count: transactions.length },
    {
      id: "to_ship",
      label: "To Ship",
      count: transactions.filter(
        (t) => t.paymentStatus === "paid" && t.shippingStatus === "pending"
      ).length,
    },
    {
      id: "shipped",
      label: "Shipped",
      count: transactions.filter(
        (t) => t.shippingStatus === "shipped" || t.shippingStatus === "in_transit"
      ).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: transactions.filter((t) => t.shippingStatus === "delivered").length,
    },
  ];

  // Calculate stats
  const totalRevenue = transactions
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + t.salePrice, 0);
  const toShipCount = tabs.find((t) => t.id === "to_ship")?.count || 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Sales</h1>
            <p className="text-slate-400 text-sm">Manage your sold items and shipments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <p className="text-sm text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <p className="text-sm text-slate-400">Needs Shipping</p>
            <p className="text-2xl font-bold text-white">{toShipCount}</p>
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
                role="seller"
                onShip={() => setShippingModal(transaction.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">
              {activeTab === "all"
                ? "No sales yet"
                : `No ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}`}
            </p>
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors mt-4"
            >
              Create a Listing
            </Link>
          </div>
        )}
      </div>

      {/* Shipping Modal */}
      {shippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Tracking</h3>
              <button
                onClick={() => setShippingModal(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select carrier</option>
                  <option value="USPS">USPS</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="DHL">DHL</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShippingModal(null)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTracking}
                  disabled={!trackingNumber.trim() || savingTracking}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
                >
                  {savingTracking ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Truck className="w-4 h-4 inline mr-2" />
                      Mark as Shipped
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

