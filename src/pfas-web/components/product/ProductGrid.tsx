'use client';

import type { Product } from '@/lib/types';
import { useCompare } from '@/contexts/CompareContext';
import { ProductCard } from './ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  showCompare?: boolean;
}

export function ProductGrid({ products, showCompare = true }: ProductGridProps) {
  const { items, toggleItem, isInCompare, canAdd } = useCompare();

  if (products.length === 0) {
    return null;
  }

  const handleCompareToggle = (productId: string) => {
    // Only allow adding if we have room (or if the item is already in compare)
    if (canAdd || isInCompare(productId)) {
      toggleItem(productId);
    }
  };

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onCompareToggle={showCompare ? handleCompareToggle : undefined}
          isComparing={isInCompare(product.id)}
        />
      ))}
    </div>
  );
}
