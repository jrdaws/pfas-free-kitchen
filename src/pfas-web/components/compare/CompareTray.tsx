'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui';
import styles from './CompareTray.module.css';

interface CompareProduct {
  id: string;
  name: string;
  imageUrl: string;
  brandName?: string;
}

interface CompareTrayProps {
  products?: CompareProduct[];
}

export function CompareTray({ products = [] }: CompareTrayProps) {
  const { items, removeItem, clearAll, maxItems } = useCompare();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  // Track scroll direction
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolledDown(currentScrollY > lastScrollY && currentScrollY > 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  // Get product data for items in compare
  const compareProducts = items.map(id => {
    const product = products.find(p => p.id === id);
    return product || { id, name: 'Loading...', imageUrl: '/placeholder-product.svg' };
  });

  // Collapse on scroll down (show compact view)
  const isCollapsed = isScrolledDown && !isExpanded;

  return (
    <div 
      className={`${styles.tray} ${isCollapsed ? styles.collapsed : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      aria-label="Product comparison tray"
    >
      {/* Collapsed view - just badge */}
      {isCollapsed && (
        <button 
          className={styles.collapsedBadge}
          onClick={() => setIsExpanded(true)}
          aria-expanded={false}
        >
          <ScaleIcon />
          <span className={styles.collapsedCount}>{items.length}</span>
          <span className="sr-only">Expand comparison tray</span>
        </button>
      )}

      {/* Expanded view */}
      {!isCollapsed && (
        <>
          <div className={styles.header}>
            <h3 className={styles.title}>
              <ScaleIcon />
              Compare Products ({items.length} of {maxItems})
            </h3>
          </div>

          <div className={styles.content}>
            <div className={styles.productSlots}>
              {/* Filled slots */}
              {compareProducts.map((product) => (
                <div key={product.id} className={styles.productSlot}>
                  <div className={styles.productImage}>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <p className={styles.productName}>{product.name}</p>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeItem(product.id)}
                    aria-label={`Remove ${product.name} from comparison`}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: maxItems - items.length }).map((_, i) => (
                <div key={`empty-${i}`} className={styles.emptySlot}>
                  <div className={styles.emptyIcon}>+</div>
                  <p className={styles.emptyText}>Add Product</p>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <Link href="/compare">
                <Button variant="primary" disabled={items.length < 2}>
                  Compare Now
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ScaleIcon() {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 16l3-8 3 8c-1.5.5-4.5.5-6 0z" />
      <path d="M2 16l3-8 3 8c-1.5.5-4.5.5-6 0z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

export default CompareTray;
