import { successResponse } from '../../utils/response.js';

import { processPaymentWebhook } from './service.js';

export const paymentWebhook = async (req, res, next) => {
  try {
    const result = await processPaymentWebhook({
      ...req.body,
      payload: req.body,
    });

    return successResponse(res, {
      message: 'Webhook processed',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
