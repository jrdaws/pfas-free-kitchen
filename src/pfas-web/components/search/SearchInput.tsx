'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { SearchSuggestions } from './SearchSuggestions';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showShortcut?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchInput({
  defaultValue = '',
  placeholder = 'Search verified cookware, bakeware, storage...',
  autoFocus = false,
  size = 'md',
  showShortcut = true,
  onSearch,
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { suggestions, isLoading } = useSearchSuggestions(query);
  const { recent, addSearch, removeSearch, clearRecent } = useRecentSearches();

  // Calculate total items for keyboard navigation
  const getTotalItems = useCallback(() => {
    if (!query) {
      return recent.length + 4; // recent + 4 popular
    }
    if (!suggestions) return 0;
    return (
      suggestions.products.length +
      suggestions.categories.length +
      suggestions.materials.length +
      1 // "search all" option
    );
  }, [query, suggestions, recent.length]);

  // Global keyboard shortcut (⌘K or /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // / key (when not in an input)
      if (e.key === '/' && !isInputElement(e.target)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = useCallback((searchQuery: string, type?: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    addSearch(trimmed);
    setIsOpen(false);
    setHighlightIndex(-1);
    setQuery('');

    if (onSearch) {
      onSearch(trimmed);
    } else {
      // Navigate based on type
      if (type === 'product') {
        // Product links handle their own navigation
        return;
      } else if (type === 'category') {
        router.push(`/search?category=${encodeURIComponent(trimmed)}`);
      } else if (type === 'material') {
        router.push(`/search?material=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }
  }, [addSearch, onSearch, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = getTotalItems();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0) {
          // Select highlighted item
          selectHighlightedItem();
        } else if (query.trim()) {
          // Search with current query
          handleSearch(query);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        // Allow natural tab behavior but close dropdown
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  }, [getTotalItems, highlightIndex, query, handleSearch]);

  const selectHighlightedItem = useCallback(() => {
    if (!query) {
      // Empty state - recent + popular
      const allItems = [...recent, 'cast iron', 'ceramic cookware', 'food storage', 'baking sheets'];
      if (highlightIndex >= 0 && highlightIndex < allItems.length) {
        handleSearch(allItems[highlightIndex]);
      }
      return;
    }

    if (!suggestions) return;

    let currentIndex = 0;

    // Products
    for (const product of suggestions.products) {
      if (currentIndex === highlightIndex) {
        router.push(`/product/${product.slug}`);
        addSearch(product.name);
        setIsOpen(false);
        return;
      }
      currentIndex++;
    }

    // Categories
    for (const category of suggestions.categories) {
      if (currentIndex === highlightIndex) {
        router.push(`/search?category=${category.slug}`);
        addSearch(category.name);
        setIsOpen(false);
        return;
      }
      currentIndex++;
    }

    // Materials
    for (const material of suggestions.materials) {
      if (currentIndex === highlightIndex) {
        router.push(`/search?material=${material.slug}`);
        addSearch(material.name);
        setIsOpen(false);
        return;
      }
      currentIndex++;
    }

    // Search all
    if (currentIndex === highlightIndex) {
      handleSearch(query);
    }
  }, [query, suggestions, highlightIndex, router, addSearch, handleSearch, recent]);

  const handleClear = () => {
    setQuery('');
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div 
      ref={wrapperRef} 
      className={`${styles.wrapper} ${styles[size]}`}
    >
      <div className={`${styles.inputContainer} ${isOpen ? styles.focused : ''}`}>
        {/* Search Icon */}
        <span className={styles.icon} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={highlightIndex >= 0 ? `suggestion-${highlightIndex}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {query && (
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

        {/* Keyboard Shortcut */}
        {showShortcut && !query && (
          <kbd className={styles.shortcut}>⌘K</kbd>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <span className={styles.loadingIndicator} aria-hidden="true">
            <span className={styles.spinner} />
          </span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <SearchSuggestions
          query={query}
          suggestions={suggestions}
          recent={recent}
          isLoading={isLoading}
          highlightIndex={highlightIndex}
          onSelect={handleSearch}
          onClearRecent={clearRecent}
          onRemoveRecent={removeSearch}
        />
      )}
    </div>
  );
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target) return false;
  const tagName = (target as HTMLElement).tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || (target as HTMLElement).isContentEditable;
}
