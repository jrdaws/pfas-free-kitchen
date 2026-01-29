'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Modal } from '../ui/Modal';
import type { ProductImage } from '@/lib/types';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Ensure we have at least one image
  const displayImages = images.length > 0 
    ? images 
    : [{ url: '/placeholder-product.svg', alt: productName }];

  const currentImage = displayImages[selectedIndex];

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  }, []);

  const handleMainImageClick = useCallback(() => {
    setIsLightboxOpen(true);
  }, []);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  }, [displayImages.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      setIsLightboxOpen(false);
    }
  }, [handlePrevious, handleNext]);

  return (
    <div className={styles.gallery} onKeyDown={handleKeyDown}>
      {/* Main Image */}
      <div 
        className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
        onClick={handleMainImageClick}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        role="button"
        tabIndex={0}
        aria-label="Click to view full size"
        onKeyDown={(e) => e.key === 'Enter' && handleMainImageClick()}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className={styles.image}
        />
        <div className={styles.zoomHint}>
          <span aria-hidden="true">🔍</span>
          <span className="sr-only">Click to enlarge</span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className={styles.thumbnails} role="tablist" aria-label="Product images">
          {displayImages.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${index === selectedIndex ? styles.active : ''}`}
              onClick={() => handleThumbnailClick(index)}
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`View image ${index + 1} of ${displayImages.length}`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Modal
        open={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
      >
        <div className={styles.lightboxContent}>
          {/* Navigation */}
          {displayImages.length > 1 && (
            <>
              <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={handleNext}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Full Size Image */}
          <div className={styles.lightboxImageWrapper}>
            <Image
              src={currentImage.url}
              alt={currentImage.alt || productName}
              fill
              sizes="100vw"
              className={styles.lightboxImage}
            />
          </div>

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className={styles.imageCounter}>
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
