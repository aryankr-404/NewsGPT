import 'dotenv/config';
import { createClient } from 'redis';

const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_HOST_LINK = process.env.REDIS_HOST_LINK;
const REDIS_PORT = process.env.REDIS_PORT;

const client = createClient({
    username: 'default',
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_HOST_LINK,
        port: REDIS_PORT,
    }
});

client.on('error', err => console.log('Redis Client Error', err));

async function test() {
  await client.connect();

  await client.set("foo", "bar");
  const result = await client.get("foo");

  console.log("✅ Value from Redis:", result);
}

test();

