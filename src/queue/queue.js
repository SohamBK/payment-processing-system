import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const paymentQueue = new Queue('payment-processing', {
  connection: redisConnection,
});
