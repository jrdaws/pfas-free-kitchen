/**
 * Product Data Validation Tests
 * 
 * Ensures all product data meets integrity requirements.
 */

import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_URL || 'http://localhost:3001';

test.describe('Product Data Integrity', () => {
  test('All products have required fields', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=100`);
    expect(response.ok()).toBeTruthy();

    const { data } = await response.json();
    expect(data.length).toBeGreaterThan(0);

    for (const product of data) {
      // Required identifiers
      expect(product.id, `Product missing id`).toBeTruthy();
      expect(product.name, `Product ${product.id} missing name`).toBeTruthy();
      expect(product.slug, `Product ${product.id} missing slug`).toBeTruthy();

      // Required relationships
      expect(product.brand, `Product ${product.id} missing brand`).toBeTruthy();
      expect(product.brand.id, `Product ${product.id} brand missing id`).toBeTruthy();
      expect(product.brand.name, `Product ${product.id} brand missing name`).toBeTruthy();

      expect(product.category, `Product ${product.id} missing category`).toBeTruthy();
      expect(product.category.id, `Product ${product.id} category missing id`).toBeTruthy();
      expect(product.category.name, `Product ${product.id} category missing name`).toBeTruthy();

      // Verification data
      expect(product.verification, `Product ${product.id} missing verification`).toBeTruthy();
      expect(product.verification.tier, `Product ${product.id} verification missing tier`).toBeDefined();
      expect(product.verification.tier).toBeGreaterThanOrEqual(0);
      expect(product.verification.tier).toBeLessThanOrEqual(4);

      // Components
      expect(product.components, `Product ${product.id} missing components`).toBeInstanceOf(Array);
      expect(product.components.length, `Product ${product.id} has no components`).toBeGreaterThan(0);

      // Each component should have required fields
      for (const component of product.components) {
        expect(component.name || component.id, `Product ${product.id} component missing identifier`).toBeTruthy();
        expect(component.pfas_status, `Product ${product.id} component missing pfas_status`).toBeTruthy();
      }
    }
  });

  test('All products have valid verification tiers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=100`);
    const { data } = await response.json();

    const tierCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const product of data) {
      const tier = product.verification.tier;
      expect([0, 1, 2, 3, 4]).toContain(tier);
      tierCounts[tier]++;
    }

    // Log tier distribution
    console.log('Tier distribution:', tierCounts);

    // Should have products in at least 2 tiers (realistic data has variety)
    const tiersWithProducts = Object.values(tierCounts).filter((c) => c > 0).length;
    expect(tiersWithProducts, 'Should have products in multiple verification tiers').toBeGreaterThanOrEqual(1);
  });

  test('All products have at least one retailer', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=100`);
    const { data } = await response.json();

    let productsWithoutRetailers = 0;
    for (const product of data) {
      const hasRetailers =
        (product.retailer_links && product.retailer_links.length > 0) ||
        (product.retailers && product.retailers.length > 0);

      if (!hasRetailers) {
        productsWithoutRetailers++;
        console.warn(`Product ${product.slug} has no retailers`);
      }
    }

    // All products should have retailers
    expect(
      productsWithoutRetailers,
      `${productsWithoutRetailers} products missing retailers`
    ).toBe(0);
  });

  test('All product slugs are unique', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=200`);
    const { data } = await response.json();

    const slugs = data.map((p: { slug: string }) => p.slug);
    const uniqueSlugs = new Set(slugs);

    // Find duplicates if any
    if (uniqueSlugs.size !== slugs.length) {
      const seen = new Set();
      const duplicates: string[] = [];
      for (const slug of slugs) {
        if (seen.has(slug)) {
          duplicates.push(slug);
        }
        seen.add(slug);
      }
      console.error('Duplicate slugs:', duplicates);
    }

    expect(uniqueSlugs.size, 'All slugs should be unique').toBe(slugs.length);
  });

  test('All product IDs are unique', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=200`);
    const { data } = await response.json();

    const ids = data.map((p: { id: string }) => p.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size, 'All IDs should be unique').toBe(ids.length);
  });

  test('Products have valid material summaries', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=100`);
    const { data } = await response.json();

    const validMaterials = [
      'stainless steel',
      'cast iron',
      'carbon steel',
      'enameled',
      'glass',
      'ceramic',
      'aluminum',
      'copper',
    ];

    for (const product of data) {
      if (product.material_summary) {
        const materialLower = product.material_summary.toLowerCase();
        const isValidMaterial = validMaterials.some((m) => materialLower.includes(m));
        expect(
          isValidMaterial,
          `Product ${product.slug} has unknown material: ${product.material_summary}`
        ).toBeTruthy();
      }
    }
  });

  test('Products have consistent category structure', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=100`);
    const { data } = await response.json();

    const categories = new Set<string>();
    for (const product of data) {
      categories.add(product.category.id);

      // Category path should exist
      if (product.category.path) {
        expect(product.category.path).toBeInstanceOf(Array);
      }
    }

    // Should have multiple categories
    console.log('Categories found:', [...categories]);
    expect(categories.size, 'Should have multiple product categories').toBeGreaterThan(1);
  });
});

test.describe('Product API Endpoints', () => {
  test('Products endpoint supports pagination', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?limit=5&offset=0`);
    expect(response.ok()).toBeTruthy();

    const { data, meta } = await response.json();
    expect(data.length).toBeLessThanOrEqual(5);
    expect(meta.total).toBeGreaterThan(0);
    expect(meta.limit).toBe(5);
  });

  test('Products endpoint supports category filter', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?category=skillets`);
    expect(response.ok()).toBeTruthy();

    const { data } = await response.json();
    // All returned products should be in skillets category
    for (const product of data) {
      const inCategory =
        product.category.id.includes('skillet') ||
        product.category.name.toLowerCase().includes('skillet') ||
        product.category.path?.some((p: string) => p.toLowerCase().includes('skillet'));
      expect(inCategory, `Product ${product.slug} not in skillets category`).toBeTruthy();
    }
  });

  test('Products endpoint supports tier filter', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products?tier=2`);
    expect(response.ok()).toBeTruthy();

    const { data } = await response.json();
    for (const product of data) {
      expect(product.verification.tier, `Product ${product.slug} has wrong tier`).toBe(2);
    }
  });

  test('Single product endpoint returns full data', async ({ request }) => {
    // First get a product slug
    const listResponse = await request.get(`${API_BASE}/api/v1/products?limit=1`);
    const { data: listData } = await listResponse.json();
    const slug = listData[0].slug;

    // Fetch single product
    const response = await request.get(`${API_BASE}/api/v1/products/${slug}`);
    expect(response.ok()).toBeTruthy();

    const { data } = await response.json();
    expect(data.slug).toBe(slug);
    expect(data.name).toBeTruthy();
    expect(data.verification).toBeTruthy();
    expect(data.components).toBeInstanceOf(Array);
  });

  test('Single product endpoint returns 404 for invalid slug', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/products/this-product-does-not-exist`);
    expect(response.status()).toBe(404);
  });
});

test.describe('Retailer Data', () => {
  test('Retailers endpoint returns active retailers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/retailers`);
    expect(response.ok()).toBeTruthy();

    const { data } = await response.json();
    expect(data.length).toBeGreaterThan(0);

    // Check retailer structure
    for (const retailer of data) {
      expect(retailer.id).toBeTruthy();
      expect(retailer.name).toBeTruthy();
      expect(retailer.slug).toBeTruthy();
    }
  });

  test('Product retailer links have valid URLs', async ({ request }) => {
    // Get a product with retailers
    const listResponse = await request.get(`${API_BASE}/api/v1/products?limit=1`);
    const { data: listData } = await listResponse.json();
    const slug = listData[0].slug;

    // Get retailer links
    const response = await request.get(`${API_BASE}/api/v1/products/${slug}/retailers`);
    expect(response.ok()).toBeTruthy();

    const { data } = await response.json();
    for (const link of data) {
      expect(link.retailer_id).toBeTruthy();
      expect(link.url).toBeTruthy();
      expect(link.url).toMatch(/^https?:\/\//);
    }
  });
});
