'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';
import styles from './FeaturedProducts.module.css';

// Mock data for featured products - replace with API call
// Using type assertion as mock data doesn't have all required Product fields
const FEATURED_PRODUCTS = [
  {
    id: '1',
    slug: 'all-clad-d3-stainless-steel-fry-pan',
    name: '12" Stainless Steel Fry Pan',
    brand: { id: '1', name: 'All-Clad', slug: 'all-clad' },
    imageUrl: '/images/products/allclad-frypan.jpg',
    materialSummary: '18/10 Stainless Steel',
    coatingSummary: 'None',
    verification: {
      tier: 4,
      hasEvidence: true,
      evidenceCount: 3,
      unknowns: [],
    },
    retailers: [],
  },
  {
    id: '2',
    slug: 'lodge-cast-iron-skillet',
    name: '10.25" Pre-Seasoned Skillet',
    brand: { id: '2', name: 'Lodge', slug: 'lodge' },
    imageUrl: '/images/products/lodge-skillet.jpg',
    materialSummary: 'Cast Iron',
    coatingSummary: 'Vegetable oil seasoning',
    verification: {
      tier: 4,
      hasEvidence: true,
      evidenceCount: 2,
      unknowns: [],
    },
    retailers: [],
  },
  {
    id: '3',
    slug: 'caraway-ceramic-cookware-set',
    name: 'Non-Toxic Ceramic Cookware Set',
    brand: { id: '3', name: 'Caraway', slug: 'caraway' },
    imageUrl: '/images/products/caraway-set.jpg',
    materialSummary: 'Aluminum',
    coatingSummary: 'Ceramic',
    verification: {
      tier: 3,
      hasEvidence: true,
      evidenceCount: 4,
      unknowns: [],
    },
    retailers: [],
  },
  {
    id: '4',
    slug: 'pyrex-glass-storage-containers',
    name: 'Simply Store 10-Piece Glass Set',
    brand: { id: '4', name: 'Pyrex', slug: 'pyrex' },
    imageUrl: '/images/products/pyrex-storage.jpg',
    materialSummary: 'Borosilicate Glass',
    coatingSummary: 'None',
    verification: {
      tier: 4,
      hasEvidence: true,
      evidenceCount: 2,
      unknowns: [],
    },
    retailers: [],
  },
  {
    id: '5',
    slug: 'de-buyer-carbon-steel-pan',
    name: 'Mineral B Pro 11" Fry Pan',
    brand: { id: '5', name: 'de Buyer', slug: 'de-buyer' },
    imageUrl: '/images/products/debuyer-pan.jpg',
    materialSummary: 'Carbon Steel',
    coatingSummary: 'Beeswax seasoning',
    verification: {
      tier: 3,
      hasEvidence: true,
      evidenceCount: 2,
      unknowns: [],
    },
    retailers: [],
  },
] as unknown as Product[];

export function FeaturedProducts() {
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
          {FEATURED_PRODUCTS.map((product) => (
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
