"use client";

import { useState } from "react";
import { DefenseRunStats } from "@/lib/games/tower-defense/types";
import MathText from "@/components/MathText";
import {
  Trophy,
  RotateCcw,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Props {
  stats: DefenseRunStats;
  onRetry: () => void;
  onSelectAnotherTower: () => void;
}

export default function ResultsModal({
  stats,
  onRetry,
  onSelectAnotherTower,
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const isVictory = stats.wavesCleared >= 5;

  return (
    <div className="relative min-h-[85vh] py-8 sm:py-12 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top Return Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onSelectAnotherTower}
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Select Another Citadel</span>
          </button>
          <span className="text-xs font-mono text-slate-400">
            {stats.dateIso.split("T")[0]}
          </span>
        </div>

        {/* Main Performance Summary Card */}
        <div className="rounded-3xl border border-white/12 bg-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl mb-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-xl shadow-cyan-500/10">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300 mb-1">
              Defense Run Debrief
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight mb-2">
              {isVictory ? "Citadel Fully Secured!" : "Citadel Perimeter Breached"}
            </h1>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              Sector: <span className="font-semibold text-white">{stats.towerTitle}</span>.
              Academic trial results stored in local defense archive.
            </p>
          </div>

          {/* Defense Rank Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-emerald-500/15 border border-amber-400/30 text-amber-300 shadow-lg">
              <Award className="w-5 h-5 text-amber-400" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Defense Rank Conferred
                </span>
                <span className="text-sm font-bold text-white tracking-wide">
                  {stats.defenseRank}
                </span>
              </div>
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                +{stats.defenseXp} XP
              </span>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 text-center">
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Waves Cleared
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-300">
                {stats.wavesCleared}
              </span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Total Score
              </span>
              <span className="text-2xl font-bold font-mono text-amber-300">
                {stats.score.toLocaleString()}
              </span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Accuracy
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {stats.accuracyPct}%
              </span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Peak Combo
              </span>
              <span className="text-2xl font-bold font-mono text-fuchsia-400">
                {stats.maxCombo}x
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/50 hover:brightness-110 active:scale-95 transition-all text-sm font-display"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Deploy Defense Again</span>
            </button>

            <button
              onClick={onSelectAnotherTower}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-700 transition-all text-sm"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Change Exam Tower</span>
            </button>

            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/5 bg-slate-950/50 px-5 py-3 font-semibold text-slate-400 hover:text-white transition-all text-sm"
            >
              <span>Back to Academy</span>
            </Link>
          </div>
        </div>

        {/* Missed Questions Pedagogical Review Section */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Academic Remediation Review
                </h2>
                <p className="text-xs text-slate-400">
                  Step-by-step LaTeX solutions for all missed or timed-out problems
                </p>
              </div>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono text-slate-300 font-bold border border-white/5">
              {stats.missedQuestions.length} Missed
            </span>
          </div>

          {stats.missedQuestions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-300 text-sm font-medium">
              Flawless Defense! Zero questions were breached during this session.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.missedQuestions.map((item, idx) => {
                const isOpen = expandedIndex === idx;

                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border border-white/5 bg-slate-950/60 transition-all"
                  >
                    <button
                      onClick={() => setExpandedIndex(isOpen ? null : idx)}
                      className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 text-xs font-mono font-bold">
                          #{idx + 1}
                        </span>
                        <div className="text-sm font-medium text-slate-200 line-clamp-2">
                          <MathText text={item.question.prompt} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                        <span className="text-[11px] font-mono text-slate-500">
                          {isOpen ? "Close" : "Solution"}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-white/5 space-y-4 animate-fade-in text-sm">
                        {/* Prompt in full */}
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-slate-200 leading-relaxed">
                          <MathText text={item.question.prompt} />
                        </div>

                        {/* Selected vs Correct */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/15">
                            <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1">
                              Your Selection
                            </span>
                            <div className="text-xs sm:text-sm text-rose-200">
                              {item.selectedChoiceText ? (
                                <MathText text={item.selectedChoiceText} />
                              ) : (
                                <span className="italic text-slate-400">Timed out before answer</span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                            <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">
                              Verified Answer
                            </span>
                            <div className="text-xs sm:text-sm text-emerald-200 font-medium">
                              <MathText text={item.correctChoiceText} />
                            </div>
                          </div>
                        </div>

                        {/* Written Proof / Explanation */}
                        {item.solution && (
                          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/15 text-slate-200 leading-relaxed text-xs sm:text-sm">
                            <span className="text-[11px] font-mono uppercase text-cyan-300 block mb-1 font-bold">
                              Step-by-step Solution:
                            </span>
                            <div className="font-serif italic font-medium text-sm text-cyan-50/95 leading-relaxed explanation-text">
                              <MathText text={item.solution} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
