import type { Product, ProductComponent } from '@/lib/types';
import { Tooltip } from '../../ui/Tooltip';
import styles from './tabs.module.css';

interface ComponentsTabProps {
  product: Product;
}

export function ComponentsTab({ product }: ComponentsTabProps) {
  const components = product.components || [];

  // Separate food-contact and non-food-contact components
  const foodContactComponents = components.filter(c => 
    c.role === 'cooking_surface' || c.role === 'body' || c.role === 'lid' || c.role === 'rim'
  );
  const nonFoodContactComponents = components.filter(c => 
    c.role === 'handle' || c.role === 'other'
  );

  return (
    <div className={styles.tab}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Component Analysis</h3>
        <p className={styles.intro}>
          We analyze each component of the product that may contact food. 
          <Tooltip content="Food-contact components are parts of the product that touch food during normal use, such as cooking surfaces, lids, and rims.">
            <button className={styles.infoButton} aria-label="What is food contact?">
              ⓘ
            </button>
          </Tooltip>
        </p>
      </section>

      {/* Food Contact Components */}
      {foodContactComponents.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.subsectionTitle}>Food-Contact Components</h4>
          <div className={styles.componentGrid}>
            {foodContactComponents.map((component) => (
              <ComponentCard 
                key={component.id} 
                component={component} 
                isFoodContact={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Non-Food Contact Components */}
      {nonFoodContactComponents.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.subsectionTitle}>Non-Food-Contact Components</h4>
          <div className={styles.componentGrid}>
            {nonFoodContactComponents.map((component) => (
              <ComponentCard 
                key={component.id} 
                component={component} 
                isFoodContact={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {components.length === 0 && (
        <div className={styles.emptyState}>
          <p>Component analysis is not yet available for this product.</p>
        </div>
      )}
    </div>
  );
}

interface ComponentCardProps {
  component: ProductComponent;
  isFoodContact: boolean;
}

function ComponentCard({ component, isFoodContact }: ComponentCardProps) {
  const statusConfig = getStatusConfig(component.pfasStatus);

  return (
    <div className={`${styles.componentCard} ${isFoodContact ? styles.foodContact : styles.nonFoodContact}`}>
      <div className={styles.componentHeader}>
        <h5 className={styles.componentName}>{component.roleLabel}</h5>
        <span className={`${styles.contactBadge} ${isFoodContact ? styles.contactYes : styles.contactNo}`}>
          {isFoodContact ? 'FOOD CONTACT' : 'NON-FOOD CONTACT'}
        </span>
      </div>

      <dl className={styles.componentDetails}>
        <div className={styles.detailRow}>
          <dt>Material</dt>
          <dd>{component.material?.name || 'Not specified'}</dd>
        </div>
        <div className={styles.detailRow}>
          <dt>Coating</dt>
          <dd>{component.coating?.name || 'None'}</dd>
        </div>
        <div className={styles.detailRow}>
          <dt>PFAS Status</dt>
          <dd className={styles.statusCell}>
            <span className={`${styles.statusIcon} ${styles[statusConfig.className]}`}>
              {statusConfig.icon}
            </span>
            <span>{statusConfig.label}</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function getStatusConfig(status: ProductComponent['pfasStatus']) {
  const configs = {
    verified_free: {
      icon: '✓',
      label: 'Below detection limit (verified)',
      className: 'statusVerified',
    },
    claimed_free: {
      icon: '✓',
      label: 'Claimed PFAS-free',
      className: 'statusClaimed',
    },
    unknown: {
      icon: '?',
      label: 'Not tested',
      className: 'statusUnknown',
    },
    contains_pfas: {
      icon: '✗',
      label: 'Contains PFAS',
      className: 'statusContains',
    },
  };

  return configs[status] || configs.unknown;
}
