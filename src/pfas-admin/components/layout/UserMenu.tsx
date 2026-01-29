'use client';

import { useState } from 'react';
import type { AdminUser } from '@/lib/types';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  user: AdminUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  const roleLabels: Record<string, string> = {
    reviewer: 'Reviewer',
    senior_reviewer: 'Senior Reviewer',
    admin: 'Admin',
    super_admin: 'Super Admin',
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.avatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            <span>{user.name[0]}</span>
          )}
        </span>
        <span className={styles.info}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.role}>{roleLabels[user.role]}</span>
        </span>
        <span className={styles.chevron}>▼</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.menu} role="menu">
            <div className={styles.menuHeader}>
              <p className={styles.email}>{user.email}</p>
            </div>
            <div className={styles.menuItems}>
              <button className={styles.menuItem} role="menuitem">
                👤 Profile
              </button>
              <button className={styles.menuItem} role="menuitem">
                ⚙️ Settings
              </button>
              <hr className={styles.divider} />
              <button className={styles.menuItem} role="menuitem">
                🚪 Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
