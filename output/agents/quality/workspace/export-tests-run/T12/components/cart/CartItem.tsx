"use client";

import Image from "next/image";
import { useCartStore, CartItem as CartItemType, formatPrice } from "@/lib/cart/cart-store";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4">
      {/* Image */}
      <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            📦
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium dark:text-white truncate">{item.name}</h3>
        {item.variant && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant}</p>
        )}
        <p className="font-medium text-blue-600 dark:text-blue-400">
          {formatPrice(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            -
          </button>
          <span className="w-8 text-center dark:text-white">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            +
          </button>
          <button
            onClick={() => removeItem(item.id)}
            className="ml-auto text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Add to Cart Button component
 */
interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image?: string;
  variant?: string;
  className?: string;
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  variant,
  className = "",
}: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  const handleClick = () => {
    addItem({
      productId,
      name,
      price,
      quantity: 1,
      image,
      variant,
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${className}`}
    >
      Add to Cart
    </button>
  );
}

/**
 * Cart Icon with badge for header
 */
export function CartIcon() {
  const { totalItems, toggleCart } = useCartStore();
  const count = totalItems();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

