'use client';

import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseHistoryReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
  clear: () => void;
  historyLength: number;
}

/**
 * Hook for managing state with undo/redo history.
 * Useful for preview editing where users can undo their changes.
 *
 * @param initialState - The initial state value
 * @param maxHistory - Maximum number of past states to keep (default: 50)
 * @returns State management functions with undo/redo capability
 */
export function useHistory<T>(
  initialState: T,
  maxHistory: number = 50
): UseHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track if we should skip next change (for external updates)
  const skipNextRef = useRef(false);

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      if (skipNextRef.current) {
        skipNextRef.current = false;
        return;
      }

      setHistory((prev) => {
        const resolvedState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(prev.present)
            : newState;

        // Don't add to history if nothing changed (deep compare)
        if (JSON.stringify(resolvedState) === JSON.stringify(prev.present)) {
          return prev;
        }

        // Limit past history size
        const newPast = [...prev.past, prev.present].slice(-maxHistory);

        return {
          past: newPast,
          present: resolvedState,
          future: [], // Clear future on new change
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const [newPresent, ...newFuture] = prev.future;

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  const clear = useCallback(() => {
    setHistory((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
    clear,
    historyLength: history.past.length + history.future.length + 1,
  };
}

