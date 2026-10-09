/**
 * Shared SWR cache utilities for Wisdom Tower Academy.
 * Zero external dependencies.
 * Layers: in-memory Map -> localStorage -> initialData fallback.
 */

export interface SwrCacheEntry<T> {
  v: number;
  ts: number;
  data: T;
}

const STORAGE_PREFIX = "wta-swr:v1:";
const MAX_ITEM_BYTES = 300 * 1024; // 300 KB single item limit
const MAX_TOTAL_BYTES = 1.5 * 1024 * 1024; // ~1.5 MB total cap
const TARGET_EVICT_BYTES = 1.0 * 1024 * 1024; // Evict down to ~1.0 MB
const DEFAULT_MIN_REVALIDATE_INTERVAL = 3000; // 3s between automatic background fetches

// In-memory cache surviving client-side route transitions
const memoryCache = new Map<string, SwrCacheEntry<unknown>>();

// Deduplication for in-flight requests
const inFlightRequests = new Map<string, Promise<unknown>>();

// Minimum interval tracker
const lastRevalidationTime = new Map<string, number>();

// Key subscribers for live invalidations & refresh
const subscribers = new Map<string, Set<() => void>>();

// Current user tracking for user-scoped cache keys
let currentUserId: string | null = null;
let cachedAuthUser: any = null;

export function setCachedAuthUser(u: any) {
  cachedAuthUser = u;
  if (u?.id) {
    setActiveUserId(u.id);
  }
}

export function getCachedAuthUser(): any {
  return cachedAuthUser;
}

export function setActiveUserId(uid: string | null) {
  if (currentUserId !== uid) {
    currentUserId = uid;
    // Wipe memory on user change to prevent state leakage
    memoryCache.clear();
    lastRevalidationTime.clear();
  }
}

export function getActiveUserId(): string | null {
  if (currentUserId) return currentUserId;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("wt-academy-auth-v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user?.id) {
          currentUserId = parsed.user.id;
          return currentUserId;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Builds the fully qualified cache key.
 * For user-scoped keys, includes the current user's ID.
 */
export function resolveCacheKey(
  key: string,
  scope: "public" | "user" = "public",
  explicitUserId?: string | null
): string {
  if (scope === "user") {
    const uid = explicitUserId || getActiveUserId() || "anon";
    return `usr:${uid}:${key}`;
  }
  return `pub:${key}`;
}

export function getMemoryCache<T>(resolvedKey: string): SwrCacheEntry<T> | undefined {
  const entry = memoryCache.get(resolvedKey);
  if (!entry) return undefined;
  return entry as SwrCacheEntry<T>;
}

export function setMemoryCache<T>(resolvedKey: string, data: T, ts = Date.now()): void {
  memoryCache.set(resolvedKey, {
    v: 1,
    ts,
    data,
  });
}

function getStorageKey(resolvedKey: string): string {
  return `${STORAGE_PREFIX}${resolvedKey}`;
}

export function getLocalStorageCache<T>(resolvedKey: string): SwrCacheEntry<T> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(getStorageKey(resolvedKey));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as SwrCacheEntry<T>;
    if (parsed && parsed.v === 1 && parsed.data !== undefined) {
      return parsed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function evictLocalStorageIfNeeded(newItemLength: number): void {
  if (typeof window === "undefined") return;
  try {
    let totalLength = 0;
    const entries: { fullKey: string; ts: number; length: number }[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const val = window.localStorage.getItem(k);
        const len = (k.length + (val ? val.length : 0)) * 2;
        totalLength += len;
        let ts = 0;
        try {
          if (val) {
            const p = JSON.parse(val);
            ts = p.ts || 0;
          }
        } catch {}
        entries.push({ fullKey: k, ts, length: len });
      }
    }

    if (totalLength + newItemLength > MAX_TOTAL_BYTES) {
      // Sort oldest first
      entries.sort((a, b) => a.ts - b.ts);
      for (const item of entries) {
        window.localStorage.removeItem(item.fullKey);
        totalLength -= item.length;
        if (totalLength + newItemLength <= TARGET_EVICT_BYTES) {
          break;
        }
      }
    }
  } catch {
    /* ignore */
  }
}

export function setLocalStorageCache<T>(
  resolvedKey: string,
  data: T,
  ts = Date.now()
): void {
  if (typeof window === "undefined") return;
  try {
    const entry: SwrCacheEntry<T> = { v: 1, ts, data };
    const serialized = JSON.stringify(entry);

    // Skip caching values larger than 300 KB
    if (serialized.length * 2 > MAX_ITEM_BYTES) {
      return;
    }

    evictLocalStorageIfNeeded(serialized.length * 2);
    window.localStorage.setItem(getStorageKey(resolvedKey), serialized);
  } catch {
    /* ignore QuotaExceededError or private browsing restrictions */
  }
}

/**
 * Synchronous read checking in-memory first, then localStorage.
 */
export function getCachedValue<T>(resolvedKey: string): SwrCacheEntry<T> | undefined {
  const mem = getMemoryCache<T>(resolvedKey);
  if (mem) return mem;
  const local = getLocalStorageCache<T>(resolvedKey);
  if (local) {
    setMemoryCache(resolvedKey, local.data, local.ts);
    return local;
  }
  return undefined;
}

/**
 * Updates both in-memory and localStorage layers.
 */
export function setCachedValue<T>(resolvedKey: string, data: T, ts = Date.now()): void {
  setMemoryCache(resolvedKey, data, ts);
  setLocalStorageCache(resolvedKey, data, ts);
}

/**
 * Executes a fetch with in-flight deduplication and min-interval protection.
 */
export async function executeDedupedFetch<T>(
  resolvedKey: string,
  fetcher: () => Promise<T>,
  force = false,
  minInterval = DEFAULT_MIN_REVALIDATE_INTERVAL
): Promise<T> {
  const now = Date.now();
  const lastTime = lastRevalidationTime.get(resolvedKey) || 0;

  // In-flight deduplication
  const existing = inFlightRequests.get(resolvedKey);
  if (existing) {
    return existing as Promise<T>;
  }

  // Skip background storm if fetched recently and not forced
  if (!force && now - lastTime < minInterval) {
    const cached = memoryCache.get(resolvedKey);
    if (cached) {
      return cached.data as T;
    }
  }

  const promise = (async () => {
    try {
      const result = await fetcher();
      lastRevalidationTime.set(resolvedKey, Date.now());
      return result;
    } finally {
      inFlightRequests.delete(resolvedKey);
    }
  })();

  inFlightRequests.set(resolvedKey, promise);
  return promise;
}

/**
 * Subscribe a component hook to key updates or hard refresh.
 */
export function subscribeToCacheKey(resolvedKey: string, callback: () => void): () => void {
  let set = subscribers.get(resolvedKey);
  if (!set) {
    set = new Set();
    subscribers.set(resolvedKey, set);
  }
  set.add(callback);

  return () => {
    const s = subscribers.get(resolvedKey);
    if (s) {
      s.delete(callback);
      if (s.size === 0) {
        subscribers.delete(resolvedKey);
      }
    }
  };
}

export function notifySubscribers(resolvedKey: string): void {
  const set = subscribers.get(resolvedKey);
  if (set) {
    set.forEach((cb) => {
      try {
        cb();
      } catch {}
    });
  }
}

/**
 * Invalidate a key or key prefix.
 * Matches both with and without scope prefix (pub: or usr:).
 */
export function invalidate(keyOrPrefix: string): void {
  // Clear matching in memory
  for (const k of Array.from(memoryCache.keys())) {
    if (
      k === keyOrPrefix ||
      k.startsWith(keyOrPrefix) ||
      k.endsWith(`:${keyOrPrefix}`) ||
      k.includes(`:${keyOrPrefix}:`) ||
      k.includes(keyOrPrefix)
    ) {
      memoryCache.delete(k);
      lastRevalidationTime.delete(k);
      notifySubscribers(k);
    }
  }

  // Clear matching in localStorage
  if (typeof window !== "undefined") {
    try {
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const fullKey = window.localStorage.key(i);
        if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
          const stripped = fullKey.slice(STORAGE_PREFIX.length);
          if (
            stripped === keyOrPrefix ||
            stripped.startsWith(keyOrPrefix) ||
            stripped.endsWith(`:${keyOrPrefix}`) ||
            stripped.includes(`:${keyOrPrefix}:`) ||
            stripped.includes(keyOrPrefix)
          ) {
            window.localStorage.removeItem(fullKey);
          }
        }
      }
    } catch {
      /* ignore */
    }
  }
}

/**
 * Complete wipe of all WTA SWR cached data (memory and localStorage).
 * Must be called on logout and auth user change.
 */
export function clearAllSwrCache(): void {
  memoryCache.clear();
  inFlightRequests.clear();
  lastRevalidationTime.clear();
  currentUserId = null;

  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith(STORAGE_PREFIX) || k.startsWith("wta-swr:"))) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        window.localStorage.removeItem(k);
      }
    } catch {
      /* ignore */
    }
  }

  // Notify any active components to re-sync
  for (const set of subscribers.values()) {
    set.forEach((cb) => {
      try {
        cb();
      } catch {}
    });
  }
}

/**
 * Background prefetch utility to warm cache for other tabs.
 * Honors navigator.connection.saveData.
 */
export async function prefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { scope?: "public" | "user"; userId?: string }
): Promise<T | undefined> {
  if (typeof window !== "undefined") {
    // Respect Data Saver mode
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) {
      return undefined;
    }
  }

  const resolvedKey = resolveCacheKey(key, opts?.scope || "public", opts?.userId);
  try {
    const fresh = await executeDedupedFetch(resolvedKey, fetcher, false);
    if (fresh !== undefined && fresh !== null) {
      setCachedValue(resolvedKey, fresh);
    }
    return fresh;
  } catch {
    return undefined;
  }
}
