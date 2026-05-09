import express from 'express';

import healthRoutes from '../api/health/routes.js';
import paymentRoutes from '../api/payments/routes.js';
import webhookRoutes from '../api/webhook/routes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
