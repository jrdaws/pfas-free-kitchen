import styles from './ProductCardSkeleton.module.css';

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function ProductCardSkeleton({ viewMode = 'grid' }: ProductCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className={styles.listCard}>
        <div className={styles.listImage} />
        <div className={styles.listContent}>
          <div className={styles.listTitle} />
          <div className={styles.listBrand} />
          <div className={styles.listBadge} />
          <div className={styles.listSpecs} />
          <div className={styles.listDesc} />
          <div className={styles.listActions}>
            <div className={styles.listCompare} />
            <div className={styles.listButton} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.content}>
        <div className={styles.badge} />
        <div className={styles.brand} />
        <div className={styles.title} />
        <div className={styles.spec} />
        <div className={styles.spec2} />
      </div>
      <div className={styles.footer}>
        <div className={styles.button} />
        <div className={styles.retailers} />
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export function ProductGridSkeleton({ count = 8, viewMode = 'grid' }: ProductGridSkeletonProps) {
  return (
    <div className={viewMode === 'list' ? styles.listGrid : styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
