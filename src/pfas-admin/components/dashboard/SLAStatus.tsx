import styles from './SLAStatus.module.css';

interface SLAStatusProps {
  data: {
    onTrack: number;
    atRisk: number;
    breached: number;
  };
}

export function SLAStatus({ data }: SLAStatusProps) {
  const total = data.onTrack + data.atRisk + data.breached;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Report SLA Status</h3>

      <div className={styles.segments}>
        <div className={styles.segment}>
          <div className={`${styles.indicator} ${styles.success}`} />
          <div className={styles.info}>
            <span className={styles.label}>On Track</span>
            <span className={styles.value}>{data.onTrack}</span>
          </div>
        </div>

        <div className={styles.segment}>
          <div className={`${styles.indicator} ${styles.warning}`} />
          <div className={styles.info}>
            <span className={styles.label}>At Risk</span>
            <span className={styles.value}>{data.atRisk}</span>
          </div>
        </div>

        <div className={styles.segment}>
          <div className={`${styles.indicator} ${styles.error}`} />
          <div className={styles.info}>
            <span className={styles.label}>Breached</span>
            <span className={styles.value}>{data.breached}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.bar}>
        {data.onTrack > 0 && (
          <div
            className={`${styles.barSegment} ${styles.barSuccess}`}
            style={{ width: `${(data.onTrack / total) * 100}%` }}
          />
        )}
        {data.atRisk > 0 && (
          <div
            className={`${styles.barSegment} ${styles.barWarning}`}
            style={{ width: `${(data.atRisk / total) * 100}%` }}
          />
        )}
        {data.breached > 0 && (
          <div
            className={`${styles.barSegment} ${styles.barError}`}
            style={{ width: `${(data.breached / total) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
