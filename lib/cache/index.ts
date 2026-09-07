import { logger } from "@/lib/utils/logger";

/**
 * Cache layer with Redis primary + in-memory fallback.
 *
 * Design goals:
 *  - The app must keep working when Redis is absent or down.
 *  - Stale-while-revalidate semantics via `getOrSet` with soft/hard TTLs.
 *  - Request coalescing: concurrent misses for the same key share one
 *    upstream fetch (prevents thundering-herd against the Streamed API).
 *
 * TTL strategy (documented in docs/architecture.md):
 *  - live matches:      15s soft / 60s hard
 *  - today's matches:   60s soft / 5m hard
 *  - all matches:       120s soft / 10m hard
 *  - sports list:       1h soft / 24h hard
 *  - streams:           30s soft / 2m hard
 */

interface Entry<T> {
  value: T;
  /** epoch ms after which value is considered stale (but still usable). */
  softExpiry: number;
  /** epoch ms after which value must not be served. */
  hardExpiry: number;
}

type RedisLike = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: "PX", ttl: number): Promise<unknown>;
  status?: string;
};

const memory = new Map<string, Entry<unknown>>();
const MAX_MEMORY_ENTRIES = 500;

let redis: RedisLike | null = null;
let redisInitAttempted = false;

async function getRedis(): Promise<RedisLike | null> {
  if (redisInitAttempted) return redis;
  redisInitAttempted = true;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) =>
        times > 3 ? null : Math.min(times * 200, 1000),
      enableOfflineQueue: false,
    });
    client.on("error", (err) => {
      logger.warn("redis_error", { error: err.message });
    });
    await client.connect();
    redis = client as unknown as RedisLike;
    logger.info("redis_connected");
  } catch (err) {
    logger.warn("redis_unavailable_falling_back_to_memory", {
      error: err instanceof Error ? err.message : String(err),
    });
    redis = null;
  }
  return redis;
}

function memoryGet<T>(key: string): Entry<T> | null {
  const e = memory.get(key) as Entry<T> | undefined;
  if (!e) return null;
  if (Date.now() > e.hardExpiry) {
    memory.delete(key);
    return null;
  }
  return e;
}

function memorySet<T>(key: string, entry: Entry<T>) {
  if (memory.size >= MAX_MEMORY_ENTRIES) {
    // Evict oldest inserted entry (Map preserves insertion order).
    const first = memory.keys().next().value;
    if (first !== undefined) memory.delete(first);
  }
  memory.set(key, entry as Entry<unknown>);
}

async function readThrough<T>(key: string): Promise<Entry<T> | null> {
  const mem = memoryGet<T>(key);
  if (mem) return mem;
  try {
    const r = await getRedis();
    if (!r) return null;
    const raw = await r.get(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() > entry.hardExpiry) return null;
    memorySet(key, entry);
    return entry;
  } catch {
    return null;
  }
}

async function writeThrough<T>(key: string, entry: Entry<T>) {
  memorySet(key, entry);
  try {
    const r = await getRedis();
    if (!r) return;
    const ttl = Math.max(entry.hardExpiry - Date.now(), 1000);
    await r.set(key, JSON.stringify(entry), "PX", ttl);
  } catch {
    // Redis write failures are non-fatal.
  }
}

/** In-flight fetches keyed by cache key, for request coalescing. */
const inflight = new Map<string, Promise<unknown>>();

export interface CacheOptions {
  /** Seconds until the value is considered stale. */
  softTtl: number;
  /** Seconds until the value is evicted entirely. Defaults to 4x softTtl. */
  hardTtl?: number;
}

/**
 * Get a cached value or produce it with `fetcher`.
 *
 * - Fresh hit  -> return cached.
 * - Stale hit  -> return cached immediately, revalidate in background.
 * - Miss       -> fetch (coalesced), cache, return.
 * - Fetch fails + stale value exists -> serve stale (graceful degradation).
 */
export async function getOrSet<T>(
  key: string,
  options: CacheOptions,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hardTtl = options.hardTtl ?? options.softTtl * 4;
  const entry = await readThrough<T>(key);
  const now = Date.now();

  if (entry && now <= entry.softExpiry) {
    return entry.value;
  }

  const doFetch = async (): Promise<T> => {
    const value = await fetcher();
    await writeThrough(key, {
      value,
      softExpiry: Date.now() + options.softTtl * 1000,
      hardExpiry: Date.now() + hardTtl * 1000,
    });
    return value;
  };

  if (entry) {
    // Stale-while-revalidate: kick off background refresh, serve stale now.
    if (!inflight.has(key)) {
      const p = doFetch()
        .catch((err) => {
          logger.warn("cache_background_revalidate_failed", {
            key,
            error: err instanceof Error ? err.message : String(err),
          });
        })
        .finally(() => inflight.delete(key));
      inflight.set(key, p as Promise<unknown>);
    }
    return entry.value;
  }

  // Miss: coalesce concurrent fetches.
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const p = doFetch().finally(() => inflight.delete(key));
  inflight.set(key, p as Promise<unknown>);
  return p;
}

/** Expose for tests. */
export function __clearMemoryCache() {
  memory.clear();
  inflight.clear();
}
