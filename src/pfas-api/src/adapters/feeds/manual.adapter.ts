/**
 * Manual Entry Adapter
 * Handles products entered directly through admin interface or brand portal
 */

import { BaseFeedAdapter } from './base.adapter.js';
import type {
  RawProduct,
  CanonicalProduct,
  ManualEntryConfig,
} from '../../types/canonical-product.types.js';
import { v4 as uuidv4 } from 'uuid';

interface ManualProductInput {
  name: string;
  brandName: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  retailerUrl?: string;
  retailerId?: string;
  gtin?: string;
  mpn?: string;
  materials?: string;
  coating?: string;
  features?: string;
  submittedBy: string;
}

export class ManualEntryAdapter extends BaseFeedAdapter {
  name = 'Manual Entry';
  source = 'manual' as const;
  
  private config: ManualEntryConfig;
  private pendingProducts: ManualProductInput[] = [];

  constructor(config: ManualEntryConfig) {
    super();
    this.config = config;
  }

  async validateConnection(): Promise<boolean> {
    // Manual entry is always "connected"
    return true;
  }

  /**
   * Add a product to the pending queue
   */
  addProduct(input: ManualProductInput): string {
    // Validate submitter
    if (this.config.allowedUsers.length > 0 && 
        !this.config.allowedUsers.includes(input.submittedBy)) {
      throw new Error('User not authorized for manual product entry');
    }

    const sourceId = uuidv4();
    this.pendingProducts.push({
      ...input,
    });
    
    this.log('info', 'Product added to manual queue', {
      sourceId,
      name: input.name,
      submittedBy: input.submittedBy,
    });

    return sourceId;
  }

  /**
   * Create a raw product directly from input
   */
  createRawProduct(input: ManualProductInput): RawProduct {
    return {
      source: this.source,
      sourceId: uuidv4(),
      rawData: input,
      fetchedAt: new Date(),
    };
  }

  async *fetchProducts(): AsyncGenerator<RawProduct, void, unknown> {
    // Yield all pending products and clear the queue
    const products = [...this.pendingProducts];
    this.pendingProducts = [];

    for (const product of products) {
      yield {
        source: this.source,
        sourceId: uuidv4(),
        rawData: product,
        fetchedAt: new Date(),
      };
    }
  }

  mapToCanonical(raw: RawProduct): CanonicalProduct {
    const data = raw.rawData as ManualProductInput;
    
    // Build raw attributes from provided fields
    const rawAttributes: Record<string, string> = {};
    
    if (data.materials) {
      rawAttributes.materials = data.materials;
    }
    if (data.coating) {
      rawAttributes.coating = data.coating;
    }
    if (data.features) {
      rawAttributes.features = data.features;
    }
    if (data.description) {
      rawAttributes.description = data.description;
    }

    return {
      source: this.source,
      sourceId: raw.sourceId,
      
      // Identifiers
      gtin: data.gtin ? this.extractGtin({ gtin: data.gtin }) : undefined,
      mpn: data.mpn,
      
      // Basic info
      name: this.normalizeName(data.name),
      brandName: data.brandName,
      description: data.description?.trim(),
      categoryHint: data.category,
      imageUrl: data.imageUrl,
      
      // Raw attributes for enrichment
      rawAttributes,
      
      // Retailer info - may not have retailer for manual entries
      retailerId: data.retailerId || 'manual',
      retailerUrl: data.retailerUrl || '',
      
      fetchedAt: raw.fetchedAt,
    };
  }

  /**
   * Process a single manual entry immediately
   */
  async processEntry(input: ManualProductInput): Promise<CanonicalProduct> {
    const raw = this.createRawProduct(input);
    return this.mapToCanonical(raw);
  }
}
