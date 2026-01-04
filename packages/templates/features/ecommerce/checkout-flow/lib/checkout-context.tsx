"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type CheckoutStep = "cart" | "shipping" | "payment" | "review" | "complete";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
}

export interface CheckoutState {
  step: CheckoutStep;
  shipping: ShippingAddress | null;
  shippingMethod: ShippingMethod | null;
  paymentIntentId: string | null;
  error: string | null;
  loading: boolean;
}

interface CheckoutContextValue extends CheckoutState {
  setStep: (step: CheckoutStep) => void;
  setShipping: (address: ShippingAddress) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentIntent: (id: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: CheckoutState = {
  step: "cart",
  shipping: null,
  shippingMethod: null,
  paymentIntentId: null,
  error: null,
  loading: false,
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);

  const setStep = useCallback((step: CheckoutStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setShipping = useCallback((address: ShippingAddress) => {
    setState((prev) => ({ ...prev, shipping: address }));
  }, []);

  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setState((prev) => ({ ...prev, shippingMethod: method }));
  }, []);

  const setPaymentIntent = useCallback((id: string) => {
    setState((prev) => ({ ...prev, paymentIntentId: id }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        ...state,
        setStep,
        setShipping,
        setShippingMethod,
        setPaymentIntent,
        setError,
        setLoading,
        reset,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckoutContext must be used within a CheckoutProvider");
  }
  return context;
}

