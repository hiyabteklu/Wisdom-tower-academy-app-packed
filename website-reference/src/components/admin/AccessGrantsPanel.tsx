"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAccessGrants,
  grantAccess,
  grantAllPackages,
  revokeAccess,
  revokeAllForEmail,
  ALL_PACKAGES_ID,
  type AccessGrant,
} from "@/lib/access-grants";
import { academyPackages } from "@/data/packages";
import {
  KeyRound,
  Plus,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Search,
} from "lucide-react";

type Props = { adminEmail: string };

export default function AccessGrantsPanel({ adminEmail }: Props) {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState<string>(ALL_PACKAGES_ID);
  const [note, setNote] = useState("Beta access");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listAccessGrants();
    if (res.error) {
      setError(
        res.error.includes("relation") || res.error.includes("does not exist")
          ? "Table missing: run docs/access-grants-setup.sql in Supabase SQL Editor."
          : res.error
      );
      setGrants([]);
    } else {
      setGrants(res.grants);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return grants;
    return grants.filter(
      (g) =>
        g.email.includes(q) ||
        g.packageId.toLowerCase().includes(q) ||
        (g.packageName || "").toLowerCase().includes(q) ||
        (g.note || "").toLowerCase().includes(q)
    );
  }, [grants, filter]);

  async function onGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setToast("Email is required");
      return;
    }
    setBusy(true);

    if (packageId === ALL_PACKAGES_ID) {
      const res = await grantAllPackages({
        email,
        grantedBy: adminEmail,
        note: note || "Beta / full access",
      });
      setBusy(false);
      if (!res.ok) {
        setToast(res.error || "Grant failed");
        return;
      }
      setToast(`Granted full access to ${email.trim().toLowerCase()} (${res.count} rows)`);
    } else {
      const res = await grantAccess({
        email,
        packageId,
        grantedBy: adminEmail,
        note: note || null,
        source: "beta",
      });
      setBusy(false);
      if (!res.ok) {
        setToast(res.error || "Grant failed");
        return;
      }
      setToast(`Granted ${packageId} → ${email.trim().toLowerCase()}`);
    }

    setEmail("");
    void load();
  }

  async function onRevoke(id: string, label: string) {
    if (!confirm(`Revoke access for ${label}?`)) return;
    setBusy(true);
    const res = await revokeAccess(id);
    setBusy(false);
    if (!res.ok) {
      setToast(res.error || "Revoke failed");
      return;
    }
    setToast("Revoked");
    void load();
  }

  async function onRevokeEmail(em: string) {
    if (!confirm(`Revoke ALL grants for ${em}?`)) return;
    setBusy(true);
    const res = await revokeAllForEmail(em);
    setBusy(false);
    if (!res.ok) {
      setToast(res.error || "Revoke failed");
      return;
    }
    setToast(`Removed ${res.removed ?? 0} grant(s) for ${em}`);
    void load();
  }

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
            <KeyRound className="w-5 h-5 text-amber-400" />
            Access grants
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5 max-w-xl">
            Whitelist emails for beta users: unlock specific packages or the whole
            catalog without payment. Works even before they sign up (matched by email).
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

      <form
        onSubmit={onGrant}
        className="rounded-2xl border border-amber-400/25 bg-wisdom-card p-4 sm:p-5 space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Grant access
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-xs text-wisdom-muted sm:col-span-2">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beta.user@example.com"
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white"
              autoComplete="off"
            />
          </label>
          <label className="block text-xs text-wisdom-muted">
            Package
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white"
            >
              <option value={ALL_PACKAGES_ID}>★ All packages (full access)</option>
              {academyPackages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-wisdom-muted">
            Note (optional)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Beta tester · March cohort"
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold hover:bg-amber-400 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {busy ? "Saving…" : "Grant access"}
        </button>
        <p className="text-xs text-wisdom-muted">
          User does not need an account yet. When they sign in with this email,
          packages unlock automatically: no cart or payment.
        </p>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-wisdom-muted" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by email or package…"
            className="w-full rounded-xl border border-white/12 bg-wisdom-card pl-9 pr-3 py-2 text-sm text-white"
          />
        </div>
        <p className="text-xs text-wisdom-muted">{filtered.length} grant(s)</p>
      </div>

      {loading && grants.length === 0 ? (
        <p className="py-10 text-center text-wisdom-muted text-sm">Loading grants…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-wisdom-muted text-sm">
          No access grants yet. Add a beta email above.
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((g) => (
            <li
              key={g.id}
              className="rounded-2xl border border-white/12 bg-wisdom-card p-3.5 flex flex-wrap items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">{g.email}</p>
                <p className="text-xs text-wisdom-muted mt-0.5">
                  <span
                    className={
                      g.packageId === ALL_PACKAGES_ID
                        ? "text-amber-300 font-semibold"
                        : "text-cyan-300"
                    }
                  >
                    {g.packageName || g.packageId}
                  </span>
                  {g.note ? ` · ${g.note}` : ""}
                  {g.grantedBy ? ` · by ${g.grantedBy}` : ""}
                  {g.userId ? " · linked account" : " · email only (pre-signup)"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRevoke(g.id, `${g.email} / ${g.packageId}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-400/30 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRevokeEmail(g.email)}
                  className="px-3 py-1.5 rounded-lg border border-white/12 text-xs text-wisdom-muted hover:text-white disabled:opacity-40"
                  title="Remove every grant for this email"
                >
                  Revoke all
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
