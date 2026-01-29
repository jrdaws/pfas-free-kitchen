/**
 * Admin routes aggregator for PFAS-Free Kitchen Platform API
 */

import { Router } from 'express';
import verificationAdminRoutes from './verification.admin.routes.js';
import evidenceAdminRoutes from './evidence.admin.routes.js';
import reportsAdminRoutes from './reports.admin.routes.js';
import queueAdminRoutes from './queue.admin.routes.js';
import auditAdminRoutes from './audit.admin.routes.js';

const router = Router();

// Mount admin routes
router.use(verificationAdminRoutes);
router.use(evidenceAdminRoutes);
router.use(reportsAdminRoutes);
router.use(queueAdminRoutes);
router.use(auditAdminRoutes);

export default router;
