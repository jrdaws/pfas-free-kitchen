'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCompare } from '@/contexts/CompareContext';
import { EcommerceSearchBar } from './EcommerceSearchBar';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';
import styles from './EcommerceHeader.module.css';

export function EcommerceHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { itemCount } = useCompare();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Check on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        {/* Top row: Logo, Search, Icons */}
        <div className={styles.topRow}>
          <div className={styles.topRowInner}>
            {/* Hamburger menu (mobile only) */}
            <button 
              className={styles.menuButton}
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileNavOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.1" />
                <path 
                  d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 2c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z" 
                  fill="currentColor" 
                  opacity="0.3"
                />
                <path 
                  d="M16 10a6 6 0 00-6 6c0 1.5.5 2.8 1.4 3.8l.1.1c.1.1.2.2.4.3.2.2.5.4.8.5.5.3 1.1.5 1.7.6.5.1 1 .2 1.6.2s1.1-.1 1.6-.2c.6-.1 1.2-.3 1.7-.6.3-.2.6-.4.8-.5.1-.1.3-.2.4-.3l.1-.1A6 6 0 0016 10z" 
                  fill="currentColor"
                />
                <path 
                  d="M13 14.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5S15.3 16 14.5 16 13 15.3 13 14.5zM16 14.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5S18.3 16 17.5 16 16 15.3 16 14.5z" 
                  fill="var(--color-primary-100)"
                />
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>PFAS-Free</span>
              <span className={styles.logoSub}>Kitchen</span>
            </div>
          </Link>

          {/* Search - desktop */}
          <div className={styles.searchWrapper}>
            <EcommerceSearchBar />
          </div>

          {/* Icons */}
          <div className={styles.actions}>
            {/* Search (mobile only) */}
            <button 
              className={`${styles.actionButton} ${styles.mobileOnly}`}
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search products"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Compare */}
            <Link href="/compare" className={styles.actionButton} aria-label={`Compare products (${itemCount} items)`}>
              <ScaleIcon />
              {itemCount > 0 && (
                <span className={styles.badge}>{itemCount}</span>
              )}
              <span className={styles.actionLabel}>Compare</span>
            </Link>

            {/* Saved/Wishlist */}
            <Link href="/saved" className={styles.actionButton} aria-label="Saved products">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span className={styles.actionLabel}>Saved</span>
            </Link>

            {/* Account */}
            <button className={styles.actionButton} aria-label="Account menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className={styles.actionLabel}>Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation row: Mega Menu (desktop only) */}
      <div className={styles.navRow}>
        <MegaMenu />
      </div>
    </header>

    {/* Mobile Navigation Drawer */}
    <MobileNav 
      isOpen={isMobileNavOpen} 
      onClose={() => setIsMobileNavOpen(false)} 
    />

    {/* Mobile Search Overlay */}
    <MobileSearchOverlay 
      isOpen={isMobileSearchOpen} 
      onClose={() => setIsMobileSearchOpen(false)} 
    />
  </>
  );
}

// Scale icon for compare - more distinctive than arrows
function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2M6 16l3-8 3 8c-1.5.5-4.5.5-6 0zM15 16l3-8 3 8c-1.5.5-4.5.5-6 0z" 
      />
    </svg>
  );
}

export default EcommerceHeader;
