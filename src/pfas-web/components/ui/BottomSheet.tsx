'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentages: [0.5, 0.9] means 50% and 90%
  onDone?: () => void;
  onReset?: () => void;
  showDone?: boolean;
  showReset?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  onDone,
  onReset,
  showDone = true,
  showReset = false,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentSnap, setCurrentSnap] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef(0);
  const currentTranslateY = useRef(0);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentSnap(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getSnapHeight = (snapIndex: number) => {
    if (snapIndex < 0 || snapIndex >= snapPoints.length) return 0;
    return window.innerHeight * snapPoints[snapIndex];
  };

  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    currentTranslateY.current = 0;
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    
    const diff = clientY - dragStartY.current;
    // Only allow dragging down (positive diff)
    if (diff > 0) {
      currentTranslateY.current = diff;
      setDragOffset(diff);
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const diff = currentTranslateY.current;
    
    // If dragged more than 100px down, close or snap to lower point
    if (diff > 100) {
      if (currentSnap > 0) {
        setCurrentSnap(currentSnap - 1);
      } else {
        onClose();
      }
    }
    // If dragged up significantly, snap to higher point
    else if (diff < -50 && currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1);
    }
    
    setDragOffset(0);
    currentTranslateY.current = 0;
  }, [isDragging, currentSnap, snapPoints.length, onClose]);

  // Touch handlers for drag handle
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse handlers for drag handle (for testing on desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleDone = () => {
    onDone?.();
    onClose();
  };

  const sheetHeight = isOpen ? getSnapHeight(currentSnap) : 0;
  const translateY = isDragging ? dragOffset : 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div 
        ref={sheetRef}
        className={`${styles.sheet} ${isOpen ? styles.open : ''}`}
        style={{
          height: sheetHeight,
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Drag handle */}
        <div 
          className={styles.dragHandle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className={styles.dragIndicator} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <div className={styles.headerActions}>
            {showReset && (
              <button onClick={onReset} className={styles.resetButton}>
                Reset
              </button>
            )}
            {showDone && (
              <button onClick={handleDone} className={styles.doneButton}>
                Done
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
}

export default BottomSheet;
