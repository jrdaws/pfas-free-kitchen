'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import styles from './AdminSidebar.module.css';

const NAV_ITEMS = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/queue', icon: '📋', label: 'Review Queue' },
  { href: '/reports', icon: '🚩', label: 'Reports' },
  { href: '/evidence', icon: '📄', label: 'Evidence' },
  { href: '/catalog/products', icon: '🍳', label: 'Products' },
  { href: '/catalog/brands', icon: '🏷️', label: 'Brands' },
  { href: '/analytics', icon: '📈', label: 'Analytics' },
  { href: '/audit', icon: '📜', label: 'Audit Log' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🍳</span>
        <span className={styles.logoText}>Admin</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.navItem, isActive && styles.active)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Keyboard shortcuts hint */}
      <div className={styles.shortcuts}>
        <p>Keyboard shortcuts</p>
        <ul>
          <li><kbd>g</kbd> <kbd>d</kbd> Dashboard</li>
          <li><kbd>g</kbd> <kbd>q</kbd> Queue</li>
          <li><kbd>?</kbd> All shortcuts</li>
        </ul>
      </div>
    </aside>
  );
}
