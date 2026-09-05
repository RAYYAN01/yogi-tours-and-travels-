import { Redis } from "@upstash/redis";
import { env } from "../config/env.js";

/**
 * Optional Redis cache for public-page DB reads and rendered HTML, backed by
 * Upstash's REST API (no persistent TCP connection, so it works from a
 * serverless function). Every export below degrades to "just run the
 * function, no caching" when the Upstash env vars aren't set — Redis is
 * purely a speed-up here, never a requirement for the site to work, so a
 * deploy without it configured (or a transient Redis error) behaves exactly
 * like the app did before caching was added.
 */
const redis = env.redis.url && env.redis.token ? new Redis({ url: env.redis.url, token: env.redis.token }) : null;

export const isCacheEnabled = redis !== null;

const VERSION_KEY = "ytt:cache:v";

// Serverless instances stay warm across several requests, so memoizing the
// version number for a few seconds avoids an extra Redis round-trip on every
// single cached() call while still picking up an admin edit reasonably fast.
let cachedVersion = 0;
let versionFetchedAt = 0;
const VERSION_MEMO_MS = 10_000;

/**
 * Current cache version, safe to call even when Redis is unset/unreachable
 * (resolves to the last known value, or 0). Callers that need to read and
 * later write under the *same* version — e.g. the page-cache middleware,
 * which renders in between the read and the write — must fetch this once and
 * pass it to both getCachedPage/setCachedPage explicitly, rather than letting
 * each call re-fetch it independently: bumpCacheVersion() updates the shared
 * module-level version the instant an admin save lands, so two independent
 * fetches straddling a render can land on different versions and end up
 * writing a pre-edit render under the post-edit key — invisible to every
 * later reader until that key's own TTL expires.
 */
export async function getCacheVersion(): Promise<number> {
  if (!redis) return 0;
  const now = Date.now();
  if (now - versionFetchedAt < VERSION_MEMO_MS) return cachedVersion;
  try {
    const v = await redis.get<number>(VERSION_KEY);
    cachedVersion = typeof v === "number" ? v : 0;
    versionFetchedAt = now;
  } catch {
    // Keep serving the last known version rather than throwing — a stale
    // version just means slightly-delayed invalidation, not broken caching.
  }
  return cachedVersion;
}

/**
 * Invalidates every cached DB read and rendered page in one step — call this
 * once after any admin create/update/delete. Bumping a single version number
 * (rather than tracking which keys a given edit could affect) means every
 * cache immediately starts writing under a new key, so stale entries are
 * simply never read again; they fall out of Redis on their own TTL.
 */
export async function bumpCacheVersion(): Promise<void> {
  if (!redis) return;
  try {
    cachedVersion = await redis.incr(VERSION_KEY);
    versionFetchedAt = Date.now();
  } catch {
    // Worst case here is other warm instances keep serving a cached page/read
    // for up to VERSION_MEMO_MS longer than intended — not worth failing the
    // admin save over.
  }
}

/**
 * Cache the JSON-serializable result of `fn` under `key` for `ttlSeconds`.
 * Only the Redis get/set calls are guarded — a real error thrown by `fn()`
 * itself propagates to the caller untouched instead of being swallowed and
 * silently retried (which would double the DB work on exactly the kind of
 * DB-under-stress failure this cache exists to reduce).
 */
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  if (!redis) return fn();

  let fullKey: string | null = null;
  try {
    const version = await getCacheVersion();
    fullKey = `ytt:v${version}:${key}`;
    const hit = await redis.get<T>(fullKey);
    if (hit !== null && hit !== undefined) return hit;
  } catch {
    fullKey = null; // Redis read failed — fall through to an uncached call below.
  }

  const value = await fn();

  if (fullKey) {
    try {
      await redis.set(fullKey, value, { ex: ttlSeconds });
    } catch {
      // Best-effort write; a failed cache write just means the next call misses too.
    }
  }

  return value;
}

/**
 * Looks up a cached rendered page under the given (already-fetched) version.
 * Returns null on a miss, a disabled cache, or a Redis error. Takes the
 * version explicitly — see getCacheVersion()'s doc comment — so the caller
 * can pass the same value it later gives setCachedPage.
 */
export async function getCachedPage(key: string, version: number): Promise<string | null> {
  if (!redis) return null;
  try {
    const html = await redis.get<string>(`ytt:page:v${version}:${key}`);
    return typeof html === "string" ? html : null;
  } catch {
    return null;
  }
}

/** Writes a rendered page under the given (already-fetched) version — see getCachedPage. */
export async function setCachedPage(key: string, html: string, ttlSeconds: number, version: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`ytt:page:v${version}:${key}`, html, { ex: ttlSeconds });
  } catch {
    // Best-effort — a failed cache write just means the next request renders again too.
  }
}
