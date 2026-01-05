"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ListingGalleryProps {
  images: string[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-slate-800 rounded-xl flex items-center justify-center">
        <span className="text-slate-500">No images</span>
      </div>
    );
  }

  const goTo = (index: number) => {
    setActiveIndex((images.length + index) % images.length);
  };

  return (
    <>
      {/* Main Image */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-slate-800 rounded-xl overflow-hidden group">
          <Image
            src={images[activeIndex]}
            alt={`${title} - Image ${activeIndex + 1}`}
            fill
            className="object-contain"
            priority
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Button */}
          <button
            onClick={() => setShowLightbox(true)}
            className="absolute bottom-2 right-2 p-2 bg-slate-900/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Zoom image"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-white text-xs">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeIndex
                    ? "border-orange-500"
                    : "border-transparent hover:border-slate-500"
                }`}
              >
                <Image
                  src={img}
                  alt={`${title} - Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
            onClick={() => setShowLightbox(false)}
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex - 1);
                }}
                className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex + 1);
                }}
                className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
            <Image
              src={images[activeIndex]}
              alt={`${title} - Full size ${activeIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Thumbnails in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === activeIndex ? "bg-orange-500" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default ListingGallery;

