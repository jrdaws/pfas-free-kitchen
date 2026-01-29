'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './SearchHeader.module.css';

export type SortOption = 'relevance' | 'tier_desc' | 'tier_asc' | 'name_asc' | 'name_desc' | 'newest';
export type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'tier_desc', label: 'Verification (High→Low)' },
  { value: 'tier_asc', label: 'Verification (Low→High)' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'newest', label: 'Newest First' },
];

export interface SearchHeaderProps {
  resultCount: number;
  query?: string;
  category?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function SearchHeader({
  resultCount,
  query,
  category,
  viewMode,
  onViewModeChange,
}: SearchHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSort = (searchParams.get('sort') as SortOption) || 'relevance';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page'); // Reset to page 1
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Format the result description
  const getResultDescription = () => {
    if (query) {
      return (
        <>
          <span className={styles.count}>{resultCount.toLocaleString()}</span>{' '}
          {resultCount === 1 ? 'product' : 'products'} found for{' '}
          <span className={styles.query}>"{query}"</span>
        </>
      );
    }
    if (category) {
      return (
        <>
          <span className={styles.count}>{resultCount.toLocaleString()}</span>{' '}
          {resultCount === 1 ? 'product' : 'products'} in{' '}
          <span className={styles.category}>{category}</span>
        </>
      );
    }
    return (
      <>
        <span className={styles.count}>{resultCount.toLocaleString()}</span>{' '}
        {resultCount === 1 ? 'product' : 'products'}
      </>
    );
  };

  return (
    <div className={styles.header}>
      <p className={styles.results}>{getResultDescription()}</p>
      
      <div className={styles.controls}>
        {/* Sort dropdown */}
        <div className={styles.sortWrapper}>
          <label htmlFor="sort-select" className={styles.sortLabel}>
            Sort:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={handleSortChange}
            className={styles.sortSelect}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle */}
        <div className={styles.viewToggle} role="group" aria-label="View mode">
          <button
            onClick={() => onViewModeChange('list')}
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            title="List view"
          >
            ≡
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
            title="Grid view"
          >
            ⊞
          </button>
        </div>
      </div>
    </div>
  );
}
