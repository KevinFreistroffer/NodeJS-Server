import { Redis } from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_DB_HOST,
  port: 12731,
  username: process.env.REDIS_DB_USERNAME,
  password: process.env.REDIS_DB_PASSWORD,
  tls: {
    rejectUnauthorized: false
  }
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
});

export { redisClient }; 