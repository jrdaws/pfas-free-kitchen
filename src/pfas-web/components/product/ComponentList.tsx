import type { ProductComponent } from '@/lib/types';
import styles from './ComponentList.module.css';

interface ComponentListProps {
  components: ProductComponent[];
}

const STATUS_CONFIG = {
  verified_free: {
    label: 'Verified PFAS-Free',
    icon: '✓',
    className: 'verified',
  },
  claimed_free: {
    label: 'Claimed PFAS-Free',
    icon: '○',
    className: 'claimed',
  },
  unknown: {
    label: 'Unknown',
    icon: '?',
    className: 'unknown',
  },
  contains_pfas: {
    label: 'Contains PFAS',
    icon: '✗',
    className: 'contains',
  },
};

export function ComponentList({ components }: ComponentListProps) {
  if (components.length === 0) {
    return (
      <p className={styles.empty}>No component information available.</p>
    );
  }

  // Sort: cooking surface first, then by role
  const sorted = [...components].sort((a, b) => {
    if (a.role === 'cooking_surface') return -1;
    if (b.role === 'cooking_surface') return 1;
    return a.roleLabel.localeCompare(b.roleLabel);
  });

  return (
    <div className={styles.list}>
      {sorted.map((component) => {
        const status = STATUS_CONFIG[component.pfasStatus];
        
        return (
          <div key={component.id} className={styles.item}>
            <div className={styles.header}>
              <span className={styles.role}>{component.roleLabel}</span>
              <span className={`${styles.status} ${styles[status.className]}`}>
                <span className={styles.statusIcon}>{status.icon}</span>
                {status.label}
              </span>
            </div>
            
            <div className={styles.details}>
              {component.material && (
                <span className={styles.detail}>
                  <span className={styles.detailLabel}>Material:</span>
                  {component.material.name}
                </span>
              )}
              {component.coating && (
                <span className={styles.detail}>
                  <span className={styles.detailLabel}>Coating:</span>
                  {component.coating.name}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
