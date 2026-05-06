import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,

  DB_URL: process.env.DB_URL,
  REDIS_URL: process.env.REDIS_URL,

  NODE_ENV: process.env.NODE_ENV || 'development',

  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
