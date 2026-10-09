"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  getMemoryCache,
  getLocalStorageCache,
  setMemoryCache,
  setLocalStorageCache,
  resolveCacheKey,
  executeDedupedFetch,
  subscribeToCacheKey,
  getActiveUserId,
} from "@/lib/swr-cache";

// Isomorphic layout effect to avoid Next.js SSR hydration warnings while reading before paint
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface UseCachedQueryOptions<T> {
  initialData?: T;
  ttlMs?: number;
  scope?: "public" | "user";
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  isEqual?: (a: T, b: T) => boolean;
  enabled?: boolean;
}

export interface UseCachedQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isRevalidating: boolean;
  error?: unknown;
  refresh: () => Promise<void>;
}

function defaultIsEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  if (a === null || b === null) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: UseCachedQueryOptions<T>
): UseCachedQueryResult<T> {
  const {
    initialData,
    ttlMs = 0,
    scope = "public",
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    isEqual = defaultIsEqual,
    enabled = true,
  } = opts || {};

  // Resolve cache key based on scope and current user
  const resolvedKey = useMemo(() => {
    return resolveCacheKey(key, scope);
  }, [key, scope]);

  // Read Layer 1: Memory cache (instant on client-side route navigation)
  // Fall back to Layer 3: initialData (server/client hydration match)
  const initialResolvedValue = useMemo(() => {
    const mem = getMemoryCache<T>(resolvedKey);
    if (mem && mem.data !== undefined) {
      return mem.data;
    }
    return initialData;
  }, [resolvedKey, initialData]);

  const [data, setData] = useState<T | undefined>(initialResolvedValue);
  const [error, setError] = useState<unknown>(undefined);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);

  // Keep ref to latest data & options to prevent stale closures and extra re-renders
  const dataRef = useRef<T | undefined>(data);
  dataRef.current = data;

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;

  // Layer 2: Read localStorage in layout effect (client-only, before browser paint)
  useIsomorphicLayoutEffect(() => {
    if (dataRef.current === undefined && typeof window !== "undefined") {
      const local = getLocalStorageCache<T>(resolvedKey);
      if (local && local.data !== undefined) {
        setMemoryCache(resolvedKey, local.data, local.ts);
        setData(local.data);
        dataRef.current = local.data;
      }
    }
  }, [resolvedKey]);

  // Revalidate worker
  const performRevalidation = useCallback(
    async (force = false) => {
      if (!enabled) return;

      setIsRevalidating(true);
      try {
        const fresh = await executeDedupedFetch(
          resolvedKey,
          fetcherRef.current,
          force
        );

        // Verify fresh data is valid and not an error object
        if (fresh !== undefined && fresh !== null) {
          const isErrorPayload =
            typeof fresh === "object" &&
            "error" in (fresh as Record<string, unknown>) &&
            Boolean((fresh as Record<string, unknown>).error);

          if (isErrorPayload && dataRef.current !== undefined) {
            setError((fresh as Record<string, unknown>).error);
            return;
          }

          const isSame =
            dataRef.current !== undefined &&
            isEqualRef.current(dataRef.current, fresh);

          if (!isSame) {
            setData(fresh);
            dataRef.current = fresh;
            setMemoryCache(resolvedKey, fresh);
            setLocalStorageCache(resolvedKey, fresh);
          } else {
            // Update timestamp silently without causing a component re-render
            const now = Date.now();
            setMemoryCache(resolvedKey, fresh, now);
            setLocalStorageCache(resolvedKey, fresh, now);
          }
          setError(undefined);
        }
      } catch (err) {
        // Network failure / offline: keep showing cached data silently.
        // Never replace good cached data with an error or empty state.
        setError(err);
      } finally {
        setIsRevalidating(false);
      }
    },
    [resolvedKey, enabled]
  );

  // Manual refresh helper
  const refresh = useCallback(async () => {
    await performRevalidation(true);
  }, [performRevalidation]);

  // Initial mount revalidation
  useEffect(() => {
    if (!enabled) return;

    // Check if cached entry is still within ttlMs (default ttlMs = 0 -> always revalidate on mount)
    const mem = getMemoryCache<T>(resolvedKey);
    const now = Date.now();
    const isStale = !mem || ttlMs === 0 || now - mem.ts > ttlMs;

    if (isStale) {
      void performRevalidation(false);
    }
  }, [resolvedKey, enabled, ttlMs, performRevalidation]);

  // Event Listeners: Tab visibility, network reconnect, hard refresh, and invalidations
  useEffect(() => {
    if (!enabled) return;

    // 1. App Hard Refresh event (triggered by top refresh button or native app shell)
    const handleWtaRefresh = () => {
      void performRevalidation(true);
    };
    window.addEventListener("wta-refresh", handleWtaRefresh);

    // 2. Tab focus / visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && revalidateOnFocus) {
        const mem = getMemoryCache<T>(resolvedKey);
        const isStale = !mem || ttlMs === 0 || Date.now() - mem.ts > ttlMs;
        if (isStale) {
          void performRevalidation(false);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Online reconnect
    const handleOnline = () => {
      if (revalidateOnReconnect) {
        void performRevalidation(true);
      }
    };
    window.addEventListener("online", handleOnline);

    // 4. Invalidation subscriber
    const unsubscribe = subscribeToCacheKey(resolvedKey, () => {
      void performRevalidation(true);
    });

    return () => {
      window.removeEventListener("wta-refresh", handleWtaRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      unsubscribe();
    };
  }, [
    resolvedKey,
    enabled,
    ttlMs,
    revalidateOnFocus,
    revalidateOnReconnect,
    performRevalidation,
  ]);

  // isLoading rule: true ONLY when there is no data at all from any layer
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
    isRevalidating,
    error,
    refresh,
  };
}
