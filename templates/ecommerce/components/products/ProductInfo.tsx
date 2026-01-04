"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Truck, Shield, RotateCcw, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart/cart-store";

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  category: string;
  images?: string[];
  variants?: { name: string; options: string[] }[];
  inStock: boolean;
}

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  const getVariantString = () => {
    const variants = Object.entries(selectedVariants);
    return variants.length > 0 
      ? variants.map(([, value]) => value).join(" / ")
      : undefined;
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price / 100, // Convert cents to dollars for display
      quantity,
      image: product.images?.[0],
      variant: getVariantString(),
    });
    
    // Show feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category */}
      <p className="text-sm text-muted-foreground uppercase tracking-wide">
        {product.category}
      </p>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="bg-destructive text-destructive-foreground text-sm font-semibold px-2 py-1 rounded">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {product.inStock ? (
          <>
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-green-600 dark:text-green-400">In Stock</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-sm text-red-600 dark:text-red-400">Out of Stock</span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      {/* Variants */}
      {product.variants?.map((variant) => (
        <div key={variant.name}>
          <label className="block text-sm font-medium text-foreground mb-2">
            {variant.name}: <span className="text-muted-foreground">{selectedVariants[variant.name] || "Select"}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedVariants({ ...selectedVariants, [variant.name]: option })}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedVariants[variant.name] === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdded 
              ? "bg-green-600 text-white" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
        <button className="w-12 h-12 flex items-center justify-center border border-border rounded-lg hover:bg-muted hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="flex flex-col items-center text-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">Free Shipping</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">2 Year Warranty</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <RotateCcw className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">30-Day Returns</span>
        </div>
      </div>
    </div>
  );
}
