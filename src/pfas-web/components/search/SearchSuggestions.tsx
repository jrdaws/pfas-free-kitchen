'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TierBadge } from '../product/TierBadge';
import type { 
  SearchSuggestions as Suggestions, 
  ProductSuggestion, 
  CategorySuggestion, 
  MaterialSuggestion 
} from '@/hooks/useSearchSuggestions';
import type { VerificationTier } from '@/lib/types';
import styles from './SearchSuggestions.module.css';

interface SearchSuggestionsProps {
  query: string;
  suggestions: Suggestions | null;
  recent: string[];
  popularSearches?: string[];
  isLoading: boolean;
  highlightIndex: number;
  onSelect: (query: string, type?: 'search' | 'product' | 'category' | 'material') => void;
  onClearRecent: () => void;
  onRemoveRecent?: (query: string) => void;
}

export function SearchSuggestions({
  query,
  suggestions,
  recent,
  popularSearches = ['cast iron', 'ceramic cookware', 'food storage', 'baking sheets'],
  isLoading,
  highlightIndex,
  onSelect,
  onClearRecent,
  onRemoveRecent,
}: SearchSuggestionsProps) {
  // Build flat list of all selectable items for keyboard navigation
  const allItems = buildItemList(query, suggestions, recent, popularSearches);

  // Show empty state (recent + popular) when no query
  if (!query) {
    return (
      <div className={styles.dropdown} role="listbox">
        {/* Recent Searches */}
        {recent.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Searches</h3>
              <button 
                className={styles.clearButton}
                onClick={onClearRecent}
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
                    onClick={() => onSelect(term, 'search')}
                    data-index={index}
                    role="option"
                    aria-selected={highlightIndex === index}
                    type="button"
                  >
                    <span className={styles.itemIcon}>🕐</span>
                    <span className={styles.itemText}>{term}</span>
                    {onRemoveRecent && (
                      <button
                        className={styles.removeButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveRecent(term);
                        }}
                        aria-label={`Remove ${term} from recent searches`}
                        type="button"
                      >
                        ×
                      </button>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Popular Searches */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Popular Searches</h3>
          <ul className={styles.list}>
            {popularSearches.map((term, index) => {
              const itemIndex = recent.length + index;
              return (
                <li key={term}>
                  <button
                    className={`${styles.item} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                    onClick={() => onSelect(term, 'search')}
                    data-index={itemIndex}
                    role="option"
                    aria-selected={highlightIndex === itemIndex}
                    type="button"
                  >
                    <span className={styles.itemIcon}>🔥</span>
                    <span className={styles.itemText}>{term}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    );
  }

  // Loading state
  if (isLoading && !suggestions) {
    return (
      <div className={styles.dropdown} role="listbox">
        <div className={styles.loading}>
          <span className={styles.spinner} />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  // No results
  if (suggestions && 
      suggestions.products.length === 0 && 
      suggestions.categories.length === 0 && 
      suggestions.materials.length === 0) {
    return (
      <div className={styles.dropdown} role="listbox">
        <div className={styles.noResults}>
          <p>No suggestions for &ldquo;{query}&rdquo;</p>
          <p className={styles.hint}>Press Enter to search all products</p>
        </div>
      </div>
    );
  }

  // Results
  let currentIndex = 0;

  return (
    <div className={styles.dropdown} role="listbox">
      {/* Products */}
      {suggestions && suggestions.products.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Products</h3>
          <ul className={styles.list}>
            {suggestions.products.map((product) => {
              const itemIndex = currentIndex++;
              return (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.slug}`}
                    className={`${styles.productItem} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                    data-index={itemIndex}
                    role="option"
                    aria-selected={highlightIndex === itemIndex}
                    onClick={() => onSelect(product.name, 'product')}
                  >
                    <div className={styles.productImage}>
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt=""
                          width={40}
                          height={40}
                          className={styles.thumbnail}
                        />
                      ) : (
                        <div className={styles.placeholderImage}>🍳</div>
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
        </section>
      )}

      {/* Categories */}
      {suggestions && suggestions.categories.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Categories</h3>
          <ul className={styles.list}>
            {suggestions.categories.map((category) => {
              const itemIndex = currentIndex++;
              return (
                <li key={category.id}>
                  <Link
                    href={`/search?category=${category.slug}`}
                    className={`${styles.item} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                    data-index={itemIndex}
                    role="option"
                    aria-selected={highlightIndex === itemIndex}
                    onClick={() => onSelect(category.name, 'category')}
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
        </section>
      )}

      {/* Materials */}
      {suggestions && suggestions.materials.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Materials</h3>
          <ul className={styles.list}>
            {suggestions.materials.map((material) => {
              const itemIndex = currentIndex++;
              return (
                <li key={material.slug}>
                  <Link
                    href={`/search?material=${material.slug}`}
                    className={`${styles.item} ${highlightIndex === itemIndex ? styles.highlighted : ''}`}
                    data-index={itemIndex}
                    role="option"
                    aria-selected={highlightIndex === itemIndex}
                    onClick={() => onSelect(material.name, 'material')}
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
        </section>
      )}

      {/* Search all footer */}
      <div className={styles.footer}>
        <button
          className={`${styles.searchAll} ${highlightIndex === currentIndex ? styles.highlighted : ''}`}
          onClick={() => onSelect(query, 'search')}
          data-index={currentIndex}
          role="option"
          aria-selected={highlightIndex === currentIndex}
          type="button"
        >
          Press <kbd>Enter</kbd> to search all results for &ldquo;{query}&rdquo;
        </button>
      </div>
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

/**
 * Build flat list of all selectable items for keyboard navigation.
 */
function buildItemList(
  query: string,
  suggestions: Suggestions | null,
  recent: string[],
  popularSearches: string[]
): string[] {
  if (!query) {
    return [...recent, ...popularSearches];
  }
  
  if (!suggestions) return [];
  
  const items: string[] = [];
  suggestions.products.forEach(p => items.push(`product:${p.id}`));
  suggestions.categories.forEach(c => items.push(`category:${c.id}`));
  suggestions.materials.forEach(m => items.push(`material:${m.slug}`));
  items.push(`search:${query}`);
  
  return items;
}
