'use client';

import { useEffect } from 'react';
import { addToRecentlyViewed } from '@/components/home/RecentlyViewed';

interface TrackRecentlyViewedProps {
  product: {
    id: string;
    slug: string;
    name: string;
    brandName?: string;
    imageUrl?: string;
    tier?: number;
  };
}

/**
 * Client component that tracks product views in localStorage
 * Add this to product detail pages to enable "Recently Viewed" functionality
 */
export function TrackRecentlyViewed({ product }: TrackRecentlyViewedProps) {
  useEffect(() => {
    // Small delay to ensure page has loaded
    const timer = setTimeout(() => {
      addToRecentlyViewed({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brandName: product.brandName || 'Unknown Brand',
        imageUrl: product.imageUrl || '/placeholder-product.svg',
        tier: product.tier ?? 0,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [product]);

  // This component doesn't render anything
  return null;
}

export default TrackRecentlyViewed;
