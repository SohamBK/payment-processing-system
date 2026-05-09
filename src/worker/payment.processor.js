import { prisma } from '../config/prisma.js';

import { simulateGateway } from '../services/gateway.service.js';

import { acquireLock, releaseLock } from '../utils/lock.js';

import { logger } from '../utils/logger.js';

export const processPaymentJob = async (job) => {
  const { paymentId } = job.data;

  const lockKey = `lock:payment:${paymentId}`;

  const lockAcquired = await acquireLock(lockKey);

  if (!lockAcquired) {
    logger.warn('Payment already being processed', {
      paymentId,
    });

    return;
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Skip finalized payments
    if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
      logger.info('Payment already finalized', {
        paymentId,
      });

      return;
    }

    // Mark payment as processing
    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: 'PROCESSING',
      },
    });

    logger.info('Processing payment', {
      paymentId,
      attempt: job.attemptsMade + 1,
    });

    // Create payment attempt
    const attempt = await prisma.paymentAttempt.create({
      data: {
        paymentId,
        attemptNumber: job.attemptsMade + 1,
        status: 'PROCESSING',
      },
    });

    try {
      const gatewayResponse = await simulateGateway();

      // SUCCESS
      if (gatewayResponse.success) {
        await prisma.$transaction([
          prisma.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              status: 'SUCCESS',
              externalReference: gatewayResponse.externalReference,
            },
          }),

          prisma.paymentAttempt.update({
            where: {
              id: attempt.id,
            },
            data: {
              status: 'SUCCESS',
              providerResponse: gatewayResponse,
              completedAt: new Date(),
            },
          }),
        ]);

        logger.info('Payment successful', {
          paymentId,
        });

        return;
      }

      // NON-RETRYABLE FAILURE
      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: 'FAILED',
            retryCount: {
              increment: 1,
            },
            failureReason: gatewayResponse.errorMessage,
          },
        }),

        prisma.paymentAttempt.update({
          where: {
            id: attempt.id,
          },
          data: {
            status: 'FAILED',
            providerResponse: gatewayResponse,
            errorMessage: gatewayResponse.errorMessage,
            completedAt: new Date(),
          },
        }),
      ]);

      logger.error('Payment failed', {
        paymentId,
      });
    } catch (error) {
      const hasRetriesRemaining = job.attemptsMade + 1 < payment.maxRetries;

      // RETRYABLE FAILURE
      if (hasRetriesRemaining) {
        await prisma.$transaction([
          prisma.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              status: 'RETRYING',
              retryCount: {
                increment: 1,
              },
              failureReason: error.message,
            },
          }),

          prisma.paymentAttempt.update({
            where: {
              id: attempt.id,
            },
            data: {
              status: 'TIMEOUT',
              errorMessage: error.message,
              completedAt: new Date(),
            },
          }),
        ]);

        logger.warn('Payment retry scheduled', {
          paymentId,
          attempt: job.attemptsMade + 1,
        });

        // Throw error so BullMQ retries
        throw error;
      }

      // FINAL FAILURE
      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: 'FAILED',
            retryCount: {
              increment: 1,
            },
            failureReason: error.message,
          },
        }),

        prisma.paymentAttempt.update({
          where: {
            id: attempt.id,
          },
          data: {
            status: 'TIMEOUT',
            errorMessage: error.message,
            completedAt: new Date(),
          },
        }),
      ]);

      logger.error('Payment permanently failed', {
        paymentId,
        error: error.message,
      });

      throw error;
    }
  } finally {
    await releaseLock(lockKey);
  }
};
