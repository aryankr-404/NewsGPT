import 'dotenv/config';
import Redis from 'ioredis';

const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_HOST_LINK = process.env.REDIS_HOST_LINK;
const REDIS_PORT = process.env.REDIS_PORT;

const redisClient = new Redis({
    host: REDIS_HOST_LINK,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export { redisClient };

