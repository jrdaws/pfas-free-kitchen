"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;

/**
 * Initialize Paddle.js on the client
 * Call this early in your app (e.g., in a useEffect in your root layout)
 */
export async function initPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance;
  
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!clientToken) {
    console.warn("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not set");
    return null;
  }

  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" 
    ? "sandbox" as const
    : "production" as const;

  paddleInstance = await initializePaddle({
    environment,
    token: clientToken,
  });

  return paddleInstance;
}

/**
 * Get the Paddle instance (must call initPaddle first)
 */
export function getPaddleInstance(): Paddle | null {
  return paddleInstance;
}

/**
 * Open Paddle checkout
 */
export async function openCheckout(priceId: string, options?: {
  customerId?: string;
  email?: string;
  successUrl?: string;
}) {
  const paddle = await initPaddle();
  if (!paddle) {
    throw new Error("Paddle not initialized");
  }

  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: options?.customerId ? { id: options.customerId } : undefined,
    customData: { email: options?.email },
    settings: {
      successUrl: options?.successUrl || window.location.origin + "/success",
    },
  });
}

