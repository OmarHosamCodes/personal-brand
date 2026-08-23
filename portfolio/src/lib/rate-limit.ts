/** ponytail: single-node in-memory rate limit. Ceiling: lost on restart / multi-instance. Upgrade: Redis or edge KV when the host scales horizontally. */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 60 * 60 * 1000;

export function checkRateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}

/** Test helper — clears all buckets. */
export function resetRateLimitsForTests(): void {
  buckets.clear();
}
