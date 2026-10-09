"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Trophy, Medal, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCachedQuery } from "@/hooks/useCachedQuery";

export type LeaderEntry = {
  rank: number;
  name: string;
  score: number;
  badge?: string;
};

export function sampleLeaders(branchLabel: string): LeaderEntry[] {
  const seeds = [
    "Amanuel T.",
    "Sara K.",
    "Yonas M.",
    "Hiwot B.",
    "Daniel G.",
    "Meron A.",
    "Kidus R.",
    "Betty S.",
    "Natnael W.",
    "Ruth L.",
  ];
  return seeds.map((name, i) => ({
    rank: i + 1,
    name,
    score: 980 - i * 37 - (branchLabel.length % 7),
    badge: i === 0 ? "Champion" : i === 1 ? "Runner-up" : i === 2 ? "Third" : undefined,
  }));
}

type Props = {
  branchName: string;
  scopeId?: string;
  accent?: string;
  defaultRestOpen?: boolean;
};

export default function BranchLeaderboard({
  branchName,
  scopeId,
  accent = "text-amber-400",
  defaultRestOpen = false,
}: Props) {
  const resolvedScope = (scopeId || branchName).toLowerCase().replace(/\s+/g, "-");
  const [restOpen, setRestOpen] = useState(defaultRestOpen);

  const fetchLeaders = useCallback(async (): Promise<{ leaders: LeaderEntry[]; fromDb: boolean }> => {
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc("get_leaderboard", {
        p_scope_id: resolvedScope,
        p_limit: 10,
      });

      if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
        const mapped: LeaderEntry[] = rpcData.map(
          (row: { rank: number; name: string; score: number }) => ({
            rank: Number(row.rank),
            name: String(row.name || "Student"),
            score: Number(row.score || 0),
            badge:
              Number(row.rank) === 1
                ? "Champion"
                : Number(row.rank) === 2
                  ? "Runner-up"
                  : Number(row.rank) === 3
                    ? "Third"
                    : undefined,
          })
        );
        return { leaders: mapped, fromDb: true };
      }

      const { data: viewData, error: viewErr } = await supabase
        .from("leaderboard_by_scope")
        .select("display_name, score, best_percent, attempts")
        .eq("scope_id", resolvedScope)
        .order("score", { ascending: false })
        .limit(10);

      if (!viewErr && Array.isArray(viewData) && viewData.length > 0) {
        const mapped: LeaderEntry[] = viewData.map((row, i) => ({
          rank: i + 1,
          name: String(row.display_name || "Student"),
          score: Number(row.score || 0),
          badge: i === 0 ? "Champion" : i === 1 ? "Runner-up" : i === 2 ? "Third" : undefined,
        }));
        return { leaders: mapped, fromDb: true };
      }
    } catch {
      /* fallback */
    }
    return { leaders: sampleLeaders(branchName), fromDb: false };
  }, [resolvedScope, branchName]);

  const initialSeed = useMemo(
    () => ({
      leaders: sampleLeaders(branchName),
      fromDb: false,
    }),
    [branchName]
  );

  const { data = initialSeed, isRevalidating } = useCachedQuery(
    `leaderboard:${resolvedScope}`,
    fetchLeaders,
    {
      initialData: initialSeed,
      scope: "public",
    }
  );

  const leaders = data.leaders;
  const fromDb = data.fromDb;

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3, 10);

  return (
    <section className="mb-5 sm:mb-6 card-modern shadow-lg shadow-black/20 w-full overflow-hidden">
      <div className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 border-b border-white/8">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/30">
            <Trophy className={`w-3.5 h-3.5 ${accent}`} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xs sm:text-sm font-bold tracking-tight text-white truncate">
              {branchName} <span className={accent}>Leaderboard</span>
            </h2>
          </div>
        </div>
        <span className="text-[10px] font-medium text-wisdom-muted shrink-0">
          {isRevalidating ? "…" : fromDb ? "Live ranks" : "Top scholars"}
        </span>
      </div>

      <div>
        <div className="p-2 sm:p-3 grid grid-cols-3 gap-1.5 sm:gap-2.5 items-stretch">
          {[top3[1], top3[0], top3[2]].map((entry) => {
            if (!entry) return null;
            const rank = entry.rank;
            return (
              <div
                key={entry.rank}
                className={`relative rounded-xl border px-2 py-2 sm:px-3 sm:py-2.5 text-center flex flex-col justify-between min-w-0 transition-all ${
                  rank === 1
                    ? "border-amber-400/40 bg-gradient-to-b from-amber-500/15 to-transparent ring-1 ring-amber-400/25 shadow-sm"
                    : rank === 2
                      ? "border-slate-300/30 bg-gradient-to-b from-slate-400/10 to-transparent"
                      : "border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="flex items-center gap-1 min-w-0">
                    {rank === 1 ? (
                      <Trophy className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    ) : rank === 2 ? (
                      <Medal className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    ) : (
                      <Medal className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    )}
                    <span className="text-[11px] font-black font-display text-white">#{rank}</span>
                  </span>
                  <span className={`text-[10px] sm:text-[11px] font-bold tabular-nums shrink-0 ${accent}`}>
                    {entry.score}
                    <span className="text-[9px] text-wisdom-muted font-normal ml-0.5">pts</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-white truncate text-left">
                  {entry.name}
                </p>
              </div>
            );
          })}
        </div>

        {rest.length > 0 && (
          <div className="px-2 sm:px-3 pb-2.5 pt-0.5">
            <button
              type="button"
              onClick={() => setRestOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-wisdom-dark/30 px-2.5 py-1.5 text-left hover:bg-white/[0.04] transition-colors"
              aria-expanded={restOpen}
            >
              <span className="text-[11px] text-wisdom-muted font-medium">
                {restOpen ? "Hide ranks 4–10" : `Show ranks 4–${Math.min(10, 3 + rest.length)}`}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-wisdom-muted transition-transform duration-200 ${
                  restOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                restOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <ul className="pt-1.5 pb-1 space-y-1">
                  {rest.map((entry) => (
                    <li
                      key={entry.rank}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-wisdom-dark/40 px-2.5 py-1"
                    >
                      <span className="w-5 h-5 shrink-0 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-wisdom-muted tabular-nums">
                        {entry.rank}
                      </span>
                      <span className="flex-1 text-xs font-medium text-slate-200 truncate">
                        {entry.name}
                      </span>
                      <span className={`text-[11px] font-semibold tabular-nums ${accent}`}>
                        {entry.score} pts
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
