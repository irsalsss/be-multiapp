import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_PRIVATE_URL || 'redis://localhost:6379', {
  connectTimeout: 5000,
  maxRetriesPerRequest: 1,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export default redis;
