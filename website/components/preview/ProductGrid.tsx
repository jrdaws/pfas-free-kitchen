"use client";

import { cn } from "@/lib/utils";

interface Product {
  name: string;
  price: number;
  category?: string;
  image?: string;
}

interface ProductGridProps {
  products: Product[];
  columns?: number;
  showPrices?: boolean;
  showAddToCart?: boolean;
  title?: string;
}

export function ProductGrid({
  products = [],
  columns = 4,
  showPrices = true,
  showAddToCart = true,
  title,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-6 py-16 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-white mb-10 text-center">
            {title}
          </h2>
        )}
        <div
          className={cn(
            "grid gap-6",
            columns === 2 && "grid-cols-1 md:grid-cols-2",
            columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {products.map((product, i) => (
            <div
              key={i}
              className="group bg-[#111111] rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/50 transition-all"
            >
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-400/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                {product.category && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-orange-500/80 text-white text-xs rounded-md">
                    {product.category}
                  </span>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-white font-medium mb-2 group-hover:text-orange-400 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  {showPrices && (
                    <span className="text-emerald-400 font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  {showAddToCart && (
                    <button className="px-3 py-1.5 bg-stone-50/5 hover:bg-orange-500 text-gray-400 hover:text-white rounded-lg text-sm transition-all">
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

