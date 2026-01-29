'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { TierBadge } from './TierBadge';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  onCompareToggle?: (productId: string) => void;
  isComparing?: boolean;
  onSave?: (productId: string) => void;
  isSaved?: boolean;
}

export function ProductCard({ 
  product, 
  variant = 'default',
  onCompareToggle, 
  isComparing = false,
  onSave,
  isSaved = false 
}: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || product.imageUrl || '/placeholder-product.svg';

  // Get retailer icons (limit to 4)
  const retailerIcons = product.retailers?.slice(0, 4) || [];

  const isCompact = variant === 'compact';

  return (
    <article 
      className={`${styles.card} ${isCompact ? styles.compact : ''}`} 
      aria-labelledby={`product-${product.id}`}
    >
      {/* Top actions */}
      <div className={styles.topActions}>
        {onCompareToggle && (
          <label className={styles.compareLabel}>
            <input
              type="checkbox"
              checked={isComparing}
              onChange={() => onCompareToggle(product.id)}
              className={styles.compareCheckbox}
            />
            <span className={styles.compareText}>Compare</span>
          </label>
        )}
        {onSave && (
          <button
            onClick={() => onSave(product.id)}
            className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
            aria-pressed={isSaved}
            aria-label={isSaved ? 'Remove from saved' : 'Save product'}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
      </div>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={styles.image}
          />
          <div className={styles.quickView}>Quick View</div>
        </div>
      </Link>

      {/* Verification Badge */}
      <div className={styles.tierRow}>
        <TierBadge 
          tier={product.verification?.tier || 0} 
          size="sm" 
          showLabel 
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <p className={styles.brand}>{product.brand?.name}</p>
        
        <h3 id={`product-${product.id}`} className={styles.name}>
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Specs */}
        <div className={styles.specs}>
          {product.materialSummary && (
            <p className={styles.spec}>
              <span className={styles.specLabel}>Material:</span>{' '}
              {product.materialSummary}
            </p>
          )}
          {product.coatingSummary && (
            <p className={styles.spec}>
              <span className={styles.specLabel}>Coating:</span>{' '}
              {product.coatingSummary}
            </p>
          )}
        </div>

        {/* Evidence indicator */}
        {product.verification?.hasEvidence && (
          <p className={styles.evidence}>
            📄 {product.verification.evidenceCount} evidence doc
            {product.verification.evidenceCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href={`/product/${product.slug}`} className={styles.viewButton}>
          View Details
        </Link>
        
        {retailerIcons.length > 0 && (
          <div className={styles.retailers}>
            <span className={styles.retailerLabel}>Available at:</span>
            <div className={styles.retailerIcons}>
              {retailerIcons.map(link => (
                <span 
                  key={link.id} 
                  className={styles.retailerIcon}
                  title={link.retailer?.name}
                >
                  {getRetailerIcon(link.retailer?.name || '')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function getRetailerIcon(name: string): string {
  const icons: Record<string, string> = {
    'amazon': '🛒',
    'target': '🎯',
    'williams sonoma': '🍳',
    'sur la table': '👨‍🍳',
    'default': '🏪',
  };
  const key = name.toLowerCase();
  return icons[key] || icons.default;
}
