/**
 * OpenSearch Index Setup Script
 * Creates the products index with custom analyzers and mappings
 * 
 * Usage: npx ts-node scripts/setup-search-index.ts
 */

import { Client } from '@opensearch-project/opensearch';

// ============================================================
// CONFIGURATION
// ============================================================

const OPENSEARCH_NODE = process.env.OPENSEARCH_NODE || 'http://localhost:9200';
const OPENSEARCH_USERNAME = process.env.OPENSEARCH_USERNAME;
const OPENSEARCH_PASSWORD = process.env.OPENSEARCH_PASSWORD;
const INDEX_PREFIX = process.env.OPENSEARCH_INDEX_PREFIX || 'pfas';
const INDEX_NAME = `${INDEX_PREFIX}_products`;

// ============================================================
// INDEX SETTINGS AND MAPPINGS
// ============================================================

const INDEX_SETTINGS = {
  settings: {
    number_of_shards: 2,
    number_of_replicas: 1,
    analysis: {
      analyzer: {
        product_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'product_synonyms', 'english_stemmer'],
        },
        autocomplete_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'autocomplete_filter'],
        },
        autocomplete_search_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
      },
      filter: {
        product_synonyms: {
          type: 'synonym',
          synonyms: [
            // Cookware types
            'skillet, frying pan, frypan',
            'dutch oven, cocotte, french oven',
            'sheet pan, baking sheet, cookie sheet',
            'saucepan, sauce pan',
            'stockpot, stock pot',
            'saute pan, sauté pan',
            'wok, stir fry pan',
            // Materials
            'stainless, stainless steel',
            'cast iron, castiron',
            'carbon steel, carbonsteel',
            'ceramic, ceramica',
            // Brands (common misspellings)
            'le creuset, lecreuset',
            'all clad, allclad, all-clad',
            'lodge, lodge cast iron',
            'staub, staub cocotte',
            // PFAS terms
            'pfas free, pfas-free, pfasfree',
            'pfoa free, pfoa-free, pfoafree',
            'ptfe free, ptfe-free, ptfefree',
            'non stick, nonstick, non-stick',
            'teflon free, teflonfree',
          ],
        },
        english_stemmer: {
          type: 'stemmer',
          language: 'english',
        },
        autocomplete_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
        },
      },
    },
  },
  mappings: {
    properties: {
      // Core fields
      id: { type: 'keyword' },
      name: {
        type: 'text',
        analyzer: 'product_analyzer',
        fields: {
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete_analyzer',
            search_analyzer: 'autocomplete_search_analyzer',
          },
          keyword: { type: 'keyword' },
        },
      },
      slug: { type: 'keyword' },
      description: {
        type: 'text',
        analyzer: 'product_analyzer',
      },
      
      // Brand
      brand_id: { type: 'keyword' },
      brand_name: {
        type: 'text',
        analyzer: 'product_analyzer',
        fields: {
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete_analyzer',
            search_analyzer: 'autocomplete_search_analyzer',
          },
          keyword: { type: 'keyword' },
        },
      },
      
      // Category
      category_id: { type: 'keyword' },
      category_path: { type: 'keyword' },
      
      // Material & Coating summaries
      material_summary: {
        type: 'text',
        analyzer: 'product_analyzer',
        fields: { keyword: { type: 'keyword' } },
      },
      coating_summary: {
        type: 'text',
        analyzer: 'product_analyzer',
        fields: { keyword: { type: 'keyword' } },
      },
      
      // Verification
      tier: { type: 'integer' },
      claim_type: { type: 'keyword' },
      has_evidence: { type: 'boolean' },
      evidence_count: { type: 'integer' },
      
      // Facets (keyword for exact matching in filters/aggregations)
      materials: { type: 'keyword' },
      coating_type: { type: 'keyword' },
      food_contact_surface: { type: 'keyword' },
      retailer_ids: { type: 'keyword' },
      
      // Features
      induction_compatible: { type: 'boolean' },
      oven_safe_temp_f: { type: 'integer' },
      dishwasher_safe: { type: 'boolean' },
      
      // Ranking signals
      tier_boost: { type: 'float' },
      freshness_score: { type: 'float' },
      
      // Timestamps
      published_at: { type: 'date' },
      updated_at: { type: 'date' },
    },
  },
};

// ============================================================
// MAIN FUNCTIONS
// ============================================================

async function getClient(): Promise<Client> {
  const config: ConstructorParameters<typeof Client>[0] = {
    node: OPENSEARCH_NODE,
  };

  if (OPENSEARCH_USERNAME && OPENSEARCH_PASSWORD) {
    config.auth = {
      username: OPENSEARCH_USERNAME,
      password: OPENSEARCH_PASSWORD,
    };
  }

  return new Client(config);
}

async function createIndex(client: Client): Promise<void> {
  console.log(`Checking if index '${INDEX_NAME}' exists...`);
  
  const exists = await client.indices.exists({ index: INDEX_NAME });
  
  if (exists.body) {
    console.log(`Index '${INDEX_NAME}' already exists.`);
    return;
  }

  console.log(`Creating index '${INDEX_NAME}'...`);
  await client.indices.create({
    index: INDEX_NAME,
    body: INDEX_SETTINGS,
  });
  
  console.log(`✓ Created index: ${INDEX_NAME}`);
}

async function deleteIndex(client: Client): Promise<void> {
  console.log(`Deleting index '${INDEX_NAME}'...`);
  
  const exists = await client.indices.exists({ index: INDEX_NAME });
  
  if (!exists.body) {
    console.log(`Index '${INDEX_NAME}' does not exist.`);
    return;
  }

  await client.indices.delete({ index: INDEX_NAME });
  console.log(`✓ Deleted index: ${INDEX_NAME}`);
}

async function updateMappings(client: Client): Promise<void> {
  console.log(`Updating mappings for '${INDEX_NAME}'...`);
  
  await client.indices.putMapping({
    index: INDEX_NAME,
    body: INDEX_SETTINGS.mappings,
  });
  
  console.log(`✓ Updated mappings for: ${INDEX_NAME}`);
}

async function showInfo(client: Client): Promise<void> {
  const exists = await client.indices.exists({ index: INDEX_NAME });
  
  if (!exists.body) {
    console.log(`Index '${INDEX_NAME}' does not exist.`);
    return;
  }

  const stats = await client.indices.stats({ index: INDEX_NAME });
  const mappings = await client.indices.getMapping({ index: INDEX_NAME });
  
  console.log('\n=== Index Info ===');
  console.log(`Name: ${INDEX_NAME}`);
  console.log(`Docs: ${stats.body._all.primaries.docs.count}`);
  console.log(`Size: ${stats.body._all.primaries.store.size_in_bytes} bytes`);
  console.log('\n=== Mappings ===');
  console.log(JSON.stringify(mappings.body[INDEX_NAME].mappings.properties, null, 2));
}

async function main(): Promise<void> {
  const command = process.argv[2] || 'create';
  
  console.log(`\nOpenSearch Index Setup`);
  console.log(`======================`);
  console.log(`Node: ${OPENSEARCH_NODE}`);
  console.log(`Index: ${INDEX_NAME}`);
  console.log(`Command: ${command}\n`);

  const client = await getClient();

  try {
    // Verify connection
    const health = await client.cluster.health({});
    console.log(`Cluster: ${health.body.cluster_name} (${health.body.status})\n`);
  } catch (error) {
    console.error('Failed to connect to OpenSearch:', error);
    process.exit(1);
  }

  switch (command) {
    case 'create':
      await createIndex(client);
      break;
    case 'delete':
      await deleteIndex(client);
      break;
    case 'recreate':
      await deleteIndex(client);
      await createIndex(client);
      break;
    case 'update-mappings':
      await updateMappings(client);
      break;
    case 'info':
      await showInfo(client);
      break;
    default:
      console.log('Usage: npx ts-node scripts/setup-search-index.ts [command]');
      console.log('Commands: create, delete, recreate, update-mappings, info');
  }
}

main().catch(console.error);
