'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import clsx from 'clsx';
import styles from './Pagination.module.css';

const PER_PAGE_OPTIONS = [12, 24, 48, 96];

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  baseUrl?: string;
  showPerPage?: boolean;
}

export function Pagination({ 
  page, 
  totalPages, 
  totalCount, 
  limit, 
  baseUrl = '',
  showPerPage = true 
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1 && totalCount <= PER_PAGE_OPTIONS[0]) return null;

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(pageNum));
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', e.target.value);
    params.delete('page'); // Reset to page 1
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pages = getPageNumbers(page, totalPages);

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <div className={styles.top}>
        <p className={styles.info}>
          Showing {startItem}–{endItem} of {totalCount.toLocaleString()} products
        </p>
        
        {showPerPage && (
          <div className={styles.perPage}>
            <label htmlFor="per-page" className={styles.perPageLabel}>
              Show:
            </label>
            <select
              id="per-page"
              value={limit}
              onChange={handlePerPageChange}
              className={styles.perPageSelect}
            >
              {PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.controls}>
          {page > 1 ? (
            <Link href={createPageUrl(page - 1)} className={styles.navButton}>
              ← Prev
            </Link>
          ) : (
            <span className={clsx(styles.navButton, styles.disabled)}>← Prev</span>
          )}

          <div className={styles.pages}>
            {pages.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className={styles.ellipsis}>
                  …
                </span>
              ) : (
                <Link
                  key={p}
                  href={createPageUrl(p as number)}
                  className={clsx(styles.pageButton, page === p && styles.active)}
                  aria-current={page === p ? 'page' : undefined}
                >
                  {p}
                </Link>
              )
            )}
          </div>

          {page < totalPages ? (
            <Link href={createPageUrl(page + 1)} className={styles.navButton}>
              Next →
            </Link>
          ) : (
            <span className={clsx(styles.navButton, styles.disabled)}>Next →</span>
          )}
        </div>
      )}
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);

  return pages;
}
