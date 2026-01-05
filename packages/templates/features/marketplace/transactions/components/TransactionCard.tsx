"use client";

import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Transaction, PaymentStatus, ShippingStatus } from "../lib/transactions";
import {
  PAYMENT_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  SHIPPING_STATUS_COLORS,
} from "../lib/transactions";

interface TransactionCardProps {
  transaction: Transaction;
  role: "buyer" | "seller";
  onShip?: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TransactionCard({ transaction, role, onShip }: TransactionCardProps) {
  const otherParty = role === "buyer" ? transaction.seller : transaction.buyer;
  const showShipAction = 
    role === "seller" && 
    transaction.paymentStatus === "paid" && 
    transaction.shippingStatus === "pending";

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
          {transaction.listing?.images?.[0] ? (
            <img
              src={transaction.listing.images[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-8 h-8 text-slate-500 m-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-white font-medium line-clamp-1">
                {transaction.listing?.title || "Item"}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                {role === "buyer" ? "From" : "To"}: {otherParty?.displayName || "Unknown"}
              </p>
            </div>
            <p className="text-white font-semibold whitespace-nowrap">
              {formatPrice(transaction.totalAmount)}
            </p>
          </div>

          {/* Statuses */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white ${
                PAYMENT_STATUS_COLORS[transaction.paymentStatus]
              }`}
            >
              {transaction.paymentStatus === "paid" ? (
                <CheckCircle className="w-3 h-3" />
              ) : transaction.paymentStatus === "pending" ? (
                <Clock className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {PAYMENT_STATUS_LABELS[transaction.paymentStatus]}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white ${
                SHIPPING_STATUS_COLORS[transaction.shippingStatus]
              }`}
            >
              <Truck className="w-3 h-3" />
              {SHIPPING_STATUS_LABELS[transaction.shippingStatus]}
            </span>
          </div>

          {/* Tracking */}
          {transaction.trackingNumber && (
            <p className="mt-2 text-xs text-slate-400">
              Tracking: {transaction.carrier && `${transaction.carrier} `}
              <span className="text-slate-300">{transaction.trackingNumber}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">
              {formatDate(transaction.createdAt)}
            </span>

            <div className="flex-1" />

            {showShipAction && onShip && (
              <button
                onClick={onShip}
                className="px-3 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Add Tracking
              </button>
            )}

            {role === "buyer" && transaction.shippingStatus === "delivered" && (
              <Link
                href={`/listings/${transaction.listingId}?review=true`}
                className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Leave Review
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionCard;

