'use client';

import { useState, useEffect } from 'react';

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  tier: number;
  brandName?: string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface MaterialSuggestion {
  name: string;
  slug: string;
  productCount: number;
}

export interface SearchSuggestions {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  materials: MaterialSuggestion[];
  query: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Hook for fetching search suggestions with debouncing.
 * @param query - Search query string
 * @param debounceMs - Debounce delay in milliseconds (default: 200)
 * @param minLength - Minimum query length to trigger search (default: 2)
 */
export function useSearchSuggestions(
  query: string,
  debounceMs: number = 200,
  minLength: number = 2
) {
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Clear suggestions if query is too short
    if (!query || query.length < minLength) {
      setSuggestions(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    
    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(
          `${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}`,
          { 
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Handle both wrapped and unwrapped responses
        const suggestionsData = data.data || data;
        
        setSuggestions({
          products: suggestionsData.products || [],
          categories: suggestionsData.categories || [],
          materials: suggestionsData.materials || [],
          query: suggestionsData.query || query,
        });
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Search suggestions error:', err);
        setError(err instanceof Error ? err : new Error('Search failed'));
        setSuggestions(null);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query, debounceMs, minLength]);

  return { suggestions, isLoading, error };
}
