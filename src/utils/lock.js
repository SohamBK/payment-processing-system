import { redisConnection } from '../config/redis.js';

export const acquireLock = async (key, ttl = 30000) => {
  const result = await redisConnection.set(key, 'locked', 'PX', ttl, 'NX');

  return result === 'OK';
};

export const releaseLock = async (key) => {
  await redisConnection.del(key);
};
