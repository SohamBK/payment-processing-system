import { prisma } from '../../config/prisma.js';
import { paymentQueue } from '../../queue/queue.js';

export const createPaymentService = async ({ amount, currency, idempotencyKey }) => {
  // 1. Check existing payment by idempotency key
  const existingPayment = await prisma.payment.findUnique({
    where: {
      idempotencyKey,
    },
  });

  if (existingPayment) {
    return existingPayment;
  }

  // 2. Create new payment
  const payment = await prisma.payment.create({
    data: {
      amount,
      currency,
      idempotencyKey,
    },
  });

  // 3. Enqueue payment processing job
  await paymentQueue.add(
    'process-payment',
    {
      paymentId: payment.id,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  return payment;
};

export const getPaymentByIdService = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },

    include: {
      attempts: {
        orderBy: {
          createdAt: 'asc',
        },
      },

      webhooks: {
        orderBy: {
          receivedAt: 'asc',
        },
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return payment;
};
