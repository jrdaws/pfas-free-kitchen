import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { TierBadge } from './TierBadge';
import styles from './CategoryTopPicks.module.css';

interface CategoryTopPicksProps {
  topPick: Product;
  topThree: Product[];
}

export function CategoryTopPicks({ topPick, topThree }: CategoryTopPicksProps) {
  const primaryImage = topPick.images?.find(img => img.isPrimary) || topPick.images?.[0];
  const imageUrl = primaryImage?.url || topPick.imageUrl || '/placeholder-product.svg';

  return (
    <section className={styles.section} aria-labelledby="top-picks-heading">
      <h2 id="top-picks-heading" className={styles.heading}>
        Top Picks
      </h2>

      {/* Top Pick Hero */}
      <div className={styles.topPickCard}>
        <span className={styles.topPickLabel}>Top Pick</span>
        <Link href={`/product/${topPick.slug}`} className={styles.topPickLink}>
          <div className={styles.topPickImage}>
            <Image
              src={imageUrl}
              alt={topPick.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className={styles.image}
            />
          </div>
          <div className={styles.topPickContent}>
            <TierBadge tier={topPick.verification?.tier || 0} size="sm" showLabel />
            <p className={styles.topPickBrand}>{topPick.brand?.name}</p>
            <h3 className={styles.topPickName}>{topPick.name}</h3>
            {topPick.materialSummary && (
              <p className={styles.topPickSpec}>{topPick.materialSummary}</p>
            )}
            <span className={styles.viewDetails}>View Details →</span>
          </div>
        </Link>
      </div>

      {/* Top 3 List */}
      {topThree.length > 1 && (
        <div className={styles.topThree}>
          <h3 className={styles.topThreeHeading}>Top 3 in this category</h3>
          <ol className={styles.topThreeList}>
            {topThree.map((product, idx) => (
              <li key={product.id} className={styles.topThreeItem}>
                <Link href={`/product/${product.slug}`} className={styles.topThreeLink}>
                  <span className={styles.rank}>{idx + 1}</span>
                  <span className={styles.productName}>{product.name}</span>
                  <TierBadge tier={product.verification?.tier || 0} size="sm" showLabel />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
