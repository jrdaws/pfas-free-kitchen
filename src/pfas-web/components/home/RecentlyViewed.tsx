'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './RecentlyViewed.module.css';

interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl: string;
  tier: number;
  viewedAt: number;
}

const STORAGE_KEY = 'pfas-recently-viewed';
const MAX_ITEMS = 8;

// Utility to manage recently viewed products
export function addToRecentlyViewed(product: Omit<RecentProduct, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: RecentProduct[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    items = items.filter(item => item.id !== product.id);
    
    // Add to beginning
    items.unshift({ ...product, viewedAt: Date.now() });
    
    // Limit to MAX_ITEMS
    items = items.slice(0, MAX_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save recently viewed:', e);
  }
}

export function RecentlyViewed() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: RecentProduct[] = JSON.parse(stored);
        if (items.length > 0) {
          setProducts(items);
          setIsVisible(true);
        }
      }
    } catch (e) {
      console.error('Failed to load recently viewed:', e);
    }
  }, []);

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts([]);
    setIsVisible(false);
  };

  if (!isVisible || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recently Viewed</h2>
          <button 
            onClick={clearAll} 
            className={styles.clearButton}
            aria-label="Clear recently viewed products"
          >
            Clear All
          </button>
        </div>

        <div className={styles.carousel}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={product.imageUrl || '/placeholder-product.svg'}
                  alt={product.name}
                  fill
                  sizes="140px"
                  className={styles.image}
                />
                <TierIndicator tier={product.tier} />
              </div>
              <div className={styles.content}>
                <span className={styles.brand}>{product.brandName}</span>
                <span className={styles.name}>{product.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TierIndicator({ tier }: { tier: number }) {
  const tierColors: Record<number, string> = {
    4: 'var(--color-tier-4)',
    3: 'var(--color-tier-3)',
    2: 'var(--color-tier-2)',
    1: 'var(--color-tier-1)',
    0: 'var(--color-tier-0)',
  };
  
  return (
    <div 
      className={styles.tierIndicator}
      style={{ '--tier-color': tierColors[tier] || tierColors[0] } as React.CSSProperties}
      title={`Tier ${tier}`}
    >
      {tier}
    </div>
  );
}

export default RecentlyViewed;
