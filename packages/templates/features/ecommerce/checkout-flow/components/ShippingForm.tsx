"use client";

import { useState } from "react";
import { useCheckoutContext, ShippingAddress } from "@/lib/checkout/checkout-context";
import { shippingSchema, SHIPPING_METHODS, formatCurrency } from "@/lib/checkout/checkout-utils";

interface ShippingFormProps {
  onComplete: () => void;
}

export function ShippingForm({ onComplete }: ShippingFormProps) {
  const { setShipping, setShippingMethod, shippingMethod, loading, setLoading, setError } = useCheckoutContext();
  const [formData, setFormData] = useState<Partial<ShippingAddress>>({
    country: "US",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validatedData = shippingSchema.parse(formData);
      setShipping(validatedData);
      onComplete();
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = (field: string) =>
    `w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
        
        {/* Name */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              className={inputClassName("firstName")}
            />
            {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              className={inputClassName("lastName")}
            />
            {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className={inputClassName("email")}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone (optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className={inputClassName("phone")}
            />
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="address1"
            value={formData.address1 || ""}
            onChange={handleChange}
            placeholder="Street address"
            className={inputClassName("address1")}
          />
          {errors.address1 && <p className="text-sm text-destructive mt-1">{errors.address1}</p>}
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="address2"
            value={formData.address2 || ""}
            onChange={handleChange}
            placeholder="Apartment, suite, etc. (optional)"
            className={inputClassName("address2")}
          />
        </div>

        {/* City, State, Zip */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              className={inputClassName("city")}
            />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state || ""}
              onChange={handleChange}
              className={inputClassName("state")}
            />
            {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode || ""}
              onChange={handleChange}
              className={inputClassName("postalCode")}
            />
            {errors.postalCode && <p className="text-sm text-destructive mt-1">{errors.postalCode}</p>}
          </div>
        </div>

        {/* Country */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Country</label>
          <select
            name="country"
            value={formData.country || "US"}
            onChange={handleChange}
            className={inputClassName("country")}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>

      {/* Shipping Method */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Shipping Method</h3>
        <div className="space-y-3">
          {SHIPPING_METHODS.map((method) => (
            <label
              key={method.id}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                shippingMethod?.id === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={shippingMethod?.id === method.id}
                  onChange={() => setShippingMethod(method)}
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
              <span className="font-medium">{formatCurrency(method.price)}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !shippingMethod}
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Continue to Payment"}
      </button>
    </form>
  );
}

