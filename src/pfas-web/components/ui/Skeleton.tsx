/**
 * Skeleton Loading Components
 * 
 * Animated placeholder components for loading states.
 * Provides visual feedback while content is being fetched.
 */

import styles from './Skeleton.module.css';

interface SkeletonProps {
  /** Shape variant of the skeleton */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width of the skeleton (CSS value or number for pixels) */
  width?: string | number;
  /** Height of the skeleton (CSS value or number for pixels) */
  height?: string | number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ 
  variant = 'rectangular', 
  width, 
  height, 
  className = '' 
}: SkeletonProps) {
  const variantClass = styles[variant] || '';
  
  return (
    <div 
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height 
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
}

/**
 * Product card skeleton for grid loading states
 */
export function ProductCardSkeleton() {
  return (
    <div className={styles.cardSkeleton} aria-hidden="true">
      <Skeleton variant="rectangular" className={styles.cardImage} />
      <div className={styles.cardContent}>
        <Skeleton width="75%" height={20} />
        <Skeleton width="50%" height={16} />
        <div className={styles.cardFooter}>
          <Skeleton width="40%" height={14} />
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      </div>
    </div>
  );
}

/**
 * Product grid skeleton for category pages
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={styles.gridSkeleton} role="status" aria-label="Loading products">
      <span className="sr-only">Loading products...</span>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Product detail page skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className={styles.detailSkeleton} aria-hidden="true">
      <div className={styles.detailGallery}>
        <Skeleton variant="rectangular" className={styles.detailMainImage} />
        <div className={styles.detailThumbnails}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={80} height={80} />
          ))}
        </div>
      </div>
      <div className={styles.detailInfo}>
        <Skeleton width="60%" height={32} />
        <Skeleton width="40%" height={20} />
        <Skeleton variant="rectangular" height={80} />
        <div className={styles.detailActions}>
          <Skeleton width={120} height={40} />
          <Skeleton width={120} height={40} />
        </div>
      </div>
    </div>
  );
}

/**
 * Text content skeleton (for descriptions, paragraphs)
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.textSkeleton} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 ? '60%' : '100%'} 
          height={16} 
        />
      ))}
    </div>
  );
}

/**
 * Search results skeleton
 */
export function SearchResultsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.searchSkeleton} aria-hidden="true">
      <div className={styles.searchHeader}>
        <Skeleton width={180} height={20} />
        <Skeleton width={100} height={32} />
      </div>
      <div className={styles.searchFilters}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width={100} height={32} />
        ))}
      </div>
      <ProductGridSkeleton count={count} />
    </div>
  );
}

/**
 * Table row skeleton for admin views
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className={styles.tableRow} aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === 0 ? '30%' : '15%'} 
          height={16} 
        />
      ))}
    </div>
  );
}

/**
 * Inline skeleton for small loading states
 */
export function InlineSkeleton({ width = 60 }: { width?: number | string }) {
  return (
    <Skeleton 
      variant="text" 
      width={width} 
      height="1em" 
      className={styles.inline} 
    />
  );
}

export default Skeleton;
