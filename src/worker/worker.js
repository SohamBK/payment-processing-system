import { Worker } from 'bullmq';

import { redisConnection } from '../config/redis.js';

import { processPaymentJob } from './payment.processor.js';

import { logger } from '../utils/logger.js';

const worker = new Worker('payment-processing', processPaymentJob, {
  connection: redisConnection,
});

worker.on('completed', (job) => {
  logger.info('Job completed', {
    jobId: job.id,
  });
});

worker.on('failed', (job, err) => {
  logger.error('Job failed', {
    jobId: job?.id,
    error: err.message,
  });
});

logger.info('Payment worker started');
