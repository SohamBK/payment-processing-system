import express from 'express';

import { paymentWebhook } from './controller.js';

import { validate } from '../../middleware/validate.middleware.js';

import { paymentWebhookSchema } from './validation.js';

const router = express.Router();

router.post('/payment', validate(paymentWebhookSchema), paymentWebhook);

export default router;
