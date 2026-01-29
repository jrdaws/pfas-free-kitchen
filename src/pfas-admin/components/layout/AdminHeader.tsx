'use client';

import type { AdminUser } from '@/lib/types';
import { UserMenu } from './UserMenu';
import styles from './AdminHeader.module.css';

interface AdminHeaderProps {
  user: AdminUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.search}>
        <input
          type="search"
          placeholder="Search products, brands, reports..."
          className={styles.searchInput}
        />
        <span className={styles.searchShortcut}>
          <kbd>⌘</kbd><kbd>K</kbd>
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton} title="Notifications">
          🔔
          <span className={styles.notificationBadge}>3</span>
        </button>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
