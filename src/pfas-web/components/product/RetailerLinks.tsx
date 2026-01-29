'use client';

import { useCallback } from 'react';
import { Button } from '../ui/Button';
import type { RetailerLink } from '@/lib/types';
import styles from './RetailerLinks.module.css';

interface AffiliateLink {
  retailerId: string;
  retailerName: string;
  affiliateUrl: string;
  disclosureRequired: boolean;
}

interface RetailerLinksProps {
  retailers: RetailerLink[];
  productId: string;
  affiliateLinks?: AffiliateLink[];
}

export function RetailerLinks({ retailers, productId, affiliateLinks }: RetailerLinksProps) {
  const handleClick = useCallback(async (retailerId: string, url: string) => {
    // Track affiliate click
    try {
      await fetch('/api/v1/affiliate-clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          retailerId,
          referrerPage: window.location.pathname,
        }),
      });
    } catch (error) {
      // Non-blocking - continue to retailer
      console.error('Failed to track click:', error);
    }
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [productId]);

  const getRetailerUrl = useCallback((retailer: RetailerLink): string => {
    // Check for affiliate link first
    const affiliateLink = affiliateLinks?.find(
      (link) => link.retailerId === retailer.retailer.id
    );
    return affiliateLink?.affiliateUrl || retailer.url;
  }, [affiliateLinks]);

  const getRetailerIcon = (name: string): string => {
    const icons: Record<string, string> = {
      'Amazon': '🛒',
      'Williams Sonoma': '🍳',
      'Sur La Table': '🥘',
      'Target': '🎯',
      'Walmart': '🏪',
      'Bed Bath & Beyond': '🛏️',
      'Crate & Barrel': '📦',
    };
    return icons[name] || '🛍️';
  };

  if (!retailers || retailers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No retailers currently available for this product.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {retailers.map((retailer) => {
          const url = getRetailerUrl(retailer);
          const hasAffiliateLink = affiliateLinks?.some(
            (link) => link.retailerId === retailer.retailer.id
          );

          return (
            <button
              key={retailer.id}
              className={styles.retailerButton}
              onClick={() => handleClick(retailer.retailer.id, url)}
              aria-label={`Shop at ${retailer.retailer.name}${hasAffiliateLink ? ' (affiliate link)' : ''}`}
            >
              <span className={styles.icon} aria-hidden="true">
                {getRetailerIcon(retailer.retailer.name)}
              </span>
              <span className={styles.name}>{retailer.retailer.name}</span>
              {retailer.price && (
                <span className={styles.price}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: retailer.currency || 'USD',
                  }).format(retailer.price)}
                </span>
              )}
              {retailer.inStock === false && (
                <span className={styles.outOfStock}>Out of stock</span>
              )}
              <span className={styles.externalIcon} aria-hidden="true">↗</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
