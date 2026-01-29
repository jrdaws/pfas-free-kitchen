'use client';

import { useEffect, useRef, type RefObject } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScrollOnSwipe?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
}

export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  options: UseSwipeOptions
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventScrollOnSwipe = false,
  } = options;

  const swipeState = useRef<SwipeState | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      swipeState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeState.current || !preventScrollOnSwipe) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - swipeState.current.startX;
      const diffY = touch.clientY - swipeState.current.startY;

      // If horizontal swipe is dominant, prevent vertical scroll
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!swipeState.current) return;

      const touch = e.changedTouches[0];
      const diffX = touch.clientX - swipeState.current.startX;
      const diffY = touch.clientY - swipeState.current.startY;
      const timeDiff = Date.now() - swipeState.current.startTime;

      // Reset state
      swipeState.current = null;

      // Only trigger if swipe was fast enough (< 300ms) or traveled far enough
      const minDistance = threshold;
      const maxTime = 300;

      // Calculate swipe velocity
      const velocity = Math.sqrt(diffX * diffX + diffY * diffY) / timeDiff;
      const isFastSwipe = velocity > 0.5;

      // Check horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if ((Math.abs(diffX) > minDistance || isFastSwipe) && timeDiff < maxTime) {
          if (diffX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (diffX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      }
      // Check vertical swipe
      else {
        if ((Math.abs(diffY) > minDistance || isFastSwipe) && timeDiff < maxTime) {
          if (diffY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (diffY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScrollOnSwipe });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventScrollOnSwipe]);
}

export default useSwipe;
