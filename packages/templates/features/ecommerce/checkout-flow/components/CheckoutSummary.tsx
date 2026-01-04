"use client";

import { useCheckoutContext } from "@/lib/checkout/checkout-context";
import { formatCurrency } from "@/lib/checkout/checkout-utils";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutSummaryProps {
  items?: CartItem[];
}

// Demo items - replace with your cart context
const demoItems: CartItem[] = [
  { id: "1", name: "Premium T-Shirt", price: 29.99, quantity: 2 },
  { id: "2", name: "Casual Jeans", price: 79.99, quantity: 1 },
];

export function CheckoutSummary({ items = demoItems }: CheckoutSummaryProps) {
  const { shippingMethod } = useCheckoutContext();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingMethod?.price || 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      {/* Items */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <span className="text-foreground">{item.name}</span>
              <span className="text-muted-foreground"> × {item.quantity}</span>
            </div>
            <span className="font-medium">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-border pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {shipping > 0 ? formatCurrency(shipping) : "Calculated at next step"}
          </span>
        </div>
        
        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (8%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        {/* Total */}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      {/* Promo Code */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Promo code"
            className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="px-4 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

