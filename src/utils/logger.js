// src/utils/logger.js

import winston from 'winston';

const { combine, timestamp, printf, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...(stack && { stack }),
    ...meta,
  });
});

export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), errors({ stack: true }), logFormat),
  transports: [new winston.transports.Console()],
});
