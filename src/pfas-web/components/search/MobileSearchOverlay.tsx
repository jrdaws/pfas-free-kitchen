'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './MobileSearchOverlay.module.css';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'pfas-recent-searches';
const MAX_RECENT = 5;

const POPULAR_SEARCHES = [
  'cast iron',
  'ceramic cookware',
  'stainless steel',
  'glass storage',
  'silicone utensils',
];

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure transition has started
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const saveRecentSearch = (search: string) => {
    try {
      let recent = [...recentSearches];
      // Remove if exists
      recent = recent.filter(s => s.toLowerCase() !== search.toLowerCase());
      // Add to beginning
      recent.unshift(search);
      // Limit
      recent = recent.slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
      setRecentSearches(recent);
    } catch (e) {
      console.error('Failed to save recent search:', e);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSearchClick = (search: string) => {
    saveRecentSearch(search);
    router.push(`/search?q=${encodeURIComponent(search)}`);
    onClose();
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
      {/* Header with search input */}
      <div className={styles.header}>
        <button 
          onClick={onClose} 
          className={styles.backButton}
          aria-label="Close search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className={styles.searchInput}
            enterKeyHint="search"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
          />
        </form>

        <button 
          onClick={onClose} 
          className={styles.cancelButton}
          type="button"
        >
          Cancel
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Searches</h3>
              <button 
                onClick={clearRecentSearches}
                className={styles.clearButton}
              >
                Clear
              </button>
            </div>
            <ul className={styles.searchList}>
              {recentSearches.map((search, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSearchClick(search)}
                    className={styles.searchItem}
                  >
                    <svg className={styles.itemIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{search}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Popular searches */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Popular</h3>
          </div>
          <ul className={styles.searchList}>
            {POPULAR_SEARCHES.map((search, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSearchClick(search)}
                  className={styles.searchItem}
                >
                  <svg className={styles.itemIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                  <span>{search}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MobileSearchOverlay;
