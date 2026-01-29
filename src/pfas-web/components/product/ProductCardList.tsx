'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { TierBadge } from './TierBadge';
import styles from './ProductCardList.module.css';

interface ProductCardListProps {
  product: Product;
  onCompareToggle?: (productId: string) => void;
  isComparing?: boolean;
}

export function ProductCardList({ 
  product, 
  onCompareToggle, 
  isComparing = false 
}: ProductCardListProps) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || product.imageUrl || '/placeholder-product.svg';

  return (
    <article 
      className={styles.card} 
      aria-labelledby={`product-list-${product.id}`}
    >
      {/* Image */}
      <Link href={`/product/${product.slug}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="180px"
            className={styles.image}
          />
        </div>
      </Link>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 id={`product-list-${product.id}`} className={styles.name}>
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className={styles.brand}>Brand: {product.brand?.name}</p>
          </div>
        </div>

        {/* Verification */}
        <div className={styles.verification}>
          <TierBadge tier={product.verification?.tier || 0} size="sm" showLabel />
          {product.verification?.hasEvidence && (
            <span className={styles.evidence}>
              · {product.verification.evidenceCount} evidence document
              {product.verification.evidenceCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Specs */}
        <div className={styles.specs}>
          {product.materialSummary && (
            <span className={styles.spec}>
              <strong>Material:</strong> {product.materialSummary}
            </span>
          )}
          {product.coatingSummary && (
            <span className={styles.spec}>
              <strong>Coating:</strong> {product.coatingSummary}
            </span>
          )}
          {product.features?.inductionCompatible && (
            <span className={styles.spec}>
              <strong>Induction:</strong> Yes
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className={styles.description}>
            "{product.description.slice(0, 150)}
            {product.description.length > 150 ? '...' : ''}"
          </p>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {onCompareToggle && (
            <label className={styles.compareLabel}>
              <input
                type="checkbox"
                checked={isComparing}
                onChange={() => onCompareToggle(product.id)}
                className={styles.compareCheckbox}
              />
              <span>Compare</span>
            </label>
          )}
          <Link href={`/product/${product.slug}`} className={styles.viewButton}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
