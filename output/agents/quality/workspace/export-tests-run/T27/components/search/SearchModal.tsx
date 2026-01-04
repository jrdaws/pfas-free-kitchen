"use client";

import { useState, useEffect, Fragment } from "react";
import { InstantSearch } from "react-instantsearch";
import { searchClient, indexName } from "@/lib/search/algolia";
import { SearchBox } from "./SearchBox";
import { SearchResults } from "./SearchResults";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle handled by parent
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-[10vh]">
        <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
          <InstantSearch searchClient={searchClient} indexName={indexName}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <SearchBox />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <SearchResults />
            </div>
          </InstantSearch>
          
          <div className="p-2 text-xs text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
            Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}

