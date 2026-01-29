import styles from './HealthDisclaimer.module.css';

interface HealthDisclaimerProps {
  variant?: 'prominent' | 'inline';
}

export function HealthDisclaimer({ variant = 'prominent' }: HealthDisclaimerProps) {
  return (
    <aside
      className={`${styles.disclaimer} ${variant === 'inline' ? styles.inline : styles.prominent}`}
      role="note"
      aria-label="Health disclaimer"
    >
      <div className={styles.icon} aria-hidden="true">
        <WarningIcon />
      </div>
      <div className={styles.content}>
        <strong className={styles.title}>Health Information Disclaimer</strong>
        <p className={styles.text}>
          The information on this page is for educational purposes only and does not
          constitute medical advice. We are not healthcare professionals. Consult your
          doctor or a qualified healthcare provider for medical advice.
        </p>
        <p className={styles.sources}>
          Health information is based on peer-reviewed research and government sources
          cited on this page.
        </p>
      </div>
    </aside>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.warningIcon}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default HealthDisclaimer;
