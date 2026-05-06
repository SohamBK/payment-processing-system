import express from 'express';
import { healthCheck } from './controller.js';

const router = express.Router();

router.get('/', healthCheck);

export default router;
