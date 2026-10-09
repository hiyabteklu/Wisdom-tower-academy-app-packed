"use client";

import { useEffect, useState } from "react";
import { TowerTrack } from "@/lib/games/tower-defense/types";
import { GameDifficulty, DIFFICULTY_MAX_MISSES } from "@/lib/games/tower-defense/config";
import { getPlayableExamTowers } from "@/lib/games/tower-defense/curated-exam-tracks";
import { getTowerPersonalBest } from "@/lib/games/tower-defense/high-scores";
import {
  Shield,
  Lock,
  Play,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Zap,
  Target,
  Flame,
} from "lucide-react";
import Link from "next/link";

interface Props {
  onSelectTower: (track: TowerTrack, difficulty: GameDifficulty) => void;
  selectedDifficulty?: GameDifficulty;
  onDifficultyChange?: (difficulty: GameDifficulty) => void;
}

export default function TowerSelector({
  onSelectTower,
  selectedDifficulty = "medium",
  onDifficultyChange,
}: Props) {
  const [tracks, setTracks] = useState<TowerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<GameDifficulty>(selectedDifficulty);

  const handleDifficultySelect = (diff: GameDifficulty) => {
    setDifficulty(diff);
    onDifficultyChange?.(diff);
  };

  useEffect(() => {
    let cancelled = false;
    getPlayableExamTowers().then((res) => {
      if (cancelled) return;
      // Enrich with personal bests
      const enriched = res.map((t) => {
        const pb = getTowerPersonalBest(t.id);
        return {
          ...t,
          personalBestScore: pb.bestScore,
          personalBestWave: pb.highestWave,
        };
      });
      setTracks(enriched);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-[80vh] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Academic Survival Defense</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Tower Defense of Knowledge
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Authentic exam problems transform into approaching adversaries. Eliminate incoming waves
            by computing solutions accurately before your citadel perimeter is breached.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Source: Official Exams Only
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Offline WebCache Capable
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              KaTeX LaTeX Formats
            </span>
          </div>

          {/* Difficulty Selection Bar */}
          <div className="mt-8 max-w-xl mx-auto rounded-2xl border border-white/10 bg-slate-950/80 p-3 backdrop-blur-md shadow-xl">
            <div className="text-center mb-2.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Choose Survival Difficulty:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDifficultySelect("easy")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  difficulty === "easy"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400"
                    : "border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-black uppercase">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Easy</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  15 Wrong Attempts
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDifficultySelect("medium")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  difficulty === "medium"
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400"
                    : "border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-black uppercase">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Medium</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  10 Wrong Attempts
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDifficultySelect("hard")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  difficulty === "hard"
                    ? "bg-rose-500/20 border-rose-400 text-rose-200 shadow-md shadow-rose-500/20 ring-1 ring-rose-400"
                    : "border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-black uppercase">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hard</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  5 Wrong Attempts
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Citadels / Towers Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p className="mt-4 text-sm font-mono text-slate-400">
              Synchronizing Exam Archives & Entitlements...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {tracks.map((track) => {
              const hasPb = (track.personalBestScore || 0) > 0;

              return (
                <div
                  key={track.id}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                    track.isLocked
                      ? "border-slate-800 bg-slate-950/60 opacity-80"
                      : "border-slate-800/80 bg-slate-900/90 hover:border-cyan-500/50 hover:bg-slate-900 hover:shadow-2xl hover:shadow-cyan-950/30"
                  }`}
                >
                  {/* Card Content */}
                  <div className="p-6 sm:p-7">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-white/5 text-slate-300">
                        {track.badge}
                      </span>

                      {track.isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                          Ready to Defend
                        </span>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <h2 className="text-xl font-display font-extrabold text-white tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                      {track.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                      {track.subtitle}
                    </p>

                    {/* Stats Pill Row */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{track.questionCount} Exam Nodes</span>
                      </div>

                      {hasPb && (
                        <div className="flex items-center gap-1.5 font-mono text-amber-300">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>PB: {track.personalBestScore?.toLocaleString()} (W{track.personalBestWave})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer / Action */}
                  <div className="p-4 sm:p-6 bg-slate-950/40 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      Subject: <span className="text-slate-300">{track.subject}</span>
                    </span>

                    {track.isLocked ? (
                      <Link
                        href={`/packages#${track.packageId || "exit-exam"}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <span>{track.lockReason || "Unlock Package"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => onSelectTower(track, difficulty)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Initiate Defense ({difficulty.toUpperCase()})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Guidance */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          <p>
            Questions are strictly extracted from our academic Exam papers. Between waves, earned power-ups
            (Chronos Stasis, Logic 50/50, and Fortify Core) can be deployed to counter aggressive question nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
