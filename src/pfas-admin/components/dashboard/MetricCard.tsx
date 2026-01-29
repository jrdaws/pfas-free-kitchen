import Link from 'next/link';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  target?: string;
  link?: string;
}

export function MetricCard({ title, value, change, subtitle, target, link }: MetricCardProps) {
  const content = (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      
      {change !== undefined && (
        <p className={`${styles.change} ${change >= 0 ? styles.positive : styles.negative}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)} today
        </p>
      )}
      
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      
      {target && (
        <p className={styles.target}>
          Target: {target}
        </p>
      )}
    </div>
  );

  if (link) {
    return (
      <Link href={link} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
}
