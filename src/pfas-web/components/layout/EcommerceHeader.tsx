'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
              <Image 
                src="/logo.png" 
                alt="PFAS-Free Kitchen" 
                width={44} 
                height={44} 
                className={styles.logoImage}
                priority
              />
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
