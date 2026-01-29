import type { ActivityItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import styles from './ActivityFeed.module.css';

interface ActivityFeedProps {
  items: ActivityItem[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  product_published: '✅',
  product_rejected: '❌',
  evidence_uploaded: '📄',
  report_resolved: '🚩',
  review_completed: '✓',
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className={styles.feed}>
      <h3 className={styles.title}>Recent Activity</h3>
      
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.icon}>
              {ACTIVITY_ICONS[item.type] || '•'}
            </span>
            <div className={styles.content}>
              <p className={styles.description}>
                <strong>{item.actorName}</strong> {item.description}
              </p>
              <p className={styles.time}>
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
