'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterSidebar } from './FilterSidebar';
import styles from './MobileFilterButton.module.css';

const FILTER_PARAMS = ['tier', 'category', 'material', 'brand', 'features'];

export function MobileFilterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Count active filters
  const activeCount = FILTER_PARAMS.reduce((count, param) => {
    const values = searchParams.get(param)?.split(',').filter(Boolean) || [];
    return count + values.length;
  }, 0);

  return (
    <>
      <button
        className={styles.button}
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-filters"
      >
        <span className={styles.icon}>☰</span>
        <span className={styles.text}>Filters</span>
        {activeCount > 0 && (
          <span className={styles.badge}>{activeCount}</span>
        )}
      </button>

      {/* Mobile filter overlay */}
      {isOpen && (
        <div className={styles.overlay} id="mobile-filters">
          <div 
            className={styles.backdrop} 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <FilterSidebar 
            isMobile 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      )}
    </>
  );
}
