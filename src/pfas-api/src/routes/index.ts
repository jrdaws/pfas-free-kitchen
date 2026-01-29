/**
 * Route aggregator for PFAS-Free Kitchen Platform API
 * 
 * PUBLIC ENDPOINTS (12):
 * - GET  /api/v1/products
 * - GET  /api/v1/products/:id
 * - GET  /api/v1/products/:id/compare
 * - GET  /api/v1/products/:id/verification
 * - GET  /api/v1/products/:id/affiliate-links
 * - GET  /api/v1/categories
 * - GET  /api/v1/evidence/:id
 * - GET  /api/v1/evidence/:id/artifact
 * - GET  /api/v1/search
 * - GET  /api/v1/search/autocomplete
 * - POST /api/v1/reports
 * - POST /api/v1/affiliate-clicks
 * 
 * ADMIN ENDPOINTS (7):
 * - POST   /api/v1/admin/verification/decide
 * - POST   /api/v1/admin/evidence/upload
 * - GET    /api/v1/admin/reports
 * - PATCH  /api/v1/admin/reports/:id
 * - GET    /api/v1/admin/queue
 * - POST   /api/v1/admin/queue/:id/assign
 * - GET    /api/v1/admin/audit-log
 */

import { Router } from 'express';

// Public routes
import catalogRoutes from './catalog.routes.js';
import verificationRoutes from './verification.routes.js';
import evidenceRoutes from './evidence.routes.js';
import affiliateRoutes from './affiliate.routes.js';
import searchRoutes from './search.routes.js';
import reportsRoutes from './reports.routes.js';

// Admin routes
import adminRoutes from './admin/index.js';

const router = Router();

// Mount public routes
router.use(catalogRoutes);        // /products, /categories
router.use(verificationRoutes);   // /products/:id/verification
router.use(evidenceRoutes);       // /evidence/:id, /evidence/:id/artifact
router.use(affiliateRoutes);      // /products/:id/affiliate-links, /affiliate-clicks
router.use(searchRoutes);         // /search, /search/autocomplete
router.use(reportsRoutes);        // /reports

// Mount admin routes under /admin prefix
router.use('/admin', adminRoutes);

export default router;
