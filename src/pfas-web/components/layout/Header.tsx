'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navigation } from './Navigation';
import { SearchBar } from '../search/SearchBar';
import styles from './Header.module.css';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍳</span>
          <span className={styles.logoText}>
            PFAS-Free<span className={styles.logoAccent}>Kitchen</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <Navigation className={styles.desktopNav} />

        {/* Search */}
        <div className={styles.searchWrapper}>
          <SearchBar />
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          <Navigation className={styles.mobileNav} onClick={() => setMobileMenuOpen(false)} />
          <div className={styles.mobileSearch}>
            <SearchBar />
          </div>
        </div>
      )}
    </header>
  );
}
