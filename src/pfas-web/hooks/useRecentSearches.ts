'use client';

import { useState, useEffect, useCallback } from 'react';

const MAX_RECENT = 5;
const STORAGE_KEY = 'pfas-recent-searches';

/**
 * Hook for managing recent searches in localStorage.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecent(parsed.slice(0, MAX_RECENT));
        }
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
    setIsLoaded(true);
  }, []);

  /**
   * Add a search query to recent searches.
   * Moves to front if already exists, trims to MAX_RECENT.
   */
  const addSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setRecent((prev) => {
      // Remove if already exists (to move to front)
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== trimmedQuery.toLowerCase()
      );
      // Add to front and limit
      const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT);
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent searches:', error);
      }
      
      return updated;
    });
  }, []);

  /**
   * Remove a specific search from recent searches.
   */
  const removeSearch = useCallback((query: string) => {
    setRecent((prev) => {
      const updated = prev.filter(
        (s) => s.toLowerCase() !== query.toLowerCase()
      );
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent searches:', error);
      }
      
      return updated;
    });
  }, []);

  /**
   * Clear all recent searches.
   */
  const clearRecent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
    setRecent([]);
  }, []);

  return { 
    recent, 
    addSearch, 
    removeSearch, 
    clearRecent,
    isLoaded,
  };
}
