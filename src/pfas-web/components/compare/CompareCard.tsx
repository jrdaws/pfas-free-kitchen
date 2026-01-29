'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { TierBadge } from '@/components/product/TierBadge';
import { Button } from '@/components/ui';
import styles from './CompareCard.module.css';

interface CompareCardProps {
  products: Product[];
  onRemove: (productId: string) => void;
}

export function CompareCard({ products, onRemove }: CompareCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentIndex < products.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < products.length) {
      setCurrentIndex(index);
    }
  };

  // Reset index if current product is removed
  useEffect(() => {
    if (currentIndex >= products.length) {
      setCurrentIndex(Math.max(0, products.length - 1));
    }
  }, [products.length, currentIndex]);

  if (products.length === 0) {
    return null;
  }

  const product = products[currentIndex];

  return (
    <div className={styles.wrapper}>
      {/* Navigation header */}
      <div className={styles.nav}>
        <span className={styles.navCount}>
          Comparing {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
        <div className={styles.navButtons}>
          <button
            className={styles.navButton}
            onClick={() => goToIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            aria-label="Previous product"
          >
            ‹
          </button>
          <button
            className={styles.navButton}
            onClick={() => goToIndex(currentIndex + 1)}
            disabled={currentIndex === products.length - 1}
            aria-label="Next product"
          >
            ›
          </button>
        </div>
      </div>

      {/* Swipeable card area */}
      <div
        ref={containerRef}
        className={styles.cardContainer}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <article className={styles.card}>
          {/* Product image and header */}
          <div className={styles.header}>
            <Link href={`/product/${product.slug}`} className={styles.imageLink}>
              <div className={styles.image}>
                <Image
                  src={product.images?.[0]?.url || product.imageUrl || '/placeholder-product.svg'}
                  alt={product.name}
                  fill
                  sizes="200px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </Link>
            <div className={styles.headerText}>
              <p className={styles.brand}>{product.brand?.name}</p>
              <h3 className={styles.name}>
                <Link href={`/product/${product.slug}`}>{product.name}</Link>
              </h3>
              <div className={styles.tier}>
                <TierBadge tier={product.verification?.tier || 0} size="md" showLabel />
              </div>
            </div>
          </div>

          {/* Specs list */}
          <div className={styles.specs}>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Material</span>
              <span className={styles.specValue}>{product.materialSummary || 'Not specified'}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Coating</span>
              <span className={styles.specValue}>{product.coatingSummary || 'None'}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Induction</span>
              <span className={styles.specValue}>
                {product.features?.inductionCompatible ? '✓ Yes' : product.features?.inductionCompatible === false ? '✗ No' : 'Unknown'}
              </span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Oven Safe</span>
              <span className={styles.specValue}>
                {product.features?.ovenSafeTempF ? `${product.features.ovenSafeTempF}°F` : 'Unknown'}
              </span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Dishwasher</span>
              <span className={styles.specValue}>
                {product.features?.dishwasherSafe ? '✓ Yes' : product.features?.dishwasherSafe === false ? '✗ No' : 'Unknown'}
              </span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Evidence</span>
              <span className={styles.specValue}>
                {product.verification?.hasEvidence 
                  ? `${product.verification.evidenceCount} doc${product.verification.evidenceCount !== 1 ? 's' : ''}` 
                  : 'None'}
              </span>
            </div>
          </div>

          {/* Retailers */}
          <div className={styles.retailers}>
            {product.retailers?.slice(0, 3).map((link) => (
              <a 
                key={link.id} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={styles.retailerButton}
              >
                {link.retailer?.name || 'Shop'}
              </a>
            ))}
          </div>

          {/* Remove button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(product.id)}
            className={styles.removeButton}
          >
            Remove from Compare
          </Button>
        </article>
      </div>

      {/* Dot indicators */}
      <div className={styles.dots} role="tablist" aria-label="Product navigation">
        {products.map((p, index) => (
          <button
            key={p.id}
            className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
            onClick={() => goToIndex(index)}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Go to ${p.name}`}
          />
        ))}
      </div>
    </div>
  );
}

export default CompareCard;
