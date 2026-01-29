'use client';

import { useEffect, useState } from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { fetchProduct } from '@/lib/data';
import type { Product } from '@/lib/types';
import { AffiliateDisclosure } from '@/components/layout';
import { CompareTable, CompareCard, EmptyCompare } from '@/components/compare';
import { Button } from '@/components/ui';
import styles from './compare.module.css';

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch product data when items change
  useEffect(() => {
    async function loadProducts() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const productPromises = items.map(id => fetchProduct(id));
        const results = await Promise.all(productPromises);
        // Filter out nulls (products that weren't found)
        const validProducts = results.filter((p): p is Product => p !== null);
        setProducts(validProducts);
      } catch (error) {
        console.error('Failed to load comparison products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [items]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle share
  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('ids', items.join(','));
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PFAS-Free Product Comparison',
          text: `Compare ${products.length} PFAS-free products`,
          url: url.toString(),
        });
      } catch {
        // User cancelled or share failed - fallback to clipboard
        await navigator.clipboard.writeText(url.toString());
      }
    } else {
      await navigator.clipboard.writeText(url.toString());
    }
  };

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className={styles.page}>
        <EmptyCompare />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Compare Products</h1>
            <p className={styles.subtitle}>
              {loading 
                ? 'Loading...' 
                : `Comparing ${products.length} product${products.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost" size="sm" onClick={handlePrint} className={styles.actionButton}>
              <PrintIcon />
              Print
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className={styles.actionButton}>
              <ShareIcon />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className={styles.clearButton}>
              Clear All
            </Button>
          </div>
        </div>
      </header>

      {/* Affiliate Disclosure */}
      <div className={styles.disclosureWrapper}>
        <AffiliateDisclosure variant="banner" />
      </div>

      {/* Loading state */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading product data...</p>
        </div>
      )}

      {/* Comparison content */}
      {!loading && products.length > 0 && (
        <div className={styles.content}>
          {isMobile ? (
            <CompareCard products={products} onRemove={removeItem} />
          ) : (
            <CompareTable products={products} onRemove={removeItem} />
          )}
        </div>
      )}

      {/* Warning if some products failed to load */}
      {!loading && items.length > products.length && (
        <div className={styles.warning}>
          <WarningIcon />
          <span>
            {items.length - products.length} product
            {items.length - products.length !== 1 ? 's' : ''} could not be loaded.
          </span>
        </div>
      )}
    </div>
  );
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
