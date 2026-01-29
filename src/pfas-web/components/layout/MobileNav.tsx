'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSwipe } from '@/hooks/useSwipe';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: {
    label: string;
    href: string;
    count?: number;
  }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Cookware',
    icon: '🍳',
    children: [
      { label: 'All Cookware', href: '/cookware', count: 45 },
      { label: 'Skillets & Pans', href: '/cookware/skillets', count: 18 },
      { label: 'Saucepans', href: '/cookware/saucepans', count: 12 },
      { label: 'Dutch Ovens', href: '/cookware/dutch-ovens', count: 8 },
      { label: 'Stock Pots', href: '/cookware/stock-pots', count: 7 },
    ],
  },
  {
    label: 'Bakeware',
    icon: '🥧',
    children: [
      { label: 'All Bakeware', href: '/bakeware', count: 28 },
      { label: 'Sheet Pans', href: '/bakeware/sheet-pans', count: 10 },
      { label: 'Baking Dishes', href: '/bakeware/dishes', count: 8 },
      { label: 'Muffin Tins', href: '/bakeware/muffin-tins', count: 6 },
    ],
  },
  {
    label: 'Storage',
    icon: '📦',
    children: [
      { label: 'All Storage', href: '/storage', count: 32 },
      { label: 'Containers', href: '/storage/containers', count: 18 },
      { label: 'Food Wraps', href: '/storage/wraps', count: 8 },
      { label: 'Bags', href: '/storage/bags', count: 6 },
    ],
  },
  {
    label: 'Utensils',
    icon: '🥄',
    children: [
      { label: 'All Utensils', href: '/utensils', count: 18 },
      { label: 'Spatulas', href: '/utensils/spatulas', count: 8 },
      { label: 'Spoons', href: '/utensils/spoons', count: 6 },
    ],
  },
  {
    label: 'Appliances',
    icon: '⚙️',
    children: [
      { label: 'All Appliances', href: '/appliances', count: 12 },
      { label: 'Blenders', href: '/appliances/blenders', count: 4 },
      { label: 'Air Fryers', href: '/appliances/air-fryers', count: 5 },
    ],
  },
];

const QUICK_LINKS = [
  { label: 'Highest Verified', href: '/cookware?tier=3,4', icon: '⭐' },
  { label: 'New Arrivals', href: '/new', icon: '🆕' },
];

const INFO_LINKS = [
  { label: 'What is PFAS?', href: '/education/what-is-pfas', icon: '📖' },
  { label: 'How We Verify', href: '/education/how-we-verify', icon: '🔬' },
  { label: 'About Us', href: '/about', icon: '📋' },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [activeCategory, setActiveCategory] = useState<NavItem | null>(null);
  const [historyStack, setHistoryStack] = useState<NavItem[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setActiveCategory(null);
      setHistoryStack([]);
    }
  }, [isOpen]);

  // Swipe to close
  useSwipe(navRef, {
    onSwipeRight: onClose,
    threshold: 50,
  });

  const handleCategoryClick = (item: NavItem) => {
    if (item.children) {
      setHistoryStack([...historyStack, item]);
      setActiveCategory(item);
    }
  };

  const handleBack = useCallback(() => {
    const newStack = [...historyStack];
    newStack.pop();
    setHistoryStack(newStack);
    setActiveCategory(newStack[newStack.length - 1] || null);
  }, [historyStack]);

  const handleLinkClick = () => {
    onClose();
  };

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav 
        ref={navRef}
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className={styles.header}>
          {activeCategory ? (
            <button 
              onClick={handleBack} 
              className={styles.backButton}
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {activeCategory.label}
            </button>
          ) : (
            <>
              <button 
                onClick={onClose} 
                className={styles.closeButton}
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className={styles.title}>PFAS-Free Kitchen</span>
            </>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeCategory ? (
            // Sub-navigation view
            <div className={styles.subNav}>
              {activeCategory.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={styles.subNavItem}
                  onClick={handleLinkClick}
                >
                  <span>{child.label}</span>
                  {child.count && (
                    <span className={styles.count}>{child.count} items</span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            // Main navigation view
            <>
              {/* Categories */}
              <div className={styles.section}>
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    className={styles.navItem}
                    onClick={() => handleCategoryClick(item)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className={styles.divider} />

              {/* Quick links */}
              <div className={styles.section}>
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.navItem}
                    onClick={handleLinkClick}
                  >
                    <span className={styles.navIcon}>{link.icon}</span>
                    <span className={styles.navLabel}>{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className={styles.divider} />

              {/* Info links */}
              <div className={styles.section}>
                {INFO_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.navItem}
                    onClick={handleLinkClick}
                  >
                    <span className={styles.navIcon}>{link.icon}</span>
                    <span className={styles.navLabel}>{link.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default MobileNav;
