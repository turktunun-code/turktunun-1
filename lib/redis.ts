import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url?.trim() || !token?.trim()) {
    client = null;
    return null;
  }

  client = new Redis({ url: url.trim(), token: token.trim() });
  return client;
}

export function isRedisConfigured(): boolean {
  return getRedis() !== null;
}
