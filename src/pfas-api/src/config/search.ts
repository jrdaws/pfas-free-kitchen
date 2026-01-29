/**
 * OpenSearch configuration for PFAS-Free Kitchen Platform API
 */

import { Client } from '@opensearch-project/opensearch';
import { logger } from './logger.js';

// ============================================================
// CONFIGURATION
// ============================================================

export interface SearchConfig {
  node: string;
  username?: string;
  password?: string;
  indexPrefix: string;
}

export const searchConfig: SearchConfig = {
  node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
  username: process.env.OPENSEARCH_USERNAME,
  password: process.env.OPENSEARCH_PASSWORD,
  indexPrefix: process.env.OPENSEARCH_INDEX_PREFIX || 'pfas',
};

/**
 * Index names
 */
export const INDICES = {
  products: `${searchConfig.indexPrefix}_products`,
  brands: `${searchConfig.indexPrefix}_brands`,
} as const;

// ============================================================
// OPENSEARCH CLIENT
// ============================================================

let _client: Client | null = null;

/**
 * Get OpenSearch client singleton
 */
export function getSearchClient(): Client {
  if (!_client) {
    const clientConfig: ConstructorParameters<typeof Client>[0] = {
      node: searchConfig.node,
    };

    if (searchConfig.username && searchConfig.password) {
      clientConfig.auth = {
        username: searchConfig.username,
        password: searchConfig.password,
      };
    }

    _client = new Client(clientConfig);
  }

  return _client;
}

/**
 * Initialize search client and verify connection
 */
export async function initSearch(): Promise<void> {
  logger.info({
    node: searchConfig.node,
    indexPrefix: searchConfig.indexPrefix,
  }, 'Initializing search client');

  const client = getSearchClient();

  try {
    const health = await client.cluster.health({});
    logger.info({
      status: health.body.status,
      clusterName: health.body.cluster_name,
      numberOfNodes: health.body.number_of_nodes,
    }, 'OpenSearch cluster connected');
  } catch (error) {
    logger.warn({ error }, 'OpenSearch cluster not available - search features disabled');
  }
}

/**
 * Health check for search service
 */
export async function searchHealthCheck(): Promise<{
  healthy: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const client = getSearchClient();
    const health = await client.cluster.health({ timeout: '5s' });
    return {
      healthy: health.body.status !== 'red',
      status: health.body.status,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// BACKWARDS COMPATIBLE STUB EXPORT (for existing code)
// ============================================================

export const searchClient = {
  /**
   * @deprecated Use SearchService instead
   */
  async search<T>(index: string, query: object): Promise<{ hits: T[]; total: number }> {
    const client = getSearchClient();
    const result = await client.search({ index, body: query });
    return {
      hits: result.body.hits.hits.map((h: { _source: T }) => h._source),
      total: typeof result.body.hits.total === 'number' 
        ? result.body.hits.total 
        : result.body.hits.total.value,
    };
  },

  /**
   * @deprecated Use SearchService instead
   */
  async suggest(index: string, prefix: string, field: string): Promise<string[]> {
    const client = getSearchClient();
    const result = await client.search({
      index,
      body: {
        suggest: {
          suggestion: {
            prefix,
            completion: { field, size: 10 },
          },
        },
      },
    });
    return result.body.suggest?.suggestion?.[0]?.options?.map(
      (o: { text: string }) => o.text
    ) || [];
  },

  /**
   * @deprecated Use IndexerService instead
   */
  async index(indexName: string, id: string, document: object): Promise<void> {
    const client = getSearchClient();
    await client.index({ index: indexName, id, body: document, refresh: true });
  },

  /**
   * @deprecated Use IndexerService instead
   */
  async delete(indexName: string, id: string): Promise<void> {
    const client = getSearchClient();
    await client.delete({ index: indexName, id, refresh: true });
  },

  async healthCheck(): Promise<boolean> {
    const result = await searchHealthCheck();
    return result.healthy;
  },
};
