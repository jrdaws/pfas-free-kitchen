'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import styles from './Navigation.module.css';

interface NavigationProps {
  className?: string;
  onClick?: () => void;
}

const NAV_ITEMS = [
  { href: '/cookware', label: 'Cookware' },
  { href: '/bakeware', label: 'Bakeware' },
  { href: '/food-storage', label: 'Food Storage' },
  { href: '/education', label: 'Learn' },
];

export function Navigation({ className, onClick }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={clsx(styles.nav, className)}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(styles.link, isActive && styles.active)}
            onClick={onClick}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
