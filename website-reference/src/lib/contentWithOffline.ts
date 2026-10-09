/**
 * Offline-aware wrappers around content.ts
 * - Cache resource lists when online
 * - Read from cache when offline
 * - Mirror progress locally
 * - Queue saveProgress / saveExamAttempt and flush when online
 */

export * from "@/lib/content";

import {
  listResources as listResourcesOnline,
  getMyProgress as getMyProgressOnline,
  saveProgress as saveProgressOnline,
  saveExamAttempt as saveExamAttemptOnline,
  type LearningResource,
  type ProgressMeta,
  type HubId,
} from "@/lib/content";
import { cleanCorruptAuthTokens } from "@/lib/supabase";
import {
  cacheResources,
  readCachedResources,
  cacheProgress,
  readCachedProgress,
  enqueueSync,
  readQueue,
  writeQueue,
  isProbablyOffline,
  markOffline,
  type QueuedSave,
} from "@/lib/offlineStore";

function resourceCacheKey(opts: {
  scopePath?: string;
  hub?: HubId;
  packageId?: string;
  publishedOnly?: boolean;
}) {
  const normHub = (opts.hub as string) === "references" ? "short-notes" : opts.hub;
  return [
    opts.scopePath || "",
    normHub || "",
    opts.packageId || "",
    opts.publishedOnly ? "1" : "0",
  ].join("|");
}

export async function listResources(opts: {
  scopePath?: string;
  hub?: HubId;
  packageId?: string;
  publishedOnly?: boolean;
  skipAuthCheck?: boolean;
}): Promise<{ items: LearningResource[]; error?: string }> {
  const key = resourceCacheKey(opts);

  // Fast offline path if navigator specifically reports offline
  if (isProbablyOffline()) {
    const cached = readCachedResources<LearningResource>(key);
    if (cached.length) return { items: cached };
    return {
      items: [],
      error: "You are currently offline. Connect to the internet to load and cache materials.",
    };
  }

  try {
    // Tolerant timeout guard (10s) to handle slower 3G/cellular networks without prematurely failing
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<{ items: LearningResource[]; error?: string }>((resolve) => {
      timer = setTimeout(() => {
        resolve({ items: [], error: "Network timeout. Please retry." });
      }, 10000);
    });

    const res = await Promise.race([
      listResourcesOnline(opts),
      timeoutPromise,
    ]);
    if (timer) clearTimeout(timer);

    // If online fetch succeeded with items, cache them and return
    if (res.items && res.items.length > 0) {
      markOffline(false);
      cacheResources(key, res.items);
      if (opts.scopePath) {
        const eceMatch = opts.scopePath.match(/^ece\/(sem-[12])\/([^/]+)$/);
        if (eceMatch) {
          const otherSem = eceMatch[1] === "sem-1" ? "sem-2" : "sem-1";
          const altKey = resourceCacheKey({
            ...opts,
            scopePath: `ece/${otherSem}/${eceMatch[2]}`,
          });
          cacheResources(altKey, res.items);
        }
      }
      return res;
    }

    // If online fetch returned an error (e.g. network failure, timeout, auth issue)
    if (res.error) {
      const isKeyOrCrypto =
        res.error.toLowerCase().includes("key") ||
        res.error.toLowerCase().includes("crypto") ||
        res.error.toLowerCase().includes("token") ||
        res.error.toLowerCase().includes("pgrst") ||
        res.error.toLowerCase().includes("jwt") ||
        res.error.toLowerCase().includes("syntax") ||
        res.error.toLowerCase().includes("relation");

      if (isKeyOrCrypto) {
        cleanCorruptAuthTokens();
      }

      // ALWAYS check cache first — prefer cache over empty error
      const cached = readCachedResources<LearningResource>(key);
      if (cached.length) {
        return { items: cached };
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return {
          items: [],
          error: "You are currently offline. Connect to the internet to load this hub.",
        };
      }
      return {
        items: [],
        error: isKeyOrCrypto
          ? "Unable to load materials right now. Tap Retry to reconnect."
          : res.error,
      };
    }

    // Online fetch returned 0 items cleanly (no error):
    // Check if cache already has entries for this key (silent soft-offline protection)
    const cached = readCachedResources<LearningResource>(key);
    if (cached.length) {
      return { items: cached };
    }

    // Truly empty hub online: both online returned 0 rows AND cache has 0 entries
    return { items: [] };
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : "Failed";
    const isKeyOrCrypto =
      rawMsg.toLowerCase().includes("key") ||
      rawMsg.toLowerCase().includes("crypto") ||
      rawMsg.toLowerCase().includes("token") ||
      rawMsg.toLowerCase().includes("pgrst") ||
      rawMsg.toLowerCase().includes("jwt") ||
      rawMsg.toLowerCase().includes("syntax") ||
      rawMsg.toLowerCase().includes("relation");

    if (isKeyOrCrypto) {
      cleanCorruptAuthTokens();
    }

    const cached = readCachedResources<LearningResource>(key);
    if (cached.length) return { items: cached };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return {
        items: [],
        error: "You are currently offline. Connect to the internet to load this hub.",
      };
    }
    return {
      items: [],
      error: "Unable to load materials right now. Tap Retry to reconnect.",
    };
  }
}

export async function getMyProgress(resourceId: string): Promise<{
  pct: number;
  lastPage: number | null;
  totalSeconds: number;
  focusSeconds: number;
  meta: ProgressMeta;
}> {
  const local = readCachedProgress(resourceId);

  if (isProbablyOffline()) {
    if (local) {
      return {
        pct: local.pct,
        lastPage: local.lastPage,
        totalSeconds: local.totalSeconds,
        focusSeconds: local.focusSeconds,
        meta: local.meta as ProgressMeta,
      };
    }
    return { pct: 0, lastPage: null, totalSeconds: 0, focusSeconds: 0, meta: {} };
  }

  try {
    const remote = await getMyProgressOnline(resourceId);
    // Prefer higher local progress if user practiced offline
    if (local && local.pct > remote.pct) {
      return {
        pct: local.pct,
        lastPage: local.lastPage,
        totalSeconds: Math.max(local.totalSeconds, remote.totalSeconds),
        focusSeconds: Math.max(local.focusSeconds, remote.focusSeconds),
        meta: { ...remote.meta, ...local.meta } as ProgressMeta,
      };
    }
    cacheProgress(resourceId, {
      pct: remote.pct,
      lastPage: remote.lastPage,
      totalSeconds: remote.totalSeconds,
      focusSeconds: remote.focusSeconds,
      meta: remote.meta as Record<string, unknown>,
    });
    return remote;
  } catch {
    if (local) {
      return {
        pct: local.pct,
        lastPage: local.lastPage,
        totalSeconds: local.totalSeconds,
        focusSeconds: local.focusSeconds,
        meta: local.meta as ProgressMeta,
      };
    }
    return { pct: 0, lastPage: null, totalSeconds: 0, focusSeconds: 0, meta: {} };
  }
}

export async function saveProgress(opts: {
  resourceId: string;
  progressPct: number;
  lastPage?: number;
  addSeconds?: number;
  addFocusSeconds?: number;
  meta?: ProgressMeta;
}): Promise<{ ok: boolean; error?: string }> {
  const prev = readCachedProgress(opts.resourceId);
  const next = {
    pct: Math.max(prev?.pct || 0, Math.min(100, opts.progressPct)),
    lastPage: opts.lastPage ?? prev?.lastPage ?? null,
    totalSeconds: (prev?.totalSeconds || 0) + Math.max(0, opts.addSeconds || 0),
    focusSeconds:
      (prev?.focusSeconds || 0) + Math.max(0, opts.addFocusSeconds || 0),
    meta: {
      ...(prev?.meta || {}),
      ...(opts.meta || {}),
    },
  };
  cacheProgress(opts.resourceId, next);

  if (isProbablyOffline()) {
    enqueueSync({
      kind: "progress",
      id: `p-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  try {
    return await saveProgressOnline(opts);
  } catch {
    enqueueSync({
      kind: "progress",
      id: `p-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }
}

export async function saveExamAttempt(opts: {
  resourceId: string;
  score: number;
  total: number;
  answers: Record<number, number>;
  title?: string;
  scopeId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  // Always keep local quiz meta for offline retakes
  const prev = readCachedProgress(opts.resourceId);
  const accuracy =
    opts.total > 0 ? Math.round((opts.score / opts.total) * 1000) / 10 : 0;
  cacheProgress(opts.resourceId, {
    pct: Math.max(prev?.pct || 0, accuracy),
    lastPage: prev?.lastPage ?? null,
    totalSeconds: prev?.totalSeconds || 0,
    focusSeconds: prev?.focusSeconds || 0,
    meta: {
      ...(prev?.meta || {}),
      quiz: {
        attempted: opts.total,
        correct: opts.score,
        total: opts.total,
        accuracy,
        submitted: true,
        wrong: Math.max(0, opts.total - opts.score),
      },
    },
  });

  if (isProbablyOffline()) {
    enqueueSync({
      kind: "exam",
      id: `e-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  try {
    return await saveExamAttemptOnline(opts);
  } catch {
    enqueueSync({
      kind: "exam",
      id: `e-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }
}

/** Push queued offline saves to Supabase when connection returns. */
export async function flushOfflineQueue(): Promise<void> {
  if (typeof window === "undefined") return;
  if (isProbablyOffline()) return;

  const q = readQueue();
  if (!q.length) return;

  const remaining: QueuedSave[] = [];
  for (const item of q) {
    try {
      if (item.kind === "progress") {
        const r = await saveProgressOnline(item.payload);
        if (!r.ok) remaining.push(item);
      } else {
        const r = await saveExamAttemptOnline(item.payload);
        if (!r.ok) remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
}
