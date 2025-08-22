// src/lib/redis.server.ts
import Redis from "ioredis";

// export const connection = new Redis();
export const connection = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,   // 🔑 required for BullMQ
});