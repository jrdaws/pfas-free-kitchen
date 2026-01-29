'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { TierBadge } from '@/components/product/TierBadge';
import type { VerificationTier } from '@/lib/types';
import styles from './EcommerceSearchBar.module.css';

interface EcommerceSearchBarProps {
  placeholder?: string;
  showKeyboardHint?: boolean;
  onSearch?: (query: string) => void;
}

const POPULAR_SEARCHES = ['cast iron', 'ceramic cookware', 'food storage', 'baking sheets'];

export function EcommerceSearchBar({
  placeholder = 'Search verified cookware, bakeware, storage...',
  showKeyboardHint = true,
  onSearch,
}: EcommerceSearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  
  const { suggestions, isLoading } = useSearchSuggestions(query);
  const { recent, addSearch, removeSearch, clearRecent } = useRecentSearches();

  // Calculate total items for keyboard navigation
  const getTotalItems = useCallback(() => {
    if (!query) {
      return recent.length + POPULAR_SEARCHES.length;
    }
    if (!suggestions) return 0;
    return (
      suggestions.products.length +
      suggestions.categories.length +
      suggestions.materials.length +
      1 // "search all" option
    );
  }, [query, suggestions, recent.length]);

  // Handle keyboard shortcut (⌘K or Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
      // / key when not in input
      if (e.key === '/' && !isInputElement(e.target)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    addSearch(trimmed);
    setIsFocused(false);
    setHighlightIndex(-1);
    setQuery('');
    
    onSearch?.(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [addSearch, onSearch, router]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (highlightIndex >= 0) {
      selectHighlightedItem();
    } else if (query.trim()) {
      handleSearch(query);
    }
  }, [query, highlightIndex]);

  const selectHighlightedItem = useCallback(() => {
    if (!query) {
      // Empty state - recent + popular
      const allItems = [...recent, ...POPULAR_SEARCHES];
      if (highlightIndex >= 0 && highlightIndex < allItems.length) {
        handleSearch(allItems[highlightIndex]);
      }
      return;
    }

    if (!suggestions) return;

    let currentIndex = 0;

    // Products
    for (const product of suggestions.products) {
      if (currentIndex === highlightIndex) {
        addSearch(product.name);
        router.push(`/product/${product.slug}`);
        setIsFocused(false);
        setQuery('');
        return;
      }
      currentIndex++;
    }

    // Categories
    for (const category of suggestions.categories) {
      if (currentIndex === highlightIndex) {
        addSearch(category.name);
        router.push(`/search?category=${category.slug}`);
        setIsFocused(false);
        setQuery('');
        return;
      }
      currentIndex++;
    }

    // Materials
    for (const material of suggestions.materials) {
      if (currentIndex === highlightIndex) {
        addSearch(material.name);
        router.push(`/search?material=${material.slug}`);
        setIsFocused(false);
        setQuery('');
        return;
      }
      currentIndex++;
    }

    // Search all
    if (currentIndex === highlightIndex) {
      handleSearch(query);
    }
  }, [query, suggestions, highlightIndex, router, addSearch, handleSearch, recent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = getTotalItems();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        handleSubmit();
        break;

      case 'Escape':
        e.preventDefault();
        setIsFocused(false);
        setHighlightIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setIsFocused(false);
        setHighlightIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  // Render suggestions dropdown content
  const renderSuggestions = () => {
    // Empty state - show recent + popular
    if (!query) {
      return (
        <>
          {/* Recent Searches */}
          {recent.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Recent Searches</span>
                <button 
                  className={styles.clearButton}
                  onClick={clearRecent}
                  type="button"
                >
                  Clear
                </button>
              </div>
              <ul className={styles.list}>
                {recent.map((term, index) => (
                  <li key={term}>
                    <button
                      className={`${styles.item} ${highlightIndex === index ? styles.highlighted : ''}`}
                      onClick={() => handleSearch(term)}
                      type="button"
                    >
                      <span className={styles.itemIcon}>🕐</span>
                      <span className={styles.itemText}>{term}</span>
                      <button
                        className={styles.removeButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(term);
                        }}
                        type="button"
                        aria-label={`Remove ${term}`}
                      >
                        ×
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Popular Searches */}
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Popular Searches</span>
            <ul className={styles.list}>
              {POPULAR_SEARCHES.map((term, index) => {
                const itemIndex = recent.length + index;
                return (
                  <li key={term}>
                    <button
                      className={`${styles.item} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                      onClick={() => handleSearch(term)}
                      type="button"
                    >
                      <span className={styles.itemIcon}>🔥</span>
                      <span className={styles.itemText}>{term}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      );
    }

    // Loading state
    if (isLoading && !suggestions) {
      return (
        <div className={styles.loading}>
          <span className={styles.spinner} />
          <span>Searching...</span>
        </div>
      );
    }

    // No results
    if (suggestions && 
        suggestions.products.length === 0 && 
        suggestions.categories.length === 0 && 
        suggestions.materials.length === 0) {
      return (
        <div className={styles.noResults}>
          <p>No suggestions for &ldquo;{query}&rdquo;</p>
          <p className={styles.hint}>Press Enter to search all products</p>
        </div>
      );
    }

    // Results
    let currentIndex = 0;

    return (
      <>
        {/* Products */}
        {suggestions && suggestions.products.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Products</span>
            <ul className={styles.list}>
              {suggestions.products.map((product) => {
                const itemIndex = currentIndex++;
                return (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      className={`${styles.productItem} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                      onClick={() => {
                        addSearch(product.name);
                        setIsFocused(false);
                        setQuery('');
                      }}
                    >
                      <div className={styles.productImage}>
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt=""
                            width={40}
                            height={40}
                          />
                        ) : (
                          <span className={styles.placeholderImage}>🍳</span>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>
                          <HighlightMatch text={product.name} query={query} />
                        </span>
                        {product.brandName && (
                          <span className={styles.productBrand}>{product.brandName}</span>
                        )}
                      </div>
                      <TierBadge tier={product.tier as VerificationTier} size="sm" showLabel={false} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Categories */}
        {suggestions && suggestions.categories.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Categories</span>
            <ul className={styles.list}>
              {suggestions.categories.map((category) => {
                const itemIndex = currentIndex++;
                return (
                  <li key={category.id}>
                    <Link
                      href={`/search?category=${category.slug}`}
                      className={`${styles.item} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                      onClick={() => {
                        addSearch(category.name);
                        setIsFocused(false);
                        setQuery('');
                      }}
                    >
                      <span className={styles.itemIcon}>🍳</span>
                      <span className={styles.itemText}>
                        <HighlightMatch text={category.name} query={query} />
                      </span>
                      <span className={styles.itemCount}>{category.productCount} products</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Materials */}
        {suggestions && suggestions.materials.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Materials</span>
            <ul className={styles.list}>
              {suggestions.materials.map((material) => {
                const itemIndex = currentIndex++;
                return (
                  <li key={material.slug}>
                    <Link
                      href={`/search?material=${material.slug}`}
                      className={`${styles.item} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                      onClick={() => {
                        addSearch(material.name);
                        setIsFocused(false);
                        setQuery('');
                      }}
                    >
                      <span className={styles.itemIcon}>🔧</span>
                      <span className={styles.itemText}>
                        <HighlightMatch text={material.name} query={query} />
                      </span>
                      <span className={styles.itemCount}>{material.productCount} products</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Search all footer */}
        <div className={styles.footer}>
          <button
            className={`${styles.searchAll} ${highlightIndex === currentIndex ? styles.highlighted : ''}`}
            onClick={() => handleSearch(query)}
            type="button"
          >
            Press <kbd>Enter</kbd> to search all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      </>
    );
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <form 
        className={`${styles.searchBar} ${isFocused ? styles.focused : ''}`}
        onSubmit={handleSubmit}
        role="search"
      >
        <div className={styles.inputWrapper}>
          <svg 
            className={styles.searchIcon} 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" 
              clipRule="evenodd" 
            />
          </svg>
          
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            aria-label="Search products"
            role="combobox"
            aria-expanded={isFocused}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path 
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" 
                />
              </svg>
            </button>
          )}

          {isLoading && (
            <span className={styles.loadingIndicator}>
              <span className={styles.spinner} />
            </span>
          )}
        </div>
        
        {showKeyboardHint && !isFocused && !query && (
          <kbd className={styles.keyboardHint}>
            <span className={styles.keyMod}>⌘</span>
            <span className={styles.keyLetter}>K</span>
          </kbd>
        )}
        
        <button 
          type="submit" 
          className={styles.submitButton}
          aria-label="Search"
        >
          <span className={styles.submitText}>Search</span>
          <svg 
            className={styles.submitIcon}
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </form>
      
      {/* Suggestions dropdown */}
      {isFocused && (
        <div 
          id="search-suggestions"
          className={styles.suggestions}
          role="listbox"
        >
          {renderSuggestions()}
        </div>
      )}
    </div>
  );
}

/**
 * Highlight matching text in suggestions.
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className={styles.highlight}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target) return false;
  const tagName = (target as HTMLElement).tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || (target as HTMLElement).isContentEditable;
}

export default EcommerceSearchBar;
