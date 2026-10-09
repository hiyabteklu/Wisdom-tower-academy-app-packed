"use client";

import { TowerFloor } from "@/lib/games/tower-climb/types";
import OwlMascot from "./OwlMascot";
import { Star, RotateCcw, ArrowRight, Sparkles, Award } from "lucide-react";

interface Props {
  isOpen: boolean;
  floor: TowerFloor;
  starsEarned: number;
  xpEarned: number;
  heartsRemaining: number;
  totalQuestions: number;
  wrongCount: number;
  maxCombo: number;
  isVictory: boolean;
  newBadges: string[];
  onNextFloor?: () => void;
  onRetry: () => void;
  onReturnToMap: () => void;
}

export default function FloorResultModal({
  isOpen,
  floor,
  starsEarned,
  xpEarned,
  heartsRemaining,
  totalQuestions,
  wrongCount,
  maxCombo,
  isVictory,
  newBadges,
  onNextFloor,
  onRetry,
  onReturnToMap,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/12 bg-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center">
        {/* Glow Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            isVictory ? "from-amber-400 via-cyan-400 to-amber-400" : "from-rose-500 to-amber-500"
          }`}
        />

        {/* Mascot Centerpiece */}
        <div className="mb-4 flex justify-center">
          <OwlMascot
            size={76}
            mood={isVictory ? "celebrating" : "worried"}
            className="animate-in zoom-in-50 duration-300"
          />
        </div>

        {/* Title */}
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300 mb-1">
          {floor.isBoss ? "Boss Floor Encounter" : `Floor ${floor.floorNumber} Complete`}
        </p>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-2">
          {isVictory ? "Floor Ascended!" : "Hearts Depleted"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mb-6">
          {isVictory
            ? "Your scholar's lantern shines brighter as you climb higher into the tower."
            : "The tower stairs grew treacherous. Study the solutions in your Review Attic and ascend again."}
        </p>

        {/* Star Rating Display */}
        {isVictory && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`relative flex items-center justify-center h-14 w-14 rounded-2xl border transition-all ${
                  starIdx <= starsEarned
                    ? "bg-amber-400/15 border-amber-400/40 text-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                    : "bg-slate-950/40 border-slate-800 text-slate-700"
                }`}
              >
                <Star
                  className={`w-7 h-7 ${
                    starIdx <= starsEarned ? "fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : ""
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Performance Metric Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              XP Conferred
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-cyan-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{xpEarned}
            </span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Peak Streak
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
              {maxCombo}x
            </span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Accuracy
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
              {Math.max(0, Math.round(((totalQuestions - wrongCount) / totalQuestions) * 100))}%
            </span>
          </div>
        </div>

        {/* New Badge Unlock Notification */}
        {newBadges.length > 0 && (
          <div className="mb-6 p-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 animate-pulse">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Achievement Unlocked: {newBadges[0].replace(/-/g, " ").toUpperCase()}</span>
          </div>
        )}

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isVictory ? (
            <>
              {onNextFloor && (
                <button
                  onClick={onNextFloor}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/50 hover:brightness-110 active:scale-95 transition-all font-display cursor-pointer"
                >
                  <span>Ascend to Floor {floor.floorNumber + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onReturnToMap}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <span>Tower Map</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onRetry}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-950/50 hover:brightness-110 active:scale-95 transition-all font-display cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Floor (Reshuffled)</span>
              </button>
              <button
                onClick={onReturnToMap}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <span>Tower Map</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
