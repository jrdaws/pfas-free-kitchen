'use client';

import styles from './TierChart.module.css';

interface TierChartProps {
  data: Array<{ tier: number; count: number }>;
}

const TIER_LABELS = ['Unknown', 'Brand Statement', 'Policy Reviewed', 'Lab Tested', 'Monitored'];
const TIER_COLORS = ['#6b7280', '#b45309', '#64748b', '#ca8a04', '#0891b2'];

export function TierChart({ data }: TierChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className={styles.chart}>
      <h3 className={styles.title}>Tier Distribution</h3>
      
      <div className={styles.bars}>
        {data.map((d, i) => {
          const percentage = (d.count / total) * 100;
          const barWidth = (d.count / maxCount) * 100;

          return (
            <div key={d.tier} className={styles.row}>
              <div className={styles.label}>
                <span className={styles.tierBadge} style={{ background: TIER_COLORS[d.tier] }}>
                  {d.tier}
                </span>
                <span className={styles.tierName}>{TIER_LABELS[d.tier]}</span>
              </div>
              <div className={styles.barWrapper}>
                <div
                  className={styles.bar}
                  style={{
                    width: `${barWidth}%`,
                    background: TIER_COLORS[d.tier],
                  }}
                />
              </div>
              <div className={styles.stats}>
                <span className={styles.count}>{d.count}</span>
                <span className={styles.percent}>{percentage.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className={styles.total}>Total: {total} products</p>
    </div>
  );
}
