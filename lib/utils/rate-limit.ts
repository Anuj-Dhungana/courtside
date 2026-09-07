/**
 * Simple in-memory sliding-window rate limiter for internal API routes.
 * Suitable for a single-instance deployment; swap for a Redis-backed
 * limiter when scaling horizontally (interface kept minimal for that).
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_KEYS = 10_000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const w = windows.get(key);
  if (!w || now > w.resetAt) {
    if (windows.size >= MAX_KEYS) windows.clear();
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (w.count >= limit) return { allowed: false, remaining: 0 };
  w.count += 1;
  return { allowed: true, remaining: limit - w.count };
}

export function clientKeyFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : null) ?? "anonymous";
}
