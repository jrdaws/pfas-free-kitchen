/**
 * Algolia Search Client
 */

import algoliasearch from "algoliasearch/lite";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "main";

if (!appId || !searchKey) {
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

export const searchClient = algoliasearch(appId || "", searchKey || "");
export const searchIndex = searchClient.initIndex(indexName);

export { indexName };

