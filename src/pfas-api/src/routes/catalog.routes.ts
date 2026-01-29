/**
 * Catalog routes for PFAS-Free Kitchen Platform API
 * Endpoints: /api/v1/products, /api/v1/categories
 */

import { Router } from 'express';
import { CatalogService } from '../services/catalog.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicRateLimit } from '../middleware/rateLimit.js';
import {
  listProductsSchema,
  productIdSchema,
  compareProductsSchema,
} from '../utils/validation.js';

const router = Router();

/**
 * GET /api/v1/products
 * List products with filtering and pagination
 */
router.get(
  '/products',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const params = listProductsSchema.parse(req.query);

    const result = await CatalogService.listProducts({
      page: params.page || 1,
      limit: params.limit || 24,
      sort: params.sort,
      tier: Array.isArray(params.tier) ? params.tier : params.tier ? [params.tier] : undefined,
      material: Array.isArray(params.material) ? params.material : params.material ? [params.material] : undefined,
      coatingType: Array.isArray(params.coating_type) ? params.coating_type : params.coating_type ? [params.coating_type] : undefined,
      foodContactSurface: Array.isArray(params.food_contact_surface) ? params.food_contact_surface : params.food_contact_surface ? [params.food_contact_surface] : undefined,
      categoryId: params.category_id,
      brandId: params.brand_id,
      inductionCompatible: params.induction_compatible,
      ovenSafeMinTemp: params.oven_safe_min_temp,
      retailerId: params.retailer_id,
    });

    res.json(result);
  })
);

/**
 * GET /api/v1/products/:product_id
 * Get single product with full details
 */
router.get(
  '/products/:product_id',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const { product_id } = productIdSchema.parse(req.params);

    const result = await CatalogService.getProduct(product_id);

    res.json(result);
  })
);

/**
 * GET /api/v1/products/:product_id/compare
 * Compare multiple products
 */
router.get(
  '/products/:product_id/compare',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const { ids } = compareProductsSchema.parse(req.query);

    // Include the product_id from params in comparison
    const { product_id } = productIdSchema.parse(req.params);
    const allIds = [product_id, ...ids.filter(id => id !== product_id)];

    const result = await CatalogService.compareProducts(allIds);

    res.json(result);
  })
);

/**
 * GET /api/v1/categories
 * List all categories with hierarchy
 */
router.get(
  '/categories',
  publicRateLimit,
  asyncHandler(async (_req, res) => {
    const result = await CatalogService.listCategories();

    res.json(result);
  })
);

/**
 * GET /api/v1/categories/:slug
 * Get category by slug
 */
router.get(
  '/categories/:slug',
  publicRateLimit,
  asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const result = await CatalogService.getCategory(slug);

    res.json(result);
  })
);

export default router;
