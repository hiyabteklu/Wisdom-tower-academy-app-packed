"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ListChecks,
  AlertTriangle,
  X,
  Flag,
} from "lucide-react";

type Props = {
  isOpen: boolean;
  score: number;
  total: number;
  wrong: number;
  skipped: number;
  flagged?: number;
  elapsedSec?: number;
  isExam?: boolean;
  title?: string;
  onReviewAll: () => void;
  onReviewMissed: () => void;
  onReviewFlagged?: () => void;
  onRetake: () => void;
  onClose: () => void;
};

export default function QuizResultModal({
  isOpen,
  score,
  total,
  wrong,
  skipped,
  flagged = 0,
  isExam = false,
  title,
  onReviewAll,
  onReviewMissed,
  onReviewFlagged,
  onRetake,
  onClose,
}: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const [displayPct, setDisplayPct] = useState(0);

  // Animated radial score count-up
  useEffect(() => {
    if (!isOpen) {
      setDisplayPct(0);
      return;
    }
    const end = pct;
    const duration = 700;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(Math.round(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    const req = requestAnimationFrame(step);
    return () => cancelAnimationFrame(req);
  }, [isOpen, pct]);

  // Calm, cohesive Navy / Cyan tier palette
  const tier = useMemo(() => {
    if (pct >= 90) {
      return {
        label: "Mastery Level",
        tone: "text-emerald-400",
        border: "border-emerald-400/40",
        bg: "from-emerald-500/20 via-teal-500/10 to-transparent",
        gaugeStroke: "#10b981",
        caption: "Outstanding! You demonstrated rock-solid mastery of these questions.",
      };
    }
    if (pct >= 75) {
      return {
        label: "Strong Performance",
        tone: "text-cyan-400",
        border: "border-cyan-400/40",
        bg: "from-cyan-500/20 via-blue-500/10 to-transparent",
        gaugeStroke: "#06b6d4",
        caption: "Great effort! A few targeted reviews will get you to top scores.",
      };
    }
    if (pct >= 50) {
      return {
        label: "Good Progress",
        tone: "text-sky-300",
        border: "border-sky-400/40",
        bg: "from-sky-500/20 via-cyan-500/10 to-transparent",
        gaugeStroke: "#38bdf8",
        caption: "Solid start. Reviewing the missed questions will quickly boost your score.",
      };
    }
    return {
      label: "Practice Reinforcement",
      tone: "text-cyan-300",
      border: "border-cyan-400/30",
      bg: "from-cyan-500/15 via-slate-800/20 to-transparent",
      gaugeStroke: "#06b6d4",
      caption: "Keep practicing! Step-by-step solutions below will help you master every question.",
    };
  }, [pct]);

  if (!isOpen) return null;

  // Compact iOS-like radial gauge
  const radius = 48;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayPct / 100) * circumference;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      {/* Centered, tight iOS-like sheet: no wasted space */}
      <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-[#111a2e] via-[#0c1426] to-[#080d19] p-5 sm:p-6 shadow-2xl shadow-black/80 overflow-hidden text-center my-auto select-none">
        {/* Soft Ambient Glow */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-2xl opacity-30 bg-gradient-to-b ${tier.bg} pointer-events-none`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
          title="Close result modal"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/[0.06] border border-white/10 text-slate-300 mb-1.5">
          <Trophy className="w-3 h-3 text-cyan-300" />
          <span>{isExam ? "Exam Result" : "Practice Completed"}</span>
        </div>

        {title && (
          <h2 className="font-display text-sm sm:text-base font-bold text-white line-clamp-1 mb-2">
            {title}
          </h2>
        )}

        {/* Score Radial Gauge */}
        <div className="relative my-2.5 flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={tier.gaugeStroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${tier.gaugeStroke}50)`,
              }}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-black text-white tracking-tight leading-none">
              {displayPct}%
            </span>
            <span className="text-[11px] font-semibold text-slate-300 mt-1">
              {score} of {total} Correct
            </span>
          </div>
        </div>

        {/* Tier Label & Caption */}
        <div className="mb-4">
          <p className={`font-display text-sm sm:text-base font-bold ${tier.tone}`}>
            {tier.label}
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5 leading-relaxed">
            {tier.caption}
          </p>
        </div>

        {/* Key Metrics Grid: 3-column tight cards (Correct, Missed, Skipped) - NO TIMER */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-2 sm:p-2.5">
            <div className="flex items-center justify-center gap-1 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" />
              <span>Correct</span>
            </div>
            <p className="text-lg font-black text-white mt-0.5">{score}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2 sm:p-2.5">
            <div className="flex items-center justify-center gap-1 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <XCircle className="w-3 h-3 text-cyan-300" />
              <span>Missed</span>
            </div>
            <p className="text-lg font-black text-white mt-0.5">{wrong}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2 sm:p-2.5">
            <div className="flex items-center justify-center gap-1 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3 text-amber-300" />
              <span>Skipped</span>
            </div>
            <p className="text-lg font-black text-white mt-0.5">{skipped}</p>
          </div>
        </div>

        {/* Calm Action Buttons in Account / Settings Style */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Review Missed Button */}
            <button
              type="button"
              onClick={onReviewMissed}
              disabled={wrong === 0 && skipped === 0}
              className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                wrong === 0 && skipped === 0
                  ? "bg-slate-900/60 text-slate-500 border border-white/5 cursor-not-allowed"
                  : "border border-white/15 bg-white/5 hover:bg-white/10 text-white active:scale-[0.98] cursor-pointer"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-cyan-300" />
              <span>Review Missed ({wrong + skipped})</span>
            </button>

            {/* Review All Button (Cyan primary) */}
            <button
              type="button"
              onClick={onReviewAll}
              className="w-full py-2.5 px-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-950/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Review All ({total})</span>
            </button>
          </div>

          {/* Optional Review Flagged */}
          {flagged > 0 && onReviewFlagged && (
            <button
              type="button"
              onClick={onReviewFlagged}
              className="w-full py-2 px-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Flag className="w-3 h-3 text-cyan-300" />
              <span>Review Flagged ({flagged})</span>
            </button>
          )}

          {/* Retake Practice / Exam Button */}
          <button
            type="button"
            onClick={onRetake}
            className="w-full py-2 px-3.5 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retake {isExam ? "Exam" : "Practice"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
