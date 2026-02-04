'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import type { RetailerLink } from '@/lib/types';
import { trackClickAPI, type AffiliateLink } from '@/lib/data';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AffiliateDisclosure } from '../layout/AffiliateDisclosure';
import styles from './RetailerButtons.module.css';

interface RetailerButtonsProps {
  retailers: RetailerLink[];
  productId: string;
  affiliateLinks?: AffiliateLink[];
}

export function RetailerButtons({ retailers, productId, affiliateLinks }: RetailerButtonsProps) {
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerLink | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Get affiliate link for a retailer
  const getAffiliateLink = useCallback((retailerId: string): AffiliateLink | undefined => {
    return affiliateLinks?.find(link => link.retailerId === retailerId);
  }, [affiliateLinks]);

  if (retailers.length === 0) {
    return (
      <p className={styles.noRetailers}>
        No retailers currently available for this product.
      </p>
    );
  }

  const handleClick = (retailer: RetailerLink) => {
    setSelectedRetailer(retailer);
  };

  const handleConfirm = async () => {
    if (selectedRetailer) {
      setIsTracking(true);

      try {
        // Track the click via API
        await trackClickAPI({
          productId,
          retailerId: selectedRetailer.retailer.id,
          sessionId: getSessionId(),
          referrerPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
        });
      } catch (error) {
        // Non-critical - continue even if tracking fails
        console.error('Failed to track click:', error);
      }

      // Get affiliate URL or fall back to direct URL
      const affiliateLink = getAffiliateLink(selectedRetailer.retailer.id);
      const targetUrl = affiliateLink?.affiliateUrl || selectedRetailer.url;

      // Open in new tab
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setSelectedRetailer(null);
      setIsTracking(false);
    }
  };

  const selectedAffiliateLink = selectedRetailer 
    ? getAffiliateLink(selectedRetailer.retailer.id) 
    : undefined;

  return (
    <div className={styles.container}>
      <AffiliateDisclosure variant="footer" />
      
      <div className={styles.buttons}>
        {retailers.map((retailer) => {
          const affiliateLink = getAffiliateLink(retailer.retailer.id);
          
          return (
            <button
              key={retailer.id}
              onClick={() => handleClick(retailer)}
              className={styles.retailerButton}
              data-testid="buy-button"
            >
              {retailer.retailer.logoUrl || affiliateLink?.retailerIcon ? (
                <Image
                  src={affiliateLink?.retailerIcon || retailer.retailer.logoUrl || ''}
                  alt={retailer.retailer.name}
                  width={80}
                  height={24}
                  className={styles.logo}
                />
              ) : (
                <span className={styles.name}>
                  {affiliateLink?.retailerName || retailer.retailer.name}
                </span>
              )}
              {retailer.price && (
                <span className={styles.price}>
                  {retailer.currency || '$'}{retailer.price.toFixed(2)}
                </span>
              )}
              <span className={styles.arrow}>→</span>
            </button>
          );
        })}
      </div>

      {/* Click-out Modal */}
      <Modal
        open={!!selectedRetailer}
        onOpenChange={(open) => !open && setSelectedRetailer(null)}
        title="You're leaving PFAS-Free Kitchen"
      >
        {selectedRetailer && (
          <div className={styles.modalContent}>
            <p>
              You&apos;re about to visit <strong>{selectedRetailer.retailer.name}</strong>.
            </p>
            <AffiliateDisclosure 
              variant="modal" 
              text={selectedAffiliateLink?.disclosureText}
            />
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setSelectedRetailer(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={isTracking} data-testid="buy-button-confirm">
                {isTracking ? 'Opening...' : `Continue to ${selectedRetailer.retailer.name}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/**
 * Get or create a session ID for click tracking.
 */
function getSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const key = 'pfas_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}
