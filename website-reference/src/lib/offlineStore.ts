/** Device-local offline store for learning resources + progress + sync queue. */

const RESOURCES_KEY = "wta_offline_resources_v1";
const PROGRESS_KEY = "wta_offline_progress_v1";
const QUEUE_KEY = "wta_offline_sync_queue_v1";

export type QueuedSave =
  | {
      kind: "progress";
      id: string;
      payload: {
        resourceId: string;
        progressPct: number;
        lastPage?: number;
        addSeconds?: number;
        addFocusSeconds?: number;
        meta?: Record<string, unknown>;
      };
      createdAt: string;
    }
  | {
      kind: "exam";
      id: string;
      payload: {
        resourceId: string;
        score: number;
        total: number;
        answers: Record<number, number>;
        title?: string;
        scopeId?: string;
      };
      createdAt: string;
    };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Never overwrite existing cached materials with an empty array */
export function cacheResources(
  cacheKey: string,
  items: unknown[]
): void {
  if (typeof window === "undefined") return;
  if (!items || items.length === 0) return;
  try {
    const all = safeParse<Record<string, unknown[]>>(
      localStorage.getItem(RESOURCES_KEY),
      {}
    );
    all[cacheKey] = items;
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(all));
  } catch {
    /* quota */
  }
}

function matchesHub(item: unknown, targetHub: string): boolean {
  if (!targetHub) return true;
  const it = item as { hub?: string; contentType?: string };
  const h = String(it.hub || "");
  if (h === targetHub) return true;
  if (targetHub === "short-notes" && (h === "references" || it.contentType === "markdown")) return true;
  if (targetHub === "references" && (h === "short-notes" || it.contentType === "markdown")) return true;
  if (targetHub === "books" && (h === "books" || it.contentType === "pdf")) return true;
  if (targetHub === "life-savers" && (h === "life-savers" || it.contentType === "pdf")) return true;
  if (targetHub === "flashcards" && (h === "flashcards" || it.contentType === "flashcard_deck")) return true;
  if (targetHub === "question-banks" && (h === "question-banks" || it.contentType === "quiz")) return true;
  if (targetHub === "exams" && (h === "exams" || it.contentType === "exam")) return true;
  if (targetHub === "videos" && (h === "videos" || it.contentType === "video_url")) return true;
  return false;
}

/**
 * Resilient reader for cached learning resources.
 * Supports:
 * - Direct key match
 * - Hub alias matching (short-notes <-> references)
 * - Key shape differences (packageId present vs omitted, publishedOnly flag differences)
 * - ECE cross-semester swapped keys and course slug matching
 * - All-hubs list (ResourceHubGrid) extraction when individual hub key isn't cached
 */
export function readCachedResources<T>(cacheKey: string): T[] {
  if (typeof window === "undefined") return [];
  const all = safeParse<Record<string, T[]>>(
    localStorage.getItem(RESOURCES_KEY),
    {}
  );
  if (!all || typeof all !== "object") return [];

  // 1. Direct key match
  if (all[cacheKey]?.length) return all[cacheKey];

  const parts = cacheKey.split("|");
  const scopePath = parts[0] || "";
  const hub = parts[1] || "";
  const packageId = parts[2] || "";
  const publishedOnly = parts[3] || "1";

  // 2. Hub alias check (short-notes <-> references are interchangeable)
  if (hub === "short-notes" || hub === "references") {
    const altHub = hub === "short-notes" ? "references" : "short-notes";
    const altKey = [scopePath, altHub, packageId, publishedOnly].join("|");
    if (all[altKey]?.length) return all[altKey];
  }

  // 3. packageId mismatch check (e.g. key has packageId vs empty, or different publishedOnly flag)
  for (const [k, items] of Object.entries(all)) {
    if (!items?.length) continue;
    const p = k.split("|");
    const kScope = p[0] || "";
    const kHub = p[1] || "";
    if (kScope === scopePath) {
      if (
        kHub === hub ||
        (hub === "short-notes" && kHub === "references") ||
        (hub === "references" && kHub === "short-notes")
      ) {
        return items;
      }
    }
  }

  // 4. ECE cross-semester check
  const eceMatch = scopePath.match(/^ece\/(sem-[12])\/([^/]+)$/);
  if (eceMatch) {
    const otherSem = eceMatch[1] === "sem-1" ? "sem-2" : "sem-1";
    const courseSlug = eceMatch[2];
    const swappedKey = [`ece/${otherSem}/${courseSlug}`, ...parts.slice(1)].join("|");
    if (all[swappedKey]?.length) return all[swappedKey];

    for (const [k, val] of Object.entries(all)) {
      if (
        k.includes(courseSlug) &&
        (!hub ||
          k.includes(`|${hub}|`) ||
          (hub === "short-notes" && k.includes("|references|")) ||
          (hub === "references" && k.includes("|short-notes|"))) &&
        val?.length
      ) {
        return val;
      }
    }
  }

  // 5. Check if all-hubs list was cached for this scopePath (e.g. from ResourceHubGrid: `${scopePath}|||1`)
  for (const [k, items] of Object.entries(all)) {
    if (!items?.length) continue;
    const p = k.split("|");
    if (p[0] === scopePath && (!p[1] || p[1] === "")) {
      if (hub) {
        const filtered = items.filter((it: unknown) => matchesHub(it, hub));
        if (filtered.length) return filtered;
      } else {
        return items;
      }
    }
  }

  // 6. Generic scopePath fallback: any key that starts with `${scopePath}|`
  for (const [k, items] of Object.entries(all)) {
    if (!items?.length) continue;
    if (k.startsWith(`${scopePath}|`)) {
      if (hub) {
        const filtered = items.filter((it: unknown) => matchesHub(it, hub));
        if (filtered.length) return filtered;
      }
    }
  }

  // 7. Freshman subject alias check (mathematics <-> math-natural)
  if (scopePath.includes("math-natural") || scopePath.includes("mathematics")) {
    const altScope = scopePath.includes("math-natural")
      ? scopePath.replace("math-natural", "mathematics")
      : scopePath.replace("mathematics", "math-natural");
    for (const [k, items] of Object.entries(all)) {
      if (!items?.length) continue;
      if (k.startsWith(`${altScope}|`)) {
        if (hub) {
          const filtered = items.filter((it: unknown) => matchesHub(it, hub));
          if (filtered.length) return filtered;
        } else {
          return items;
        }
      }
    }
  }

  return [];
}

export function cacheProgress(
  resourceId: string,
  data: {
    pct: number;
    lastPage: number | null;
    totalSeconds: number;
    focusSeconds: number;
    meta: Record<string, unknown>;
  }
): void {
  if (typeof window === "undefined") return;
  try {
    const all = safeParse<Record<string, typeof data>>(
      localStorage.getItem(PROGRESS_KEY),
      {}
    );
    all[resourceId] = data;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* quota */
  }
}

export function readCachedProgress(resourceId: string): {
  pct: number;
  lastPage: number | null;
  totalSeconds: number;
  focusSeconds: number;
  meta: Record<string, unknown>;
} | null {
  if (typeof window === "undefined") return null;
  const all = safeParse<Record<string, {
    pct: number;
    lastPage: number | null;
    totalSeconds: number;
    focusSeconds: number;
    meta: Record<string, unknown>;
  }>>(localStorage.getItem(PROGRESS_KEY), {});
  return all[resourceId] || null;
}

export function enqueueSync(item: QueuedSave): void {
  if (typeof window === "undefined") return;
  try {
    const q = safeParse<QueuedSave[]>(localStorage.getItem(QUEUE_KEY), []);
    q.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* quota */
  }
}

export function readQueue(): QueuedSave[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(QUEUE_KEY), []);
}

export function writeQueue(q: QueuedSave[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

let _offlineOverride: boolean | null = null;

export function markOffline(offline: boolean): void {
  _offlineOverride = offline ? true : null;
}

export function isProbablyOffline(): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }
  // If navigator is explicitly online, always prefer trying online
  if (typeof navigator !== "undefined" && navigator.onLine === true) {
    _offlineOverride = null;
    return false;
  }
  return _offlineOverride === true;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    _offlineOverride = null;
  });
  window.addEventListener("offline", () => {
    _offlineOverride = true;
  });
}
