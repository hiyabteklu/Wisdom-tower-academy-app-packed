/**
 * Admin-controlled content locks (packages, scopes/subjects, hubs).
 * Stored in public.content_locks. When no row exists, callers fall back
 * to static rules in content-availability.ts.
 */
import { supabase } from "@/lib/supabase";
import type { HubLockMode } from "@/data/content-availability";

export type LockMode = HubLockMode | "locked";

export type ContentLockRow = {
  lockKey: string;
  mode: LockMode;
  label: string | null;
  note: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
};

export function packageLockKey(packageId: string) {
  return `package:${packageId}`;
}

export function scopeLockKey(scopePath: string) {
  return `scope:${scopePath}`;
}

export function hubLockKey(scopePath: string, hub: string) {
  return `hub:${scopePath}:${hub}`;
}

function rowToLock(row: Record<string, unknown>): ContentLockRow {
  return {
    lockKey: String(row.lock_key),
    mode: String(row.mode) as LockMode,
    label: row.label != null ? String(row.label) : null,
    note: row.note != null ? String(row.note) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    updatedBy: row.updated_by != null ? String(row.updated_by) : null,
  };
}

export async function listAllLocks(): Promise<{
  locks: ContentLockRow[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("content_locks")
      .select("*")
      .order("lock_key", { ascending: true });
    if (error) return { locks: [], error: error.message };
    return {
      locks: (data || []).map((r) => rowToLock(r as Record<string, unknown>)),
    };
  } catch (e) {
    return {
      locks: [],
      error: e instanceof Error ? e.message : "Failed to load locks",
    };
  }
}

export async function getLock(
  lockKey: string
): Promise<{ lock?: ContentLockRow; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("content_locks")
      .select("*")
      .eq("lock_key", lockKey)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return {};
    return { lock: rowToLock(data as Record<string, unknown>) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setLock(opts: {
  lockKey: string;
  mode: LockMode;
  label?: string | null;
  note?: string | null;
  updatedBy?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("content_locks").upsert(
      {
        lock_key: opts.lockKey,
        mode: opts.mode,
        label: opts.label ?? null,
        note: opts.note ?? null,
        updated_at: new Date().toISOString(),
        updated_by: opts.updatedBy ?? null,
      },
      { onConflict: "lock_key" }
    );
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save lock",
    };
  }
}

export async function clearLock(
  lockKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("content_locks")
      .delete()
      .eq("lock_key", lockKey);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to clear lock",
    };
  }
}

/**
 * Resolve effective mode for a path/hub.
 * Priority (most specific wins):
 *   1. hub:{scope}:{hub}
 *   2. scope:{scopePath}
 *   3. package:{packageId}
 *   4. null → caller uses static fallback
 */
export async function resolveEffectiveLock(opts: {
  packageId?: string;
  scopePath?: string;
  hub?: string;
}): Promise<{ mode: LockMode | null; lockKey?: string; error?: string }> {
  const keys: string[] = [];
  if (opts.scopePath && opts.hub) {
    keys.push(hubLockKey(opts.scopePath, opts.hub));
  }
  if (opts.scopePath) keys.push(scopeLockKey(opts.scopePath));
  if (opts.packageId) keys.push(packageLockKey(opts.packageId));

  if (!keys.length) return { mode: null };

  try {
    const { data, error } = await supabase
      .from("content_locks")
      .select("*")
      .in("lock_key", keys);
    if (error) return { mode: null, error: error.message };

    const byKey = new Map(
      (data || []).map((r) => {
        const lock = rowToLock(r as Record<string, unknown>);
        return [lock.lockKey, lock] as const;
      })
    );

    for (const k of keys) {
      const hit = byKey.get(k);
      if (hit) return { mode: hit.mode, lockKey: k };
    }
    return { mode: null };
  } catch (e) {
    return {
      mode: null,
      error: e instanceof Error ? e.message : "Failed",
    };
  }
}

/** Map internal "locked" to UI-facing HubLockMode used by cards. */
export function toHubLockMode(mode: LockMode | null | undefined): HubLockMode | null {
  if (!mode) return null;
  if (mode === "locked") return "coming_soon";
  return mode;
}
