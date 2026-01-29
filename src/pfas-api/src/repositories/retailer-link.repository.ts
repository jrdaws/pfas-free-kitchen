/**
 * Retailer Link Repository for PFAS-Free Kitchen Platform
 * Manages product-retailer associations and external IDs
 */

import { logger } from '../config/logger.js';
import type { RetailerLink } from '../types/affiliate.types.js';

// In-memory store for development (replace with PostgreSQL in production)
const retailerLinkStore: RetailerLink[] = [
  // Example data for testing
  {
    id: 'rl_1',
    productId: 'prod_1',
    retailerId: 'ret_amazon',
    externalId: 'B08N5WRWNW', // Example ASIN
    productUrl: 'https://www.amazon.com/dp/B08N5WRWNW',
    inStock: true,
    lastCheckedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rl_2',
    productId: 'prod_1',
    retailerId: 'ret_williams_sonoma',
    externalId: 'WS-12345',
    productUrl: 'https://www.williams-sonoma.com/products/WS-12345',
    inStock: true,
    lastCheckedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rl_3',
    productId: 'prod_2',
    retailerId: 'ret_amazon',
    externalId: 'B07XK7DNVF',
    productUrl: 'https://www.amazon.com/dp/B07XK7DNVF',
    inStock: true,
    lastCheckedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let linkIdCounter = 4;

export class RetailerLinkRepository {
  /**
   * Find all retailer links for a product
   */
  static async findByProductId(productId: string): Promise<RetailerLink[]> {
    const links = retailerLinkStore.filter((l) => l.productId === productId);
    logger.debug({ productId, count: links.length }, 'Found retailer links');
    return links;

    /* PostgreSQL implementation:
    const result = await db.query(`
      SELECT 
        id, product_id, retailer_id, external_id,
        product_url, in_stock, last_checked_at,
        created_at, updated_at
      FROM retailer_links
      WHERE product_id = $1 AND active = true
      ORDER BY retailer_id
    `, [productId]);
    return result.rows.map(mapRetailerLinkFromDb);
    */
  }

  /**
   * Find a specific retailer link
   */
  static async findByProductAndRetailer(
    productId: string,
    retailerId: string
  ): Promise<RetailerLink | null> {
    const link = retailerLinkStore.find(
      (l) => l.productId === productId && l.retailerId === retailerId
    );
    return link || null;
  }

  /**
   * Find by external ID (ASIN, SKU, etc.)
   */
  static async findByExternalId(
    retailerId: string,
    externalId: string
  ): Promise<RetailerLink | null> {
    const link = retailerLinkStore.find(
      (l) => l.retailerId === retailerId && l.externalId === externalId
    );
    return link || null;
  }

  /**
   * Create a new retailer link
   */
  static async create(
    data: Omit<RetailerLink, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RetailerLink> {
    const link: RetailerLink = {
      ...data,
      id: `rl_${linkIdCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    retailerLinkStore.push(link);
    logger.info({ linkId: link.id, productId: data.productId }, 'Retailer link created');

    return link;
  }

  /**
   * Update a retailer link
   */
  static async update(
    id: string,
    data: Partial<RetailerLink>
  ): Promise<RetailerLink | null> {
    const index = retailerLinkStore.findIndex((l) => l.id === id);
    if (index === -1) return null;

    retailerLinkStore[index] = {
      ...retailerLinkStore[index],
      ...data,
      updatedAt: new Date(),
    };

    return retailerLinkStore[index];
  }

  /**
   * Update stock status
   */
  static async updateStockStatus(
    id: string,
    inStock: boolean
  ): Promise<void> {
    const index = retailerLinkStore.findIndex((l) => l.id === id);
    if (index !== -1) {
      retailerLinkStore[index].inStock = inStock;
      retailerLinkStore[index].lastCheckedAt = new Date();
      retailerLinkStore[index].updatedAt = new Date();
    }
  }

  /**
   * Delete a retailer link
   */
  static async delete(id: string): Promise<boolean> {
    const index = retailerLinkStore.findIndex((l) => l.id === id);
    if (index === -1) return false;

    retailerLinkStore.splice(index, 1);
    return true;
  }

  /**
   * Find links needing stock check
   */
  static async findNeedingStockCheck(
    olderThanHours: number = 24
  ): Promise<RetailerLink[]> {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    return retailerLinkStore.filter(
      (l) => !l.lastCheckedAt || l.lastCheckedAt < cutoff
    );
  }

  /**
   * Bulk upsert retailer links
   */
  static async bulkUpsert(links: Array<Omit<RetailerLink, 'id' | 'createdAt' | 'updatedAt'>>): Promise<number> {
    let upserted = 0;

    for (const data of links) {
      const existing = await this.findByProductAndRetailer(data.productId, data.retailerId);
      
      if (existing) {
        await this.update(existing.id, data);
      } else {
        await this.create(data);
      }
      upserted++;
    }

    return upserted;
  }
}
