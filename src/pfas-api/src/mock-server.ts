/**
 * Mock API Server - runs without database
 * Start with: npx ts-node src/mock-server.ts
 */

import express from 'express';
import cors from 'cors';
import { 
  MOCK_PRODUCTS, 
  MOCK_CATEGORIES, 
  MOCK_BRANDS, 
  MOCK_RETAILERS,
  getMockProducts, 
  getMockProduct, 
  getMockProductById,
  getMockFacets,
  getProductRetailerLinks,
  getActiveRetailers,
  getDisclosureText,
  PRODUCT_ASINS,
} from './mock/data';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

// API Info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'PFAS-Free Kitchen API',
    version: '0.1.0',
    mode: 'mock',
    endpoints: [
      'GET /api/v1/products',
      'GET /api/v1/products/:slug',
      'GET /api/v1/products/:slug/retailers',
      'GET /api/v1/products/:slug/affiliate-links',
      'GET /api/v1/categories',
      'GET /api/v1/brands',
      'GET /api/v1/retailers',
      'GET /api/v1/search',
      'POST /api/v1/compare',
      'POST /api/v1/affiliate-clicks',
      'GET /api/v1/affiliate/:productId/:retailerId',
    ],
  });
});

// Products list
app.get('/api/v1/products', (req, res) => {
  const { category, tier, limit = '20', offset = '0' } = req.query;
  
  let tierFilter: number[] | undefined;
  if (tier) {
    tierFilter = String(tier).split(',').map(Number);
  }
  
  const products = getMockProducts({ 
    category: category as string,
    tier: tierFilter,
  });
  
  const start = Number(offset);
  const end = start + Number(limit);
  const paged = products.slice(start, end);
  
  res.json({
    data: paged,
    meta: {
      total: products.length,
      limit: Number(limit),
      offset: start,
      has_more: end < products.length,
    },
    facets: getMockFacets(),
  });
});

// Single product
app.get('/api/v1/products/:slug', (req, res) => {
  const product = getMockProduct(req.params.slug);
  
  if (!product) {
    return res.status(404).json({ 
      error: 'not_found',
      message: `Product not found: ${req.params.slug}`,
    });
  }
  
  res.json({ data: product });
});

// Categories
app.get('/api/v1/categories', (req, res) => {
  res.json({ data: MOCK_CATEGORIES });
});

// Brands
app.get('/api/v1/brands', (req, res) => {
  res.json({ data: MOCK_BRANDS });
});

// Search
app.get('/api/v1/search', (req, res) => {
  const { q, category, tier, material, limit = '20', offset = '0' } = req.query;
  
  let products = [...MOCK_PRODUCTS];
  
  // Text search
  if (q) {
    const query = String(q).toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.brand.name.toLowerCase().includes(query) ||
      p.material_summary.toLowerCase().includes(query)
    );
  }
  
  // Category filter
  if (category) {
    const catFilter = String(category).toLowerCase();
    products = products.filter(p => 
      p.category.path.some(c => c.toLowerCase().includes(catFilter)) ||
      p.category.name.toLowerCase().includes(catFilter)
    );
  }
  
  // Tier filter
  if (tier) {
    const tierFilter = String(tier).split(',').map(Number);
    products = products.filter(p => tierFilter.includes(p.verification.tier));
  }
  
  // Material filter
  if (material) {
    const matFilter = String(material).toLowerCase();
    products = products.filter(p => 
      p.material_summary.toLowerCase().includes(matFilter)
    );
  }
  
  const start = Number(offset);
  const end = start + Number(limit);
  const paged = products.slice(start, end);
  
  res.json({
    data: paged,
    meta: {
      total: products.length,
      limit: Number(limit),
      offset: start,
      has_more: end < products.length,
      query: q || null,
    },
    facets: getMockFacets(),
  });
});

// Compare products
app.post('/api/v1/compare', (req, res) => {
  const { slugs } = req.body;
  
  if (!Array.isArray(slugs) || slugs.length < 2) {
    return res.status(400).json({
      error: 'bad_request',
      message: 'Provide at least 2 product slugs to compare',
    });
  }
  
  const products = slugs
    .map(slug => getMockProduct(slug))
    .filter(Boolean);
  
  res.json({ data: products });
});

// ============================================================
// RETAILER ENDPOINTS
// ============================================================

// Get all active retailers
app.get('/api/v1/retailers', (req, res) => {
  const retailers = getActiveRetailers();
  res.json({ 
    data: retailers,
    count: retailers.length,
  });
});

// Get retailer links for a product
app.get('/api/v1/products/:slug/retailers', (req, res) => {
  const product = getMockProduct(req.params.slug);
  
  if (!product) {
    return res.status(404).json({
      error: 'not_found',
      message: `Product not found: ${req.params.slug}`,
    });
  }
  
  const retailerLinks = getProductRetailerLinks(product.id);
  const retailerIds = retailerLinks.map(l => l.retailer_id);
  
  res.json({
    data: retailerLinks,
    disclosure: getDisclosureText(retailerIds),
    product_id: product.id,
    product_name: product.name,
  });
});

// Get affiliate links for a product (enhanced format)
app.get('/api/v1/products/:slug/affiliate-links', (req, res) => {
  const product = getMockProduct(req.params.slug);
  
  if (!product) {
    return res.status(404).json({
      error: 'not_found',
      message: `Product not found: ${req.params.slug}`,
    });
  }
  
  const retailerLinks = getProductRetailerLinks(product.id);
  const retailerIds = retailerLinks.map(l => l.retailer_id);
  
  // Transform to frontend-friendly format
  const affiliateLinks = retailerLinks.map(link => {
    const retailer = MOCK_RETAILERS.find(r => r.id === link.retailer_id);
    return {
      retailerId: link.retailer_id,
      retailerName: retailer?.name || 'Unknown',
      retailerIcon: retailer?.icon || 'external-link',
      affiliateUrl: link.url,
      disclosureRequired: retailer?.affiliate_program !== null,
      disclosureText: retailer?.disclosure_text || 'We may earn a commission from this purchase.',
      inStock: link.in_stock,
      price: link.price,
      currency: link.currency || 'USD',
    };
  });
  
  res.json({
    productId: product.id,
    links: affiliateLinks,
    gridDisclosure: getDisclosureText(retailerIds),
  });
});

// Track affiliate click
app.post('/api/v1/affiliate-clicks', (req, res) => {
  const { product_id, retailer_id, session_id, referrer_page, user_agent_hash } = req.body;
  
  // Validate required fields
  if (!product_id || !retailer_id) {
    return res.status(400).json({
      error: 'bad_request',
      message: 'product_id and retailer_id are required',
    });
  }
  
  // Generate click ID
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In mock mode, just log and return success
  console.log(`[Affiliate Click] ${clickId}: Product ${product_id} -> Retailer ${retailer_id}`);
  
  res.json({
    clickId,
    tracked: true,
  });
});

// Legacy affiliate link (backward compatibility)
app.get('/api/v1/affiliate/:productId/:retailerId', (req, res) => {
  const { productId, retailerId } = req.params;
  
  // Get product ASIN if available
  const asin = PRODUCT_ASINS[productId] || 'MOCK123';
  const retailer = MOCK_RETAILERS.find(r => r.id === retailerId);
  
  let url = `https://www.amazon.com/dp/${asin}?tag=pfasfreekitch-20`;
  
  if (retailer && retailerId !== 'ret_amazon') {
    // Build URL from retailer template
    const links = getProductRetailerLinks(productId);
    const link = links.find(l => l.retailer_id === retailerId);
    if (link) {
      url = link.url;
    }
  }
  
  res.json({
    url,
    retailer: retailerId,
    retailer_name: retailer?.name || 'Unknown',
    product_id: productId,
    disclosure: retailer?.disclosure_text || 'We may earn a commission from this purchase.',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  PFAS-Free Kitchen API (MOCK MODE)                           ║
║                                                              ║
║  Running at: http://localhost:${PORT}                          ║
║                                                              ║
║  This server uses sample data - no database required.        ║
║  For production, configure PostgreSQL and run main server.   ║
╚══════════════════════════════════════════════════════════════╝
`);
});
