/**
 * Full-Text Search Module
 * 
 * Provides search functionality across content.
 * Can be backed by Supabase full-text search, Algolia, or other providers.
 */

import { createClient } from "@/lib/supabase";

export interface SearchResult<T = unknown> {
  id: string;
  score: number;
  highlights?: string[];
  data: T;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
  orderBy?: string;
}

/**
 * Search across a table using Supabase full-text search
 */
export async function search<T>(
  table: string,
  query: string,
  searchColumn: string,
  options: SearchOptions = {}
): Promise<{ results: SearchResult<T>[]; total: number }> {
  const supabase = createClient();
  const { limit = 20, offset = 0, filters = {} } = options;

  if (!query.trim()) {
    return { results: [], total: 0 };
  }

  // Build the query with full-text search
  let dbQuery = supabase
    .from(table)
    .select("*", { count: "exact" })
    .textSearch(searchColumn, query, {
      type: "websearch",
      config: "english",
    })
    .range(offset, offset + limit - 1);

  // Apply additional filters
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      dbQuery = dbQuery.eq(key, value);
    }
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error("Search error:", error);
    return { results: [], total: 0 };
  }

  const results: SearchResult<T>[] = (data || []).map((item, index) => ({
    id: item.id,
    score: 1 - index * 0.01, // Simple score based on order
    data: item as T,
  }));

  return {
    results,
    total: count || results.length,
  };
}

/**
 * Simple in-memory search for client-side filtering
 */
export function clientSearch<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(normalizedQuery);
      }
      if (typeof value === "number") {
        return value.toString().includes(normalizedQuery);
      }
      return false;
    })
  );
}

/**
 * Highlight search terms in text
 */
export function highlightMatches(
  text: string,
  query: string,
  highlightClass = "bg-yellow-200 dark:bg-yellow-800"
): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generate search suggestions based on history
 */
export function getSearchSuggestions(
  query: string,
  history: string[],
  limit = 5
): string[] {
  if (!query.trim()) {
    return history.slice(0, limit);
  }

  const normalizedQuery = query.toLowerCase();
  return history
    .filter((h) => h.toLowerCase().includes(normalizedQuery))
    .slice(0, limit);
}

