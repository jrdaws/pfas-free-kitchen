/**
 * Search routes for PFAS-Free Kitchen Platform API
 * Endpoints: /api/v1/search, /api/v1/search/autocomplete
 */

import { Router } from 'express';
import { SearchService } from '../services/search.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { searchRateLimit } from '../middleware/rateLimit.js';
import { searchSchema, autocompleteSchema } from '../utils/validation.js';

const router = Router();

/**
 * GET /api/v1/search
 * Search products
 */
router.get(
  '/search',
  searchRateLimit,
  asyncHandler(async (req, res) => {
    const params = searchSchema.parse(req.query);

    // STUB: Implement in w3-search-service
    const result = await SearchService.search({
      q: params.q,
      categoryId: params.category_id,
      filters: params.filters,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
    });

    // Check for education banner trigger
    const educationBanner = SearchService.getEducationBanner(params.q);
    if (educationBanner) {
      result.data.educationBanner = educationBanner;
    }

    res.json(result);
  })
);

/**
 * GET /api/v1/search/autocomplete
 * Autocomplete suggestions
 */
router.get(
  '/search/autocomplete',
  searchRateLimit,
  asyncHandler(async (req, res) => {
    const params = autocompleteSchema.parse(req.query);

    // STUB: Implement in w3-search-service
    const result = await SearchService.autocomplete({
      q: params.q,
      limit: params.limit,
    });

    res.json(result);
  })
);

export default router;
