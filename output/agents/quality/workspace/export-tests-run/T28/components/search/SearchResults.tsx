"use client";

import { useHits, UseHitsProps } from "react-instantsearch";

interface Hit {
  objectID: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export function SearchResults(props: UseHitsProps<Hit>) {
  const { hits } = useHits(props);

  if (hits.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No results found. Try a different search term.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {hits.map((hit) => (
        <li key={hit.objectID} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {hit.title || hit.objectID}
          </h3>
          {hit.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {hit.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

