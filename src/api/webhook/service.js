import { prisma } from '../../config/prisma.js';

import { logger } from '../../utils/logger.js';

export const processPaymentWebhook = async ({ eventId, paymentId, status, payload }) => {
  // 1. Check duplicate webhook
  const existingWebhook = await prisma.webhookEvent.findUnique({
    where: {
      eventId,
    },
  });

  if (existingWebhook) {
    logger.warn('Duplicate webhook received', {
      eventId,
    });

    return {
      duplicate: true,
      webhook: existingWebhook,
    };
  }

  // 2. Fetch payment
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // 3. Store webhook event
  const webhook = await prisma.webhookEvent.create({
    data: {
      eventId,
      paymentId,
      eventType: status,
      payload,
    },
  });

  // 4. Ignore already finalized payments
  if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
    const updatedWebhook = await prisma.webhookEvent.update({
      where: {
        id: webhook.id,
      },
      data: {
        processed: true,
      },
    });

    logger.warn('Webhook ignored for finalized payment', {
      paymentId,
      currentStatus: payment.status,
      incomingStatus: status,
    });

    return updatedWebhook;
  }

  // 5. Apply payment status update
  await prisma.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status,
    },
  });

  // 6. Mark webhook as processed
  const updatedWebhook = await prisma.webhookEvent.update({
    where: {
      id: webhook.id,
    },
    data: {
      processed: true,
    },
  });

  logger.info('Webhook processed successfully', {
    eventId,
    paymentId,
    status,
  });

  return updatedWebhook;
};
