import { successResponse } from '../../utils/response.js';
import { createPaymentService, getPaymentByIdService } from './service.js';

export const createPayment = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: 'Idempotency-Key header is required',
      });
    }

    const payment = await createPaymentService({
      amount,
      currency,
      idempotencyKey,
    });

    return successResponse(res, {
      message: 'Payment created successfully',
      data: payment,
      statusCode: 201,
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await getPaymentByIdService(id);

    return successResponse(res, {
      message: 'Payment fetched successfully',
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};
