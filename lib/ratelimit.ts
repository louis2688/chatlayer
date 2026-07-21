// ponytail: in-memory token bucket, single instance; swap to Upstash Redis
// (@upstash/ratelimit) when deploying to multi-instance/serverless-scale.

type Bucket = { tokens: number; last: number };

const buckets = new Map<string, Bucket>();
const MAX_ENTRIES = 50_000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
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
  // ponytail: blunt overflow guard — a full reset only helps abusers briefly
  if (buckets.size >= MAX_ENTRIES) buckets.clear();
}
