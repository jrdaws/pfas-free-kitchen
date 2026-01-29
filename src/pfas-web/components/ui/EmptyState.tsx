/**
 * EmptyState Component
 * 
 * Displays friendly empty state messages for various scenarios.
 * Includes contextual suggestions and actions.
 */

import styles from './EmptyState.module.css';
import Link from 'next/link';

export type EmptyType = 
  | 'no-results' 
  | 'no-products' 
  | 'empty-compare' 
  | 'empty-favorites'
  | 'empty-cart'
  | 'no-reviews';

interface EmptyStateProps {
  /** Type of empty state to display */
  type: EmptyType;
  /** Active filters (for no-results state) */
  filters?: Record<string, string | string[]>;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
  /** Search query (for no-results state) */
  searchQuery?: string;
  /** Category context */
  category?: string;
}

interface EmptyContent {
  icon: string;
  title: string;
  message: string;
}

const EMPTY_CONTENT: Record<EmptyType, EmptyContent> = {
  'no-results': {
    icon: '📭',
    title: 'No products match your filters',
    message: 'Try adjusting your filters or search terms to find what you\'re looking for.',
  },
  'no-products': {
    icon: '🍳',
    title: 'No products yet',
    message: 'We\'re working on adding products to this category. Check back soon!',
  },
  'empty-compare': {
    icon: '⚖️',
    title: 'No products to compare',
    message: 'Add products to compare by clicking the compare checkbox on product cards.',
  },
  'empty-favorites': {
    icon: '💚',
    title: 'No favorites yet',
    message: 'Save products you love to easily find them later.',
  },
  'empty-cart': {
    icon: '🛒',
    title: 'Your cart is empty',
    message: 'Browse our PFAS-free products and add items to your cart.',
  },
  'no-reviews': {
    icon: '💬',
    title: 'No reviews yet',
    message: 'Be the first to share your experience with this product.',
  },
};

export function EmptyState({ 
  type, 
  filters, 
  onClearFilters, 
  searchQuery,
  category 
}: EmptyStateProps) {
  const content = EMPTY_CONTENT[type];

  // Format filter value for display
  const formatFilterValue = (value: string | string[]): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon} aria-hidden="true">{content.icon}</span>
      </div>
      
      <h2 className={styles.title}>{content.title}</h2>
      
      {type === 'no-results' && searchQuery && (
        <p className={styles.searchQuery}>
          Searching for: <strong>"{searchQuery}"</strong>
        </p>
      )}
      
      <p className={styles.message}>{content.message}</p>
      
      {/* Active filters display */}
      {type === 'no-results' && filters && Object.keys(filters).length > 0 && (
        <div className={styles.filtersSection}>
          <p className={styles.filtersLabel}>Active filters:</p>
          <ul className={styles.filterList} role="list">
            {Object.entries(filters).map(([key, value]) => (
              <li key={key} className={styles.filterItem}>
                <span className={styles.filterKey}>{key}:</span>
                <span className={styles.filterValue}>{formatFilterValue(value)}</span>
              </li>
            ))}
          </ul>
          {onClearFilters && (
            <button 
              onClick={onClearFilters} 
              className={styles.clearButton}
              type="button"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
      
      {/* Contextual actions */}
      <div className={styles.actions}>
        {type === 'empty-compare' && (
          <Link href={category ? `/${category}` : '/cookware'} className={styles.primaryLink}>
            Browse products →
          </Link>
        )}
        
        {type === 'empty-favorites' && (
          <Link href="/cookware" className={styles.primaryLink}>
            Explore products →
          </Link>
        )}
        
        {type === 'empty-cart' && (
          <Link href="/cookware" className={styles.primaryLink}>
            Start shopping →
          </Link>
        )}
        
        {type === 'no-results' && (
          <div className={styles.suggestions}>
            <p className={styles.suggestionsTitle}>Suggestions:</p>
            <ul className={styles.suggestionsList}>
              <li>Check spelling of search terms</li>
              <li>Try broader filter selections</li>
              <li>Browse a different category</li>
            </ul>
          </div>
        )}
        
        {type === 'no-products' && (
          <Link href="/" className={styles.primaryLink}>
            Browse all categories →
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Compact empty state for inline use
 */
export function CompactEmptyState({ 
  message, 
  icon = '📭',
  action 
}: { 
  message: string;
  icon?: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
}) {
  return (
    <div className={styles.compactContainer}>
      <span className={styles.compactIcon} aria-hidden="true">{icon}</span>
      <span className={styles.compactMessage}>{message}</span>
      {action && 'href' in action && (
        <Link href={action.href} className={styles.compactLink}>
          {action.label}
        </Link>
      )}
      {action && 'onClick' in action && (
        <button onClick={action.onClick} className={styles.compactButton}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
