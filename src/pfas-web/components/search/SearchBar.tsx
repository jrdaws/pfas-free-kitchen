'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAutocomplete, type AutocompleteSuggestion } from '@/lib/data';
import styles from './SearchBar.module.css';

const RECENT_SEARCHES_KEY = 'pfas-recent-searches';
const MAX_RECENT_SEARCHES = 5;

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  showRecentSearches?: boolean;
}

// Utility to manage recent searches
function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    let searches = getRecentSearches();
    searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    searches.unshift(query.trim());
    searches = searches.slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (e) {
    console.error('Failed to save recent search:', e);
  }
}

export function SearchBar({ 
  defaultValue = '', 
  placeholder = 'Search PFAS-free products...',
  autoFocus = false,
  showRecentSearches = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Load recent searches on mount
  useEffect(() => {
    if (showRecentSearches) {
      setRecentSearches(getRecentSearches());
    }
  }, [showRecentSearches]);

  // Fetch autocomplete suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchAutocomplete(searchQuery, 6);
      setSuggestions(results);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (query.length >= 2) {
      suggestionTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 200);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    addRecentSearch(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (showRecentSearches && !query ? recentSearches.length : 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const items = query ? suggestions.map(s => s.text) : recentSearches;
      if (items[selectedIndex]) {
        handleSuggestionClick(items[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const showDropdown = showSuggestions && (
    suggestions.length > 0 || 
    (showRecentSearches && !query && recentSearches.length > 0)
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <div className={styles.inputWrapper}>
        <span className={styles.icon} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          autoComplete="off"
        />

        {isLoading && (
          <span className={styles.loader} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
        )}

        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Autocomplete dropdown */}
        {showDropdown && (
          <div 
            id="search-suggestions" 
            className={styles.suggestions}
            role="listbox"
          >
            {/* Recent searches (when no query) */}
            {showRecentSearches && !query && recentSearches.length > 0 && (
              <>
                <div className={styles.suggestionsHeader}>Recent Searches</div>
                {recentSearches.map((search, index) => (
                  <button
                    key={`recent-${index}`}
                    type="button"
                    className={`${styles.suggestionItem} ${selectedIndex === index ? styles.selected : ''}`}
                    onClick={() => handleSuggestionClick(search)}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <svg className={styles.suggestionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{search}</span>
                  </button>
                ))}
              </>
            )}

            {/* Autocomplete suggestions (when typing) */}
            {query && suggestions.length > 0 && (
              <>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    type="button"
                    className={`${styles.suggestionItem} ${selectedIndex === index ? styles.selected : ''}`}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <svg className={styles.suggestionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {suggestion.type === 'product' && <circle cx="11" cy="11" r="8" />}
                      {suggestion.type === 'brand' && <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />}
                      {suggestion.type === 'category' && <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />}
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span>{suggestion.text}</span>
                    <span className={styles.suggestionType}>{suggestion.type}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <button type="submit" className={styles.submitButton}>
        Search
      </button>
    </form>
  );
}
