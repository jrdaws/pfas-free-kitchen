/**
 * Algolia Indexer - Server-side only
 */

import algoliasearch from "algoliasearch";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "main";

function getAdminClient() {
  if (!appId || !adminKey) {
    throw new Error("Algolia admin credentials not configured");
  }
  return algoliasearch(appId, adminKey);
}

export async function indexObject(object: Record<string, unknown> & { objectID: string }) {
  const client = getAdminClient();
  const index = client.initIndex(indexName);
  return index.saveObject(object);
}

export async function indexObjects(objects: Array<Record<string, unknown> & { objectID: string }>) {
  const client = getAdminClient();
  const index = client.initIndex(indexName);
  return index.saveObjects(objects);
}

export async function deleteObject(objectID: string) {
  const client = getAdminClient();
  const index = client.initIndex(indexName);
  return index.deleteObject(objectID);
}

export async function clearIndex() {
  const client = getAdminClient();
  const index = client.initIndex(indexName);
  return index.clearObjects();
}

