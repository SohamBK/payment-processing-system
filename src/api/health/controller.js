import { successResponse } from '../../utils/response.js';

export const healthCheck = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Service is healthy',
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};
