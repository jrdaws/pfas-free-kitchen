/**
 * Base Feed Adapter
 * Abstract class for all feed source adapters
 */

import type {
  FeedAdapter,
  RawProduct,
  CanonicalProduct,
  ProductSource,
} from '../../types/canonical-product.types.js';
import { logger } from '../../config/logger.js';

export abstract class BaseFeedAdapter implements FeedAdapter {
  abstract name: string;
  abstract source: ProductSource;

  /**
   * Fetch products from the feed source
   * Subclasses must implement this as an async generator
   */
  abstract fetchProducts(): AsyncGenerator<RawProduct, void, unknown>;

  /**
   * Map raw product to canonical format
   * Subclasses must implement the mapping logic
   */
  abstract mapToCanonical(raw: RawProduct): CanonicalProduct;

  /**
   * Validate connection to the feed source
   * Subclasses should implement connection checking
   */
  abstract validateConnection(): Promise<boolean>;

  /**
   * Safely get string value from raw data
   */
  protected getString(data: Record<string, unknown>, key: string, fallback = ''): string {
    const value = data[key];
    if (typeof value === 'string') return value.trim();
    if (value !== null && value !== undefined) return String(value).trim();
    return fallback;
  }

  /**
   * Safely extract GTIN (UPC/EAN) from various field names
   */
  protected extractGtin(data: Record<string, unknown>): string | undefined {
    const gtinFields = ['gtin', 'upc', 'ean', 'gtin13', 'gtin14', 'barcode'];
    for (const field of gtinFields) {
      const value = this.getString(data, field);
      if (value && /^\d{8,14}$/.test(value)) {
        return value.padStart(14, '0');
      }
    }
    return undefined;
  }

  /**
   * Clean and normalize product name
   */
  protected normalizeName(name: string): string {
    return name
      .replace(/\s+/g, ' ')           // Multiple spaces to single
      .replace(/[\r\n\t]/g, ' ')      // Remove line breaks/tabs
      .replace(/[""]/g, '"')          // Normalize quotes
      .replace(/['']/g, "'")          // Normalize apostrophes
      .trim();
  }

  /**
   * Extract brand from product name if not provided
   */
  protected extractBrandFromName(name: string): string {
    // Common pattern: "Brand Name Product Description"
    const match = name.match(/^([A-Z][a-zA-Z0-9&'.-]+(?:\s+[A-Z][a-zA-Z0-9&'.-]+)?)\s/);
    if (match) {
      return match[1];
    }
    return 'Unknown Brand';
  }

  /**
   * Log adapter activity
   */
  protected log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: Record<string, unknown>
  ): void {
    logger[level]({
      adapter: this.name,
      source: this.source,
      ...data,
    }, message);
  }

  /**
   * Process all products from the feed
   * Wraps fetchProducts with error handling and logging
   */
  async *processAll(): AsyncGenerator<CanonicalProduct, void, unknown> {
    this.log('info', `Starting feed processing for ${this.name}`);
    let count = 0;
    let errors = 0;

    try {
      for await (const raw of this.fetchProducts()) {
        try {
          const canonical = this.mapToCanonical(raw);
          count++;
          
          if (count % 100 === 0) {
            this.log('debug', `Processed ${count} products`, { errors });
          }
          
          yield canonical;
        } catch (err) {
          errors++;
          this.log('error', 'Failed to map product', {
            sourceId: raw.sourceId,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    } finally {
      this.log('info', `Feed processing complete`, { count, errors });
    }
  }
}
