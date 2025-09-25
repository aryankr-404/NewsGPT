import Redis from 'ioredis';

export const redisClient = new Redis({
  port: 6379,          // Redis default port
  host: '127.0.0.1',   // Connect to localhost
});

redisClient.on('connect', () => {
  console.log('✅ Successfully connected to Redis via ioredis!');
});

redisClient.on('error', (err) => {
  console.error('❌ Could not connect to Redis:', err);
});



