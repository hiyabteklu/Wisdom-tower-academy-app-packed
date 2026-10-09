"use client";

import { recordDailyClimbCompleted } from "@/lib/games/tower-climb/store";
import OwlMascot from "./OwlMascot";
import { Flame, Sparkles, CheckCircle2, ArrowRight, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  isCompletedToday: boolean;
  currentStreak: number;
  bestStreak: number;
  onStartDailyClimb: () => void;
  onClose: () => void;
}

export default function DailyClimbModal({
  isOpen,
  isCompletedToday,
  currentStreak,
  bestStreak,
  onStartDailyClimb,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-orange-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl text-center">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot */}
        <div className="mb-4 flex justify-center">
          <OwlMascot size={64} mood={isCompletedToday ? "celebrating" : "idle"} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/20 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Daily Expedition</span>
        </div>

        <h2 className="text-2xl font-display font-extrabold text-white tracking-tight mb-2">
          Daily Climb Trial
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed mb-6">
          A concentrated 8-problem speed ascent across your curriculum. Keep your daily flame burning and earn +150 bonus XP.
        </p>

        {/* Streaks Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-center">
          <div className="p-3.5 rounded-2xl border border-orange-500/20 bg-orange-950/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Current Flame
            </span>
            <span className="text-2xl font-bold font-mono text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-orange-400" />
              {currentStreak} Days
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border border-white/5 bg-slate-950/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Personal Best
            </span>
            <span className="text-2xl font-bold font-mono text-amber-300">
              {bestStreak} Days
            </span>
          </div>
        </div>

        {/* Status & CTA */}
        {isCompletedToday ? (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Today&apos;s Daily Climb Cleared! Flame Extended.</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Return to Tower
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              onClose();
              onStartDailyClimb();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-orange-950/60 hover:brightness-110 active:scale-95 transition-all font-display cursor-pointer"
          >
            <span>Ignite Today&apos;s Climb</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
