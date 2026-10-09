"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_CONTENT_TREE,
  type AdminNavNode,
} from "@/data/admin-nav";
import {
  listAllLocks,
  setLock,
  clearLock,
  packageLockKey,
  scopeLockKey,
  hubLockKey,
  type LockMode,
  type ContentLockRow,
} from "@/lib/content-locks";
import {
  Lock,
  Unlock,
  ChevronRight,
  FolderOpen,
  RefreshCw,
  Package,
  Shield,
} from "lucide-react";

const MODES: { id: LockMode; label: string; hint: string }[] = [
  {
    id: "open",
    label: "Open",
    hint: "Anyone can access (no purchase gate)",
  },
  {
    id: "require_purchase",
    label: "Require sign-in / purchase",
    hint: "Locked until user owns the package (or free-for-registered)",
  },
  {
    id: "coming_soon",
    label: "Coming soon",
    hint: "Shown as uploading / not ready",
  },
  {
    id: "locked",
    label: "Hard locked",
    hint: "Fully closed (same UI as coming soon)",
  },
];

const PACKAGE_SHORTCUTS: { id: string; label: string }[] = [
  { id: "freshman", label: "Freshman package" },
  { id: "ece-y3-sem-1", label: "ECE Year 3 · Semester 1" },
  { id: "ece-y3-sem-2", label: "ECE Year 3 · Semester 2" },
];

type Crumb = { id: string; label: string; node: AdminNavNode };

const HUB_IDS = [
  "books",
  "short-notes",
  "videos",
  "flashcards",
  "question-banks",
  "exams",
];

function modeBadge(mode: LockMode | undefined) {
  if (!mode)
    return (
      <span className="text-xs text-wisdom-muted border border-white/10 px-2 py-0.5 rounded-lg">
        default
      </span>
    );
  const colors: Record<LockMode, string> = {
    open: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    require_purchase: "border-amber-400/40 bg-amber-500/15 text-amber-200",
    coming_soon: "border-sky-400/40 bg-sky-500/15 text-sky-200",
    locked: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${colors[mode]}`}
    >
      {mode.replace("_", " ")}
    </span>
  );
}

export default function LocksPanel() {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [locks, setLocks] = useState<ContentLockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const lockMap = useMemo(() => {
    const m = new Map<string, ContentLockRow>();
    for (const l of locks) m.set(l.lockKey, l);
    return m;
  }, [locks]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listAllLocks();
    if (res.error) {
      setError(
        res.error.includes("relation") || res.error.includes("does not exist")
          ? "Table missing: run docs/content-locks-setup.sql in Supabase SQL Editor."
          : res.error
      );
      setLocks([]);
    } else {
      setLocks(res.locks);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function applyMode(lockKey: string, mode: LockMode, label?: string) {
    setBusyKey(lockKey);
    const res = await setLock({ lockKey, mode, label: label || null });
    setBusyKey("");
    if (!res.ok) {
      setToast(res.error || "Save failed");
      return;
    }
    setToast(`Saved · ${lockKey} → ${mode}`);
    void load();
  }

  async function resetToDefault(lockKey: string) {
    setBusyKey(lockKey);
    const res = await clearLock(lockKey);
    setBusyKey("");
    if (!res.ok) {
      setToast(res.error || "Clear failed");
      return;
    }
    setToast(`Cleared · ${lockKey} (uses code default)`);
    void load();
  }

  function enter(node: AdminNavNode) {
    setCrumbs((c) => [...c, { id: node.id, label: node.label, node }]);
  }

  function goTo(index: number) {
    setCrumbs((c) => c.slice(0, index + 1));
  }

  function resetRoot() {
    setCrumbs([]);
  }

  const current = crumbs[crumbs.length - 1]?.node;
  const listNodes =
    crumbs.length === 0 ? ADMIN_CONTENT_TREE : current?.children || [];
  const scopePath = current?.scopePath;
  const packageId = current?.packageId;
  const isHub = Boolean(scopePath) && HUB_IDS.includes(current?.id || "");

  const activeKey = isHub
    ? hubLockKey(scopePath!, current!.id)
    : scopePath
      ? scopeLockKey(scopePath)
      : packageId
        ? packageLockKey(packageId)
        : null;

  const activeLock = activeKey ? lockMap.get(activeKey) : undefined;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Content locks
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            Lock or unlock packages, subjects, and hubs (books, exams, etc.).
            Specific exams stay controlled by the Published checkbox in Content.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Package-level shortcuts */}
      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted flex items-center gap-2">
          <Package className="w-3.5 h-3.5" />
          Package shortcuts
        </p>
        <ul className="space-y-2">
          {PACKAGE_SHORTCUTS.map((p) => {
            const key = packageLockKey(p.id);
            const lock = lockMap.get(key);
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-wisdom-dark/40 px-3 py-2.5"
              >
                <span className="font-semibold text-white text-sm min-w-[10rem]">
                  {p.label}
                </span>
                {modeBadge(lock?.mode)}
                <div className="flex flex-wrap gap-1.5 ml-auto">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={busyKey === key}
                      title={m.hint}
                      onClick={() => applyMode(key, m.id, p.label)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        lock?.mode === m.id
                          ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                          : "border-white/12 text-wisdom-muted hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={busyKey === key || !lock}
                    onClick={() => resetToDefault(key)}
                    className="px-2.5 py-1 rounded-lg text-xs border border-white/10 text-wisdom-muted hover:text-white disabled:opacity-40"
                  >
                    Default
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tree navigation */}
      <nav className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={resetRoot}
          className="text-amber-300 hover:underline font-medium"
        >
          Academy
        </button>
        {crumbs.map((c, i) => (
          <span key={c.id + i} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-wisdom-muted" />
            <button
              type="button"
              onClick={() => goTo(i)}
              className={
                i === crumbs.length - 1
                  ? "text-white font-semibold"
                  : "text-cyan-300 hover:underline"
              }
            >
              {c.label}
            </button>
          </span>
        ))}
      </nav>

      {/* Controls for current node */}
      {activeKey && (
        <div className="rounded-2xl border border-amber-400/25 bg-wisdom-card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeLock?.mode === "open" || !activeLock ? (
              <Unlock className="w-4 h-4 text-emerald-300" />
            ) : (
              <Lock className="w-4 h-4 text-rose-300" />
            )}
            <p className="font-semibold text-white">
              {current?.label || "Selection"}
            </p>
            {modeBadge(activeLock?.mode)}
          </div>
          <p className="text-xs text-wisdom-muted font-mono">{activeKey}</p>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={busyKey === activeKey}
                title={m.hint}
                onClick={() =>
                  applyMode(activeKey, m.id, current?.label || activeKey)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border ${
                  activeLock?.mode === m.id
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                    : "border-white/12 text-wisdom-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {m.id === "open" ? (
                  <Unlock className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                {m.label}
              </button>
            ))}
            <button
              type="button"
              disabled={busyKey === activeKey || !activeLock}
              onClick={() => resetToDefault(activeKey)}
              className="px-3 py-2 rounded-xl text-sm border border-white/12 text-wisdom-muted hover:text-white disabled:opacity-40"
            >
              Reset to code default
            </button>
          </div>
          <p className="text-xs text-wisdom-muted">
            Hub-level locks override subject locks; subject locks override package
            locks. Individual exams: use <strong className="text-white">Published</strong>{" "}
            in the Content tab.
          </p>
        </div>
      )}

      {/* Children list */}
      {!isHub && listNodes.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-2">
          {listNodes.map((node) => {
            const childKey =
              node.scopePath && HUB_IDS.includes(node.id)
                ? hubLockKey(node.scopePath, node.id)
                : node.scopePath
                  ? scopeLockKey(node.scopePath)
                  : node.packageId
                    ? packageLockKey(node.packageId)
                    : null;
            const childLock = childKey ? lockMap.get(childKey) : undefined;
            return (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => enter(node)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-white/12 bg-wisdom-card px-4 py-3.5 text-left hover:border-amber-400/40 transition-colors"
                >
                  <FolderOpen className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="font-semibold text-white block truncate">
                      {node.label}
                    </span>
                    {childLock && (
                      <span className="mt-1 inline-block">
                        {modeBadge(childLock.mode)}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4 text-wisdom-muted" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isHub && (
        <p className="text-sm text-wisdom-muted text-center py-6 border border-dashed border-white/15 rounded-2xl">
          This is a hub. Use the buttons above to lock/unlock the whole hub.
          Open the <strong className="text-white">Content</strong> tab to publish
          or unpublish individual exams and items.
        </p>
      )}

      {locks.length > 0 && crumbs.length === 0 && (
        <div className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-2">
            All active overrides ({locks.length})
          </p>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto text-xs font-mono">
            {locks.map((l) => (
              <li
                key={l.lockKey}
                className="flex items-center gap-2 text-wisdom-muted"
              >
                <span className="text-cyan-300/90 truncate">{l.lockKey}</span>
                {modeBadge(l.mode)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
