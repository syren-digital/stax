import { Redis } from "@upstash/redis";

const redisUrl = process.env.REDIS_URL ?? "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

const isConfigured =
  redisUrl &&
  !redisUrl.includes("placeholder") &&
  redisToken &&
  !redisToken.includes("placeholder");

export const redis = isConfigured
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

/** TTL in seconds — 20 minutes during market hours, 1 hour otherwise */
export const MARKET_HOURS_TTL = 60 * 20;
export const OFF_HOURS_TTL = 60 * 60;

function isMarketHours(): boolean {
  const now = new Date();
  // AEST = UTC+10 (no DST adjustment here — close enough for caching)
  const aestOffset = 10 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const aestMinutes = (utcMinutes + aestOffset) % (24 * 60);
  const day = (now.getUTCDay() + Math.floor((utcMinutes + aestOffset) / (24 * 60))) % 7;
  // ASX: Mon–Fri, 10:00–16:12 AEST
  if (day === 0 || day === 6) return false;
  return aestMinutes >= 600 && aestMinutes <= 972;
}

export function tickerCacheTtl(): number {
  return isMarketHours() ? MARKET_HOURS_TTL : OFF_HOURS_TTL;
}

export function tickerCacheKey(ticker: string, segment: string): string {
  return `stax:ticker:${ticker.toUpperCase()}:${segment}`;
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  return redis.get<T>(key);
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  if (!redis) return;
  await redis.set(key, value, { ex: ttlSeconds });
}
