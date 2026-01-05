/**
 * Payments + Email Bridge
 * 
 * Connects your payment system with your email provider to:
 * - Send order confirmation emails
 * - Send payment receipts
 * - Send subscription status emails
 * - Send invoice emails
 */

import { sendEmail } from "@/lib/email";
import Stripe from "stripe";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderDetails {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Send order confirmation email after successful payment.
 */
export async function sendOrderConfirmationEmail(order: OrderDetails) {
  const currencySymbol = order.currency === "eur" ? "€" : "$";
  
  return sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed - #${order.orderId}`,
    template: "order-confirmation",
    data: {
      orderId: order.orderId,
      customerName: order.customerName?.split(" ")[0] || "there",
      items: order.items.map(item => ({
        ...item,
        formattedPrice: `${currencySymbol}${(item.price / 100).toFixed(2)}`,
      })),
      subtotal: `${currencySymbol}${(order.subtotal / 100).toFixed(2)}`,
      tax: `${currencySymbol}${(order.tax / 100).toFixed(2)}`,
      shipping: order.shipping > 0 
        ? `${currencySymbol}${(order.shipping / 100).toFixed(2)}` 
        : "Free",
      total: `${currencySymbol}${(order.total / 100).toFixed(2)}`,
      shippingAddress: order.shippingAddress,
      orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderId}`,
    },
  });
}

/**
 * Send payment receipt email.
 */
export async function sendPaymentReceiptEmail(
  email: string,
  payment: {
    id: string;
    amount: number;
    currency: string;
    description?: string;
    receiptUrl?: string;
  }
) {
  const currencySymbol = payment.currency === "eur" ? "€" : "$";
  
  return sendEmail({
    to: email,
    subject: "Payment Receipt",
    template: "payment-receipt",
    data: {
      paymentId: payment.id,
      amount: `${currencySymbol}${(payment.amount / 100).toFixed(2)}`,
      description: payment.description || "Payment",
      receiptUrl: payment.receiptUrl,
      date: new Date().toLocaleDateString(),
    },
  });
}

/**
 * Send subscription confirmation email.
 */
export async function sendSubscriptionEmail(
  email: string,
  subscription: {
    planName: string;
    amount: number;
    currency: string;
    interval: "month" | "year";
    trialEnd?: Date;
  }
) {
  const currencySymbol = subscription.currency === "eur" ? "€" : "$";
  const intervalLabel = subscription.interval === "year" ? "year" : "month";
  
  return sendEmail({
    to: email,
    subject: `Welcome to ${subscription.planName}!`,
    template: "subscription-welcome",
    data: {
      planName: subscription.planName,
      amount: `${currencySymbol}${(subscription.amount / 100).toFixed(2)}/${intervalLabel}`,
      trialEnd: subscription.trialEnd?.toLocaleDateString(),
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    },
  });
}

/**
 * Send subscription cancellation email.
 */
export async function sendCancellationEmail(
  email: string,
  details: {
    planName: string;
    endDate: Date;
    reason?: string;
  }
) {
  return sendEmail({
    to: email,
    subject: "Your subscription has been cancelled",
    template: "subscription-cancelled",
    data: {
      planName: details.planName,
      endDate: details.endDate.toLocaleDateString(),
      reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    },
  });
}

/**
 * Handle Stripe webhook events and send appropriate emails.
 * 
 * Usage in your webhook handler:
 * ```
 * import { handleStripeWebhookEmail } from "@/lib/order-confirmation";
 * 
 * // In your webhook handler:
 * await handleStripeWebhookEmail(event);
 * ```
 */
export async function handleStripeWebhookEmail(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer_email && session.mode === "payment") {
        await sendPaymentReceiptEmail(session.customer_email, {
          id: session.id,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          description: "Purchase",
        });
      }
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      // Get customer email and send subscription welcome
      // You'll need to fetch customer details from Stripe
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Send cancellation email
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer_email) {
        await sendPaymentReceiptEmail(invoice.customer_email, {
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          receiptUrl: invoice.hosted_invoice_url || undefined,
        });
      }
      break;
    }
  }
}

