'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';

const STORAGE_KEY = 'pfas-compare-items';
const MAX_ITEMS = 4;

interface CompareContextValue {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
  canAdd: boolean;
  maxItems: number;
  itemCount: number;
}

const CompareContext = createContext<CompareContextValue | null>(null);

interface CompareProviderProps {
  children: ReactNode;
}

export function CompareProvider({ children }: CompareProviderProps) {
  const [items, setItems] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed.slice(0, MAX_ITEMS));
        }
      }
    } catch (e) {
      console.error('Failed to load compare items from storage:', e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save compare items to storage:', e);
      }
    }
  }, [items, isInitialized]);

  const addItem = useCallback((id: string) => {
    setItems(prev => {
      if (prev.includes(id) || prev.length >= MAX_ITEMS) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= MAX_ITEMS) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const isInCompare = useCallback((id: string) => {
    return items.includes(id);
  }, [items]);

  const value = useMemo<CompareContextValue>(() => ({
    items,
    addItem,
    removeItem,
    toggleItem,
    clearAll,
    isInCompare,
    canAdd: items.length < MAX_ITEMS,
    maxItems: MAX_ITEMS,
    itemCount: items.length,
  }), [items, addItem, removeItem, toggleItem, clearAll, isInCompare]);

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

export { CompareContext };
