'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import styles from './HeroSection.module.css';

interface StatItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const STATS: StatItem[] = [
  {
    value: '150+',
    label: 'Products Reviewed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    value: '85+',
    label: 'Tier 3-4 Verified',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    value: 'Zero',
    label: 'Sponsored Rankings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    value: '40+',
    label: 'Lab Tests On File',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.548.091a9.02 9.02 0 01-2.934 0l-.548-.091c-1.717-.293-2.299-2.379-1.067-3.61L16.2 15.3" />
      </svg>
    ),
  },
];

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className={styles.hero}>
      {/* Background pattern */}
      <div className={styles.background}>
        <div className={styles.pattern} />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        {/* Main heading */}
        <div className={styles.heading}>
          <h1 className={styles.title}>
            Find Kitchen Products <span className={styles.highlight}>You Can Trust</span>
          </h1>
          <p className={styles.subtitle}>
            Every product independently verified for PFAS.
            <br />
            No sponsored rankings. No paid placements.
          </p>
        </div>

        {/* Search bar */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchWrapper}>
            <svg 
              className={styles.searchIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search verified cookware, bakeware, storage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className={styles.searchButton}>
              Search
            </button>
          </div>
        </form>

        {/* CTA buttons */}
        <div className={styles.actions}>
          <Link href="/cookware" className={styles.primaryButton}>
            Browse All Products
          </Link>
          <Link href="/education/how-we-verify" className={styles.secondaryButton}>
            How We Verify
          </Link>
        </div>

        {/* Stats row */}
        <div className={styles.stats}>
          {STATS.map((stat, index) => (
            <div key={index} className={styles.stat}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
