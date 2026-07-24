import { Redis } from "@upstash/redis";

// Shared, atomic fixed-window limiter when Upstash is configured; falls back to
// a per-instance in-memory token bucket otherwise (local dev, or if the env
// vars are unset). Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in
// production so limits hold across serverless instances.

export type RateResult = { ok: boolean; retryAfterSec: number };

let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

// Atomic INCR + set-expiry-on-first-hit; returns [count, ttlMs].
const SCRIPT = `
local c = redis.call('INCR', KEYS[1])
if c == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return {c, redis.call('PTTL', KEYS[1])}
`;

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  const r = getRedis();
  if (!r) return memoryLimit(key, limit, windowMs);
  try {
    const [count, ttl] = (await r.eval(SCRIPT, [key], [String(windowMs)])) as [number, number];
    if (count > limit) return { ok: false, retryAfterSec: Math.max(1, Math.ceil(ttl / 1000)) };
    return { ok: true, retryAfterSec: 0 };
  } catch {
    // Redis unreachable: fall back to the local limiter rather than blocking all
    // traffic. Abuse control degrades to per-instance for the outage window.
    return memoryLimit(key, limit, windowMs);
  }
}

// --- in-memory token bucket (fallback / local) ---
type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();
const MAX_ENTRIES = 50_000;

function memoryLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const refillPerMs = limit / windowMs;
  let b = buckets.get(key);
  if (!b) {
    if (buckets.size >= MAX_ENTRIES) sweep(now, windowMs);
    b = { tokens: limit, last: now };
    buckets.set(key, b);
  }
  b.tokens = Math.min(limit, b.tokens + (now - b.last) * refillPerMs);
  b.last = now;
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { ok: true, retryAfterSec: 0 };
  }
  return { ok: false, retryAfterSec: Math.ceil((1 - b.tokens) / refillPerMs / 1000) };
}

function sweep(now: number, windowMs: number) {
  for (const [k, b] of buckets) {
    if (now - b.last > windowMs * 2) buckets.delete(k);
  }
  if (buckets.size >= MAX_ENTRIES) buckets.clear();
}