"use client";

import { Package, CreditCard, Truck, Home, CheckCircle } from "lucide-react";
import type { PaymentStatus, ShippingStatus } from "../lib/transactions";

interface TransactionStatusProps {
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  role: "buyer" | "seller";
}

const STEPS = [
  { id: "ordered", label: "Ordered", icon: Package },
  { id: "paid", label: "Paid", icon: CreditCard },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
];

export function TransactionStatus({
  paymentStatus,
  shippingStatus,
  role,
}: TransactionStatusProps) {
  // Determine current step
  let currentStep = 0;
  if (paymentStatus === "paid") currentStep = 1;
  if (shippingStatus === "shipped" || shippingStatus === "in_transit") currentStep = 2;
  if (shippingStatus === "delivered") currentStep = 3;

  return (
    <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
      <h4 className="text-sm font-medium text-slate-300 mb-4">Order Status</h4>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-700">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isComplete = index <= currentStep;
            const isCurrent = index === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  } ${isCurrent ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900" : ""}`}
                >
                  {isComplete && index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs ${
                    isComplete ? "text-white" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      <div className="mt-6 text-center">
        {shippingStatus === "delivered" ? (
          <p className="text-emerald-400 text-sm">
            ✓ This order has been completed
          </p>
        ) : shippingStatus === "in_transit" ? (
          <p className="text-blue-400 text-sm">
            Your package is on its way!
          </p>
        ) : shippingStatus === "shipped" ? (
          <p className="text-blue-400 text-sm">
            {role === "buyer"
              ? "Your order has been shipped"
              : "Package is with the carrier"}
          </p>
        ) : paymentStatus === "paid" ? (
          <p className="text-slate-400 text-sm">
            {role === "seller"
              ? "Please ship this item soon"
              : "Waiting for seller to ship"}
          </p>
        ) : (
          <p className="text-yellow-400 text-sm">Awaiting payment</p>
        )}
      </div>
    </div>
  );
}

export default TransactionStatus;

