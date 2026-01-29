'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './EmptyResults.module.css';

interface EmptyResultsProps {
  query?: string;
}

export function EmptyResults({ query }: EmptyResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasFilters = ['tier', 'category', 'material', 'brand', 'features'].some(
    param => searchParams.has(param)
  );

  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        <span className={styles.emoji}>🍳</span>
        <span className={styles.sparkles}>✨</span>
      </div>

      <h2 className={styles.title}>
        {query ? (
          <>No products found for "{query}"</>
        ) : (
          <>No products found</>
        )}
      </h2>

      <p className={styles.message}>
        We only list verified PFAS-free products. Try searching for materials 
        like "stainless steel" or "cast iron", or browse our categories.
      </p>

      <div className={styles.actions}>
        <Link href="/cookware" className={styles.primaryButton}>
          Browse All Products
        </Link>
        {hasFilters && (
          <button onClick={clearFilters} className={styles.secondaryButton}>
            Clear Filters
          </button>
        )}
      </div>

      <div className={styles.suggestions}>
        <p className={styles.suggestionsLabel}>Popular searches:</p>
        <div className={styles.suggestionLinks}>
          <Link href="/search?q=cast+iron+skillet" className={styles.suggestionLink}>
            Cast iron skillet
          </Link>
          <Link href="/search?q=stainless+steel+pan" className={styles.suggestionLink}>
            Stainless steel pan
          </Link>
          <Link href="/search?q=dutch+oven" className={styles.suggestionLink}>
            Dutch oven
          </Link>
          <Link href="/search?q=glass+containers" className={styles.suggestionLink}>
            Glass containers
          </Link>
        </div>
      </div>
    </div>
  );
}
