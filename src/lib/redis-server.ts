// src/lib/redis.server.ts
import Redis from "ioredis";

// Use process.env.REDIS_URL if provided, else fallback
export const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,   // 🔑 required for BullMQ
});
