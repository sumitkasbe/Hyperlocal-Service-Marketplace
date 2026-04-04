import Redis from "ioredis";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis", // docker service name
  port: 6379,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

export default redis;
