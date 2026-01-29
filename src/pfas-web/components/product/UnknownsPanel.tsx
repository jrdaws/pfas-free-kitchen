import styles from './UnknownsPanel.module.css';

interface UnknownsPanelProps {
  unknowns: string[];
}

export function UnknownsPanel({ unknowns }: UnknownsPanelProps) {
  if (unknowns.length === 0) {
    return (
      <div className={`${styles.panel} ${styles.complete}`}>
        <span className={styles.icon}>✓</span>
        <div className={styles.content}>
          <p className={styles.title}>All major components verified</p>
          <p className={styles.description}>
            We have verified information about all major food-contact materials in this product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.panel} ${styles.present}`}>
      <span className={styles.icon}>ℹ️</span>
      <div className={styles.content}>
        <p className={styles.title}>Some information is unknown</p>
        <ul className={styles.list}>
          {unknowns.map((unknown, i) => (
            <li key={i}>{unknown}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
