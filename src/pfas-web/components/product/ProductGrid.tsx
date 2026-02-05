'use client';

import type { Product, SearchFacets } from '@/lib/types';
import { useCompare } from '@/contexts/CompareContext';
import { ProductCard } from './ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  showCompare?: boolean;
  facets?: SearchFacets; // Optional facets for future filter UI
}

export function ProductGrid({ products, showCompare = true, facets: _facets }: ProductGridProps) {
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
