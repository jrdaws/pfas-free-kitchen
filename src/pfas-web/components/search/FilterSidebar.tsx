'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './FilterSidebar.module.css';

// Filter configuration types
interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSection {
  id: string;
  label: string;
  type: 'checkbox' | 'search-checkbox';
  options: FilterOption[];
  showMoreThreshold?: number;
}

// Tier filter options
const TIER_OPTIONS: FilterOption[] = [
  { value: '4', label: 'Monitored (Tier 4)' },
  { value: '3', label: 'Lab Tested (Tier 3)' },
  { value: '2', label: 'Policy Reviewed (Tier 2)' },
  { value: '1', label: 'Brand Statement (Tier 1)' },
];

// Category filter options (will come from API/props in production)
const CATEGORY_OPTIONS: FilterOption[] = [
  { value: 'cookware', label: 'Cookware' },
  { value: 'bakeware', label: 'Bakeware' },
  { value: 'food-storage', label: 'Food Storage' },
  { value: 'utensils', label: 'Utensils & Tools' },
];

// Material filter options
const MATERIAL_OPTIONS: FilterOption[] = [
  { value: 'stainless-steel', label: 'Stainless Steel' },
  { value: 'cast-iron', label: 'Cast Iron' },
  { value: 'carbon-steel', label: 'Carbon Steel' },
  { value: 'ceramic', label: 'Ceramic' },
  { value: 'glass', label: 'Glass' },
  { value: 'enamel', label: 'Enameled' },
  { value: 'titanium', label: 'Titanium' },
  { value: 'copper', label: 'Copper' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'silicone', label: 'Silicone' },
  { value: 'wood', label: 'Wood' },
];

// Brand filter options (comprehensive list from product database)
const BRAND_OPTIONS: FilterOption[] = [
  { value: 'all-clad', label: 'All-Clad' },
  { value: 'anchor-hocking', label: 'Anchor Hocking' },
  { value: 'baratza', label: 'Baratza' },
  { value: 'bees-wrap', label: "Bee's Wrap" },
  { value: 'blendtec', label: 'Blendtec' },
  { value: 'bonavita', label: 'Bonavita' },
  { value: 'breville', label: 'Breville' },
  { value: 'calphalon', label: 'Calphalon' },
  { value: 'cuisinart', label: 'Cuisinart' },
  { value: 'de-buyer', label: 'de Buyer' },
  { value: 'demeyere', label: 'Demeyere' },
  { value: 'duxtop', label: 'Duxtop' },
  { value: 'ecolunchbox', label: 'ECOlunchbox' },
  { value: 'emile-henry', label: 'Emile Henry' },
  { value: 'fat-daddios', label: "Fat Daddio's" },
  { value: 'fellow', label: 'Fellow' },
  { value: 'field-company', label: 'Field Company' },
  { value: 'finex', label: 'FINEX' },
  { value: 'fritaire', label: 'Fritaire' },
  { value: 'glasslock', label: 'Glasslock' },
  { value: 'greenpan', label: 'GreenPan' },
  { value: 'greenlife', label: 'GreenLife' },
  { value: 'john-boos', label: 'John Boos' },
  { value: 'kitchenaid', label: 'KitchenAid' },
  { value: 'klean-kanteen', label: 'Klean Kanteen' },
  { value: 'le-creuset', label: 'Le Creuset' },
  { value: 'lodge', label: 'Lodge' },
  { value: 'lunchbots', label: 'LunchBots' },
  { value: 'made-in', label: 'Made In' },
  { value: 'moccamaster', label: 'Moccamaster' },
  { value: 'nordic-ware', label: 'Nordic Ware' },
  { value: 'our-place', label: 'Our Place' },
  { value: 'oxo', label: 'OXO' },
  { value: 'pyrex', label: 'Pyrex' },
  { value: 'smithey', label: 'Smithey' },
  { value: 'stasher', label: 'Stasher' },
  { value: 'staub', label: 'Staub' },
  { value: 'teakhaus', label: 'Teakhaus' },
  { value: 'tramontina', label: 'Tramontina' },
  { value: 'tribest', label: 'Tribest' },
  { value: 'usa-pan', label: 'USA Pan' },
  { value: 'victoria', label: 'Victoria' },
  { value: 'vitamix', label: 'Vitamix' },
  { value: 'xtrema', label: 'Xtrema' },
  { value: 'zwilling', label: 'Zwilling' },
];

// Feature filter options
const FEATURE_OPTIONS: FilterOption[] = [
  { value: 'induction', label: 'Induction Compatible' },
  { value: 'dishwasher', label: 'Dishwasher Safe' },
  { value: 'oven-500', label: 'Oven Safe 500°F+' },
];

export interface FilterSidebarProps {
  facets?: {
    tiers?: FilterOption[];
    categories?: FilterOption[];
    materials?: FilterOption[];
    brands?: FilterOption[];
    features?: FilterOption[];
  };
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterSidebar({ facets, onClose, isMobile = false }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['tier', 'category', 'material', 'brand', 'features'])
  );
  const [showMore, setShowMore] = useState<Set<string>>(new Set());
  const [brandSearch, setBrandSearch] = useState('');

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Toggle show more for a section
  const toggleShowMore = (sectionId: string) => {
    setShowMore(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Get current filter values from URL
  const getFilterValues = (paramName: string): string[] => {
    const value = searchParams.get(paramName);
    return value ? value.split(',') : [];
  };

  // Update URL with filter change
  const updateFilter = useCallback((paramName: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(paramName)?.split(',').filter(Boolean) || [];
    
    if (checked) {
      if (!current.includes(value)) {
        current.push(value);
      }
    } else {
      const index = current.indexOf(value);
      if (index > -1) {
        current.splice(index, 1);
      }
    }
    
    if (current.length > 0) {
      params.set(paramName, current.join(','));
    } else {
      params.delete(paramName);
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Clear all filters
  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    const filterParams = ['tier', 'category', 'material', 'brand', 'features'];
    return filterParams.some(param => searchParams.has(param));
  };

  // Render filter section
  const renderSection = (
    id: string,
    label: string,
    options: FilterOption[],
    paramName: string,
    hasSearch?: boolean,
    threshold = 5
  ) => {
    const isExpanded = expandedSections.has(id);
    const isShowingMore = showMore.has(id);
    const selectedValues = getFilterValues(paramName);
    
    let filteredOptions = options;
    if (hasSearch && brandSearch) {
      filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(brandSearch.toLowerCase())
      );
    }
    
    const displayOptions = isShowingMore 
      ? filteredOptions 
      : filteredOptions.slice(0, threshold);
    const hasMore = filteredOptions.length > threshold;

    return (
      <div className={styles.section} key={id}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection(id)}
          aria-expanded={isExpanded}
        >
          <span className={styles.sectionLabel}>{label}</span>
          <span className={styles.chevron}>{isExpanded ? '▼' : '▶'}</span>
        </button>
        
        {isExpanded && (
          <div className={styles.sectionContent}>
            {hasSearch && (
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className={styles.searchInput}
              />
            )}
            
            <div className={styles.options}>
              {displayOptions.map(option => (
                <label key={option.value} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => updateFilter(paramName, option.value, e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.count !== undefined && (
                    <span className={styles.count}>({option.count})</span>
                  )}
                </label>
              ))}
            </div>
            
            {hasMore && !hasSearch && (
              <button
                className={styles.showMore}
                onClick={() => toggleShowMore(id)}
              >
                {isShowingMore ? '− Show less' : `+ Show ${filteredOptions.length - threshold} more`}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`${styles.sidebar} ${isMobile ? styles.mobile : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {hasActiveFilters() && (
          <button onClick={clearAllFilters} className={styles.clearButton}>
            Clear all
          </button>
        )}
        {isMobile && onClose && (
          <button onClick={onClose} className={styles.closeButton} aria-label="Close filters">
            ✕
          </button>
        )}
      </div>
      
      <div className={styles.sections}>
        {renderSection('tier', 'Verification Tier', facets?.tiers || TIER_OPTIONS, 'tier')}
        {renderSection('category', 'Category', facets?.categories || CATEGORY_OPTIONS, 'category')}
        {renderSection('material', 'Material', facets?.materials || MATERIAL_OPTIONS, 'material')}
        {renderSection('brand', 'Brand', facets?.brands || BRAND_OPTIONS, 'brand', true, 5)}
        {renderSection('features', 'Features', facets?.features || FEATURE_OPTIONS, 'features')}
      </div>
      
      {isMobile && (
        <div className={styles.mobileFooter}>
          <button onClick={onClose} className={styles.applyButton}>
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  );
}
