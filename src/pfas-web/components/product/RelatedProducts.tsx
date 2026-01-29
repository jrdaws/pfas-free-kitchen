'use client';

import { useRef, useState, useCallback } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';
import styles from './RelatedProducts.module.css';

interface RelatedProductsProps {
  title: string;
  products: Product[];
}

export function RelatedProducts({ title, products }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 300;
    const newScrollLeft = scrollRef.current.scrollLeft + 
      (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  }, []);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.controls}>
          <button
            className={`${styles.scrollButton} ${!canScrollLeft ? styles.disabled : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            className={`${styles.scrollButton} ${!canScrollRight ? styles.disabled : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className={styles.carousel}
        onScroll={checkScrollButtons}
      >
        {products.map((product) => (
          <div key={product.id} className={styles.cardWrapper}>
            <ProductCard product={product} variant="compact" />
          </div>
        ))}
      </div>
    </section>
  );
}
