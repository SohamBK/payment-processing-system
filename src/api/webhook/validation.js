import { z } from 'zod';

export const paymentWebhookSchema = z.object({
  body: z.object({
    eventId: z.string(),

    paymentId: z.string().uuid(),

    status: z.enum(['SUCCESS', 'FAILED']),
  }),
});
