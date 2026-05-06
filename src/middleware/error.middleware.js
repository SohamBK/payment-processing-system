import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const errorMiddleware = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    code: err.code || 'INTERNAL_ERROR',
    details: err.details || null,
  });

  return errorResponse(res, {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || null,
    },
  });
};
