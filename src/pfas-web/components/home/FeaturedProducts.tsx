'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';
import styles from './FeaturedProducts.module.css';

interface FeaturedProductsProps {
  products?: Product[];
}

export function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Highest Verified Products</h2>
          <p className={styles.subtitle}>
            Products with Tier 4 (Monitored) or Tier 3 (Lab Tested) verification
          </p>
        </div>
        <Link href="/cookware?tier=3,4" className={styles.viewAll}>
          View All
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      <div className={styles.carouselWrapper}>
        {/* Scroll buttons */}
        <button 
          className={`${styles.scrollButton} ${styles.scrollLeft}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className={styles.carousel} ref={scrollRef}>
          {products.map((product) => (
            <div key={product.id} className={styles.cardWrapper}>
              <ProductCard product={product} variant="compact" />
            </div>
          ))}
        </div>

        <button 
          className={`${styles.scrollButton} ${styles.scrollRight}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default FeaturedProducts;
