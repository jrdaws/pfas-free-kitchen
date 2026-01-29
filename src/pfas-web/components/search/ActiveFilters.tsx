'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './ActiveFilters.module.css';

// Filter labels mapping
const FILTER_LABELS: Record<string, Record<string, string>> = {
  tier: {
    '4': 'Tier 4: Monitored',
    '3': 'Tier 3: Lab Tested',
    '2': 'Tier 2: Policy Reviewed',
    '1': 'Tier 1: Brand Statement',
  },
  category: {
    'cookware': 'Cookware',
    'bakeware': 'Bakeware',
    'food-storage': 'Food Storage',
    'utensils': 'Utensils',
  },
  material: {
    'stainless-steel': 'Stainless Steel',
    'cast-iron': 'Cast Iron',
    'carbon-steel': 'Carbon Steel',
    'ceramic': 'Ceramic',
    'glass': 'Glass',
    'enamel': 'Enameled',
  },
  brand: {
    'all-clad': 'All-Clad',
    'lodge': 'Lodge',
    'le-creuset': 'Le Creuset',
    'staub': 'Staub',
    'made-in': 'Made In',
    'demeyere': 'Demeyere',
  },
  features: {
    'induction': 'Induction Compatible',
    'dishwasher': 'Dishwasher Safe',
    'oven-500': 'Oven Safe 500°F+',
  },
};

const FILTER_PARAMS = ['tier', 'category', 'material', 'brand', 'features'];

export function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get all active filters
  const activeFilters: { param: string; value: string; label: string }[] = [];
  
  FILTER_PARAMS.forEach(param => {
    const values = searchParams.get(param)?.split(',').filter(Boolean) || [];
    values.forEach(value => {
      const label = FILTER_LABELS[param]?.[value] || value;
      activeFilters.push({ param, value, label });
    });
  });

  if (activeFilters.length === 0) {
    return null;
  }

  // Remove a single filter
  const removeFilter = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(param)?.split(',').filter(Boolean) || [];
    const updated = current.filter(v => v !== value);
    
    if (updated.length > 0) {
      params.set(param, updated.join(','));
    } else {
      params.delete(param);
    }
    
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const clearAll = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={styles.container}>
      <div className={styles.pills}>
        {activeFilters.map(filter => (
          <button
            key={`${filter.param}-${filter.value}`}
            className={styles.pill}
            onClick={() => removeFilter(filter.param, filter.value)}
            aria-label={`Remove ${filter.label} filter`}
          >
            <span className={styles.label}>{filter.label}</span>
            <span className={styles.remove}>×</span>
          </button>
        ))}
      </div>
      <button className={styles.clearAll} onClick={clearAll}>
        Clear all
      </button>
    </div>
  );
}
