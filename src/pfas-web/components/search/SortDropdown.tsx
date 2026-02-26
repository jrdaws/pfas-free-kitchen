'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './SortDropdown.module.css';

const SORT_OPTIONS = [
  { value: 'tier_desc', label: 'Highest Verified First' },
  { value: 'tier_asc', label: 'Lowest Verified First' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

interface SortDropdownProps {
  totalCount?: number;
}

export function SortDropdown({ totalCount }: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || 'tier_desc';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={styles.container}>
      {totalCount !== undefined && (
        <span className={styles.count}>
          {totalCount} {totalCount === 1 ? 'product' : 'products'}
        </span>
      )}
      <div className={styles.sortWrapper}>
        <label htmlFor="sort-select" className={styles.label}>
          Sort by:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          className={styles.select}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
