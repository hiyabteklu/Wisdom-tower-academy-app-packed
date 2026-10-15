"use client";

/**
 * Notifications v2, slice R3-b3 (session R3-D). `[~]` NOT compiled, not opened in a browser.
 *
 * Audience picker for the admin composer. The chips are the registration levels (ACADEMIC_LEVEL_OPTIONS,
 * the same list as the sign-up form) plus any other level text students typed, plus the admin's own custom
 * audiences. Several chips can be selected: the result is the UNION, one notification per student.
 * Empty selection = Everyone. Counts come from the live database (functions of docs/sql/notifications_v2.sql,
 * applied 2026-10-15): admin_audience_level_counts, admin_count_notification_audience,
 * admin_list_notification_audiences, admin_add_notification_audience, admin_delete_notification_audience.
 * The value is the string[] the send route and the scheduler take: level labels and `custom:<uuid>`.
 */

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ACADEMIC_LEVEL_OPTIONS } from "@/lib/academic-levels";

type LevelCounts = {
  total: number;
  no_level: number;
  levels: { level: string; n: number }[];
};

type CustomAudience = {
  id: string;
  label: string;
  match_levels: string[];
  match_package_ids: string[];
  students: number;
};

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export default function NotificationAudiencePicker({
  value,
  onChange,
  onCountChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  onCountChange?: (count: number | null) => void;
}) {
  const [counts, setCounts] = useState<LevelCounts | null>(null);
  const [customs, setCustoms] = useState<CustomAudience[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLevels, setNewLevels] = useState<string[]>([]);
  const [newPackages, setNewPackages] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [c, a] = await Promise.all([
      supabase.rpc("admin_audience_level_counts"),
      supabase.rpc("admin_list_notification_audiences"),
    ]);
    if (c.error) setError(c.error.message);
    else setCounts(c.data as LevelCounts);
    if (a.error) setError(a.error.message);
    else setCustoms(Array.isArray(a.data) ? (a.data as CustomAudience[]) : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live count of the current selection.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (value.length === 0) {
        const total = counts ? counts.total : null;
        setCount(total);
        onCountChange?.(total);
        return;
      }
      const { data, error: err } = await supabase.rpc("admin_count_notification_audience", {
        p_audiences: value,
      });
      if (cancelled) return;
      const n = err || typeof data !== "number" ? null : data;
      setCount(n);
      onCountChange?.(n);
    }
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, counts]);

  const countFor = (label: string): number | null => {
    const row = counts?.levels.find((l) => same(l.level, label));
    return counts ? (row ? row.n : 0) : null;
  };

  const has = (entry: string) => value.some((v) => same(v, entry));
  const toggle = (entry: string) =>
    onChange(has(entry) ? value.filter((v) => !same(v, entry)) : [...value, entry]);

  const extraLevels = (counts?.levels ?? []).filter(
    (l) => !ACADEMIC_LEVEL_OPTIONS.some((o) => same(o, l.level))
  );

  async function addCustom() {
    setBusy(true);
    setError(null);
    const packages = newPackages
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const { error: err } = await supabase.rpc("admin_add_notification_audience", {
      p_label: newLabel,
      p_match_levels: newLevels,
      p_match_package_ids: packages,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setAdding(false);
    setNewLabel("");
    setNewLevels([]);
    setNewPackages("");
    await load();
  }

  async function removeCustom(c: CustomAudience) {
    if (!window.confirm(`Delete the audience "${c.label}"?`)) return;
    setError(null);
    const { error: err } = await supabase.rpc("admin_delete_notification_audience", { p_id: c.id });
    if (err) {
      setError(err.message);
      return;
    }
    onChange(value.filter((v) => v !== `custom:${c.id}`));
    await load();
  }

  const chip = (selected: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
      selected
        ? "border-amber-300/70 bg-amber-300/15 text-amber-200"
        : "border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/10"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange([])} className={chip(value.length === 0)}>
          Everyone{counts ? ` (${counts.total})` : ""}
        </button>

        {ACADEMIC_LEVEL_OPTIONS.map((level) => {
          const n = countFor(level);
          return (
            <button key={level} type="button" onClick={() => toggle(level)} className={chip(has(level))}>
              {level}
              {n !== null ? ` (${n})` : ""}
            </button>
          );
        })}

        {extraLevels.map((l) => (
          <button key={l.level} type="button" onClick={() => toggle(l.level)} className={chip(has(l.level))}>
            {l.level} ({l.n})
          </button>
        ))}

        {customs.map((c) => (
          <span key={c.id} className="inline-flex items-center">
            <button type="button" onClick={() => toggle(`custom:${c.id}`)} className={chip(has(`custom:${c.id}`))}>
              {c.label} ({c.students})
            </button>
            <button
              type="button"
              onClick={() => void removeCustom(c)}
              aria-label={`Delete audience ${c.label}`}
              className="ml-1 p-1 rounded-full text-slate-500 hover:text-rose-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-white/20 text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Custom audience
        </button>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-amber-300" />
        {value.length === 0 ? "Reaches everyone: " : "Reaches: "}
        <span className="text-white font-semibold">{count === null ? "…" : `${count} student${count === 1 ? "" : "s"}`}</span>
        {counts && counts.no_level > 0 && (
          <span className="text-slate-500">
            ({counts.no_level} have no level saved: only Everyone reaches them)
          </span>
        )}
      </p>

      {adding && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
          <input
            type="text"
            value={newLabel}
            maxLength={60}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Audience name, e.g. Exit exam group"
            className="w-full px-3.5 py-2 rounded-lg bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/60"
          />
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] text-slate-400 w-full">Matches these levels:</span>
            {[...ACADEMIC_LEVEL_OPTIONS.map(String), ...extraLevels.map((l) => l.level)].map((level) => {
              const on = newLevels.some((l) => same(l, level));
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setNewLevels(on ? newLevels.filter((l) => !same(l, level)) : [...newLevels, level])
                  }
                  className={chip(on)}
                >
                  {level}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={newPackages}
            onChange={(e) => setNewPackages(e.target.value)}
            placeholder="Optional: package ids separated by commas, e.g. ece-y3-sem-1"
            className="w-full px-3.5 py-2 rounded-lg bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/60"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !newLabel.trim() || (newLevels.length === 0 && !newPackages.trim())}
              onClick={() => void addCustom()}
              className="px-4 py-1.5 rounded-lg bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-40"
            >
              {busy ? "Saving..." : "Save audience"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
