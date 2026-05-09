import express from 'express';
import { createPayment, getPaymentById } from './controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createPaymentSchema } from './validation.js';

const router = express.Router();

router.post('/', validate(createPaymentSchema), createPayment);
router.get('/:id', getPaymentById);

export default router;
