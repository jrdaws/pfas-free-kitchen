/**
 * Search Service
 * Full-text search with faceted filtering and trust-weighted ranking
 */

import { Client } from '@opensearch-project/opensearch';
import type {
  SearchParams,
  SearchResponse,
  SearchResult,
  SearchFacets,
  FacetBucket,
  AutocompleteParams,
  AutocompleteResponse,
  AutocompleteSuggestion,
  EducationBanner,
  ProductIndexDocument,
} from '../types/search.types.js';
import { getSearchClient, INDICES } from '../config/search.js';
import { logger } from '../config/logger.js';

// ============================================================
// EDUCATION BANNERS
// ============================================================

const EDUCATION_TRIGGERS: Array<{
  pattern: RegExp;
  banner: EducationBanner;
}> = [
  {
    pattern: /pfoa.?free/i,
    banner: {
      type: 'pfoa_clarification',
      title: 'PFOA-free ≠ PFAS-free',
      message: "PFOA is one of thousands of PFAS chemicals. A product labeled 'PFOA-free' may still contain other PFAS.",
      link: '/education/pfoa-vs-pfas',
      linkText: 'Learn more about PFAS →',
    },
  },
  {
    pattern: /\bptfe\b/i,
    banner: {
      type: 'pfas_education',
      title: 'About PTFE (Teflon)',
      message: 'PTFE is a fluoropolymer and a type of PFAS. Products with PTFE coatings are not included in our PFAS-free catalog.',
      link: '/education/what-is-ptfe',
      linkText: 'Learn more about PTFE →',
    },
  },
  {
    pattern: /\bteflon\b/i,
    banner: {
      type: 'pfas_education',
      title: 'About Teflon® (PTFE)',
      message: 'Teflon is a brand name for PTFE, a type of PFAS. Our catalog focuses on PFAS-free alternatives.',
      link: '/education/what-is-ptfe',
      linkText: 'Explore PFAS-free options →',
    },
  },
];

// ============================================================
// SEARCH SERVICE
// ============================================================

export class SearchService {
  private client: Client;
  private indexName: string;

  constructor() {
    this.client = getSearchClient();
    this.indexName = INDICES.products;
  }

  /**
   * Search products with facets
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    const query = this.buildQuery(params);

    logger.debug({ params, query }, 'Search query');

    const result = await this.client.search({
      index: this.indexName,
      body: query,
    });

    const totalCount = typeof result.body.hits.total === 'number'
      ? result.body.hits.total
      : result.body.hits.total.value;

    return {
      query: params.q,
      totalCount,
      results: result.body.hits.hits.map((hit: OpenSearchHit) => this.transformHit(hit)),
      facets: this.extractFacets(result.body.aggregations),
      suggestions: this.extractSuggestions(result.body),
      educationBanner: params.q ? this.checkEducationBanner(params.q) : null,
      pagination: {
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(totalCount / params.limit),
      },
    };
  }

  /**
   * Autocomplete suggestions
   */
  async autocomplete(params: AutocompleteParams): Promise<AutocompleteResponse> {
    const limit = params.limit || 5;

    const result = await this.client.search({
      index: this.indexName,
      body: {
        size: 0,
        suggest: {
          product_suggest: {
            prefix: params.q,
            completion: {
              field: 'name.autocomplete',
              size: limit,
              skip_duplicates: true,
            },
          },
          brand_suggest: {
            prefix: params.q,
            completion: {
              field: 'brand_name.autocomplete',
              size: 3,
              skip_duplicates: true,
            },
          },
        },
      },
    });

    const suggestions: AutocompleteSuggestion[] = [];

    // Product suggestions
    const productSuggestions = result.body.suggest?.product_suggest?.[0]?.options || [];
    for (const opt of productSuggestions) {
      suggestions.push({
        text: opt.text,
        type: 'product',
        id: opt._source?.id,
        slug: opt._source?.slug,
      });
    }

    // Brand suggestions
    const brandSuggestions = result.body.suggest?.brand_suggest?.[0]?.options || [];
    for (const opt of brandSuggestions) {
      suggestions.push({
        text: opt.text,
        type: 'brand',
        id: opt._source?.brand_id,
      });
    }

    return {
      suggestions: suggestions.slice(0, limit),
    };
  }

  /**
   * Build OpenSearch query from params
   */
  private buildQuery(params: SearchParams): object {
    const must: object[] = [];
    const filter: object[] = [];

    // Full-text search with field boosting
    if (params.q) {
      must.push({
        multi_match: {
          query: params.q,
          fields: [
            'name^3',
            'brand_name^2',
            'description',
            'material_summary^1.5',
            'coating_summary^1.2',
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          prefix_length: 2,
        },
      });
    }

    // Category filter
    if (params.category_id) {
      filter.push({ term: { category_id: params.category_id } });
    }

    // Tier filter
    if (params.tiers?.length) {
      filter.push({ terms: { tier: params.tiers } });
    }

    // Materials filter
    if (params.materials?.length) {
      filter.push({ terms: { materials: params.materials } });
    }

    // Coating types filter
    if (params.coating_types?.length) {
      filter.push({ terms: { coating_type: params.coating_types } });
    }

    // Retailer filter
    if (params.retailer_id) {
      filter.push({ term: { retailer_ids: params.retailer_id } });
    }

    // Boolean feature filters
    if (params.induction !== undefined) {
      filter.push({ term: { induction_compatible: params.induction } });
    }
    if (params.dishwasher_safe !== undefined) {
      filter.push({ term: { dishwasher_safe: params.dishwasher_safe } });
    }

    // Oven temp range filter
    if (params.oven_safe_min) {
      filter.push({ range: { oven_safe_temp_f: { gte: params.oven_safe_min } } });
    }

    // Build aggregations for facets
    const aggs = this.buildAggregations();

    // Build sort order
    const sort = this.buildSort(params.sort);

    return {
      from: (params.page - 1) * params.limit,
      size: params.limit,
      query: {
        function_score: {
          query: {
            bool: {
              must: must.length ? must : [{ match_all: {} }],
              filter,
            },
          },
          functions: [
            // Trust boost by verification tier
            { filter: { term: { tier: 4 } }, weight: 2.0 },
            { filter: { term: { tier: 3 } }, weight: 1.8 },
            { filter: { term: { tier: 2 } }, weight: 1.4 },
            { filter: { term: { tier: 1 } }, weight: 1.2 },
            { filter: { term: { tier: 0 } }, weight: 0.8 },
            // Evidence boost
            { filter: { term: { has_evidence: true } }, weight: 1.3 },
            // Freshness decay
            {
              gauss: {
                updated_at: {
                  origin: 'now',
                  scale: '180d',
                  decay: 0.5,
                },
              },
              weight: 1.2,
            },
          ],
          score_mode: 'multiply',
          boost_mode: 'multiply',
        },
      },
      aggs,
      sort,
      highlight: {
        fields: {
          name: { number_of_fragments: 0 },
          description: { fragment_size: 150, number_of_fragments: 2 },
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      },
    };
  }

  /**
   * Build facet aggregations
   */
  private buildAggregations(): object {
    return {
      tier_facet: {
        terms: { field: 'tier', size: 5 },
      },
      material_facet: {
        terms: { field: 'materials', size: 20 },
      },
      coating_type_facet: {
        terms: { field: 'coating_type', size: 10 },
      },
      retailer_facet: {
        terms: { field: 'retailer_ids', size: 20 },
      },
      category_facet: {
        terms: { field: 'category_id', size: 50 },
      },
      induction_facet: {
        terms: { field: 'induction_compatible' },
      },
      oven_temp_ranges: {
        range: {
          field: 'oven_safe_temp_f',
          ranges: [
            { key: 'up_to_400', to: 401 },
            { key: '400_to_500', from: 400, to: 501 },
            { key: '500_plus', from: 500 },
          ],
        },
      },
    };
  }

  /**
   * Build sort order
   */
  private buildSort(sortOption?: string): object[] {
    const sorts: Record<string, object[]> = {
      relevance: [{ _score: 'desc' }, { tier: 'desc' }],
      tier_desc: [{ tier: 'desc' }, { _score: 'desc' }, { 'name.keyword': 'asc' }],
      tier_asc: [{ tier: 'asc' }, { _score: 'desc' }, { 'name.keyword': 'asc' }],
      name_asc: [{ 'name.keyword': 'asc' }],
      name_desc: [{ 'name.keyword': 'desc' }],
      newest: [{ published_at: 'desc' }, { _score: 'desc' }],
    };
    return sorts[sortOption || 'tier_desc'] || sorts.tier_desc;
  }

  /**
   * Transform OpenSearch hit to SearchResult
   */
  private transformHit(hit: OpenSearchHit): SearchResult {
    const source = hit._source as ProductIndexDocument;
    return {
      id: source.id,
      name: source.name,
      slug: source.slug,
      description: source.description,
      brandId: source.brand_id,
      brandName: source.brand_name,
      categoryId: source.category_id,
      categoryPath: source.category_path,
      materialSummary: source.material_summary,
      coatingSummary: source.coating_summary,
      tier: source.tier as 0 | 1 | 2 | 3 | 4,
      claimType: source.claim_type as SearchResult['claimType'],
      hasEvidence: source.has_evidence,
      evidenceCount: source.evidence_count,
      materials: source.materials || [],
      coatingType: source.coating_type,
      foodContactSurface: source.food_contact_surface,
      inductionCompatible: source.induction_compatible,
      ovenSafeTempF: source.oven_safe_temp_f,
      dishwasherSafe: source.dishwasher_safe,
      highlight: hit.highlight ? {
        name: hit.highlight.name,
        description: hit.highlight.description,
      } : undefined,
      score: hit._score || 0,
    };
  }

  /**
   * Extract facets from aggregations
   */
  private extractFacets(aggregations: OpenSearchAggregations | undefined): SearchFacets {
    if (!aggregations) {
      return {
        tiers: [],
        materials: [],
        coatingTypes: [],
        retailers: [],
        categories: [],
        induction: [],
        ovenTempRanges: [],
      };
    }

    return {
      tiers: this.extractBuckets(aggregations.tier_facet, TIER_LABELS),
      materials: this.extractBuckets(aggregations.material_facet),
      coatingTypes: this.extractBuckets(aggregations.coating_type_facet),
      retailers: this.extractBuckets(aggregations.retailer_facet),
      categories: this.extractBuckets(aggregations.category_facet),
      induction: this.extractBuckets(aggregations.induction_facet, BOOLEAN_LABELS),
      ovenTempRanges: this.extractBuckets(aggregations.oven_temp_ranges, OVEN_RANGE_LABELS),
    };
  }

  /**
   * Extract buckets from aggregation
   */
  private extractBuckets(
    agg: { buckets?: Array<{ key: string | number; doc_count: number }> } | undefined,
    labels?: Record<string, string>
  ): FacetBucket[] {
    if (!agg?.buckets) return [];

    return agg.buckets.map(bucket => ({
      key: String(bucket.key),
      count: bucket.doc_count,
      label: labels?.[String(bucket.key)],
    }));
  }

  /**
   * Extract suggestions from response
   */
  private extractSuggestions(body: { suggest?: SuggestResponse }): string[] {
    const suggestions: string[] = [];
    if (body.suggest?.product_suggest?.[0]?.options) {
      for (const opt of body.suggest.product_suggest[0].options) {
        suggestions.push(opt.text);
      }
    }
    return suggestions;
  }

  /**
   * Check if query triggers education banner
   */
  private checkEducationBanner(query: string): EducationBanner | null {
    for (const trigger of EDUCATION_TRIGGERS) {
      if (trigger.pattern.test(query)) {
        return trigger.banner;
      }
    }
    return null;
  }

  /**
   * Get education banner (static method for route handlers)
   */
  static getEducationBanner(query: string): EducationBanner | undefined {
    for (const trigger of EDUCATION_TRIGGERS) {
      if (trigger.pattern.test(query)) {
        return trigger.banner;
      }
    }
    return undefined;
  }

  /**
   * Parse filters from query string
   */
  static parseFilters(filtersJson?: string): Record<string, unknown> {
    if (!filtersJson) return {};
    try {
      return JSON.parse(filtersJson);
    } catch {
      return {};
    }
  }
}

// ============================================================
// LABEL MAPS
// ============================================================

const TIER_LABELS: Record<string, string> = {
  '4': 'PFAS-Free Verified',
  '3': 'PFAS-Free Claimed',
  '2': 'Likely PFAS-Free',
  '1': 'More Info Needed',
  '0': 'Unknown',
};

const BOOLEAN_LABELS: Record<string, string> = {
  'true': 'Yes',
  'false': 'No',
};

const OVEN_RANGE_LABELS: Record<string, string> = {
  'up_to_400': 'Up to 400°F',
  '400_to_500': '400-500°F',
  '500_plus': '500°F+',
};

// ============================================================
// OPENSEARCH TYPES (internal)
// ============================================================

interface OpenSearchHit {
  _id: string;
  _score: number;
  _source: ProductIndexDocument;
  highlight?: {
    name?: string[];
    description?: string[];
  };
}

interface OpenSearchAggregations {
  tier_facet?: { buckets?: Array<{ key: number; doc_count: number }> };
  material_facet?: { buckets?: Array<{ key: string; doc_count: number }> };
  coating_type_facet?: { buckets?: Array<{ key: string; doc_count: number }> };
  retailer_facet?: { buckets?: Array<{ key: string; doc_count: number }> };
  category_facet?: { buckets?: Array<{ key: string; doc_count: number }> };
  induction_facet?: { buckets?: Array<{ key: string; doc_count: number }> };
  oven_temp_ranges?: { buckets?: Array<{ key: string; doc_count: number }> };
}

interface SuggestResponse {
  product_suggest?: Array<{
    options: Array<{ text: string; _source?: { id: string; slug: string } }>;
  }>;
  brand_suggest?: Array<{
    options: Array<{ text: string; _source?: { brand_id: string } }>;
  }>;
}

// Export singleton instance
export const searchService = new SearchService();
