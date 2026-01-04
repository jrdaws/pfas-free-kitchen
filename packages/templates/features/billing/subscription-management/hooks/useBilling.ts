"use client";

import { useState, useCallback } from "react";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface UseBillingReturn {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: Error | null;
  addPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBilling(): UseBillingReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/billing/payment-methods");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load payment methods"));
    } finally {
      setLoading(false);
    }
  }, []);

  const addPaymentMethod = async (paymentMethodId: string) => {
    const res = await fetch("/api/billing/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId }),
    });

    if (!res.ok) {
      throw new Error("Failed to add payment method");
    }

    await fetchPaymentMethods();
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    const res = await fetch(`/api/billing/payment-methods/${paymentMethodId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to remove payment method");
    }

    await fetchPaymentMethods();
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    const res = await fetch(`/api/billing/payment-methods/${paymentMethodId}/default`, {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Failed to set default payment method");
    }

    await fetchPaymentMethods();
  };

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    refresh: fetchPaymentMethods,
  };
}

