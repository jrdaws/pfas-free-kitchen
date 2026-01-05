/**
 * Algolia Search Client with Lazy Initialization
 * 
 * Gracefully handles missing configuration - returns mock client
 * that won't throw errors when Algolia isn't configured.
 */

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "main";

// Check if Algolia is properly configured
const isAlgoliaConfigured = 
  appId && 
  searchKey && 
  !appId.includes("placeholder") && 
  !searchKey.includes("placeholder");

// Warn in development if not configured
if (!isAlgoliaConfigured && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.warn(`
⚠️  Algolia configuration missing

Required environment variables:
  NEXT_PUBLIC_ALGOLIA_APP_ID
  NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
  NEXT_PUBLIC_ALGOLIA_INDEX_NAME
  ALGOLIA_ADMIN_KEY (for indexing)

Get these from: https://www.algolia.com/dashboard
Add to: .env.local
  `);
}

// Create a mock search client for when Algolia isn't configured
const mockSearchClient = {
  search: async () => ({ results: [{ hits: [], nbHits: 0, page: 0, nbPages: 0 }] }),
  searchForFacetValues: async () => ({ facetHits: [] }),
  initIndex: () => ({
    search: async () => ({ hits: [], nbHits: 0, page: 0, nbPages: 0 }),
    getObject: async () => null,
    saveObject: async () => ({}),
    deleteObject: async () => ({}),
  }),
};

// Lazy load Algolia client
let algoliaClient: ReturnType<typeof import("algoliasearch/lite").default> | null = null;

export function getSearchClient() {
  if (!isAlgoliaConfigured) {
    return mockSearchClient as any;
  }
  
  if (!algoliaClient) {
    // Dynamic require to avoid initialization errors
    const algoliasearch = require("algoliasearch/lite").default;
    algoliaClient = algoliasearch(appId!, searchKey!);
  }
  
  return algoliaClient;
}

// Legacy exports for backward compatibility
export const searchClient = isAlgoliaConfigured 
  ? (() => {
      const algoliasearch = require("algoliasearch/lite").default;
      return algoliasearch(appId!, searchKey!);
    })()
  : mockSearchClient as any;

export const searchIndex = searchClient.initIndex(indexName);

export { indexName, isAlgoliaConfigured };

/**
 * Search function with error handling
 */
export async function search<T = any>(
  query: string, 
  options?: { hitsPerPage?: number; page?: number; filters?: string }
): Promise<{ hits: T[]; nbHits: number; page: number; nbPages: number }> {
  if (!isAlgoliaConfigured) {
    return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
  }

  try {
    const client = getSearchClient();
    const index = client.initIndex(indexName);
    const results = await index.search<T>(query, {
      hitsPerPage: options?.hitsPerPage || 10,
      page: options?.page || 0,
      filters: options?.filters,
    });
    return results;
  } catch (error) {
    console.error("[Algolia] Search error:", error);
    return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
  }
}
