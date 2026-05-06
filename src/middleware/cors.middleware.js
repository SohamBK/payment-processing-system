import cors from 'cors';
import { env } from '../config/env.js';

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
