"use client";

import { useEffect, useCallback } from "react";
import { ChapterQuestion } from "@/lib/games/tower-climb/types";
import MathText from "@/components/MathText";
import OwlMascot from "./OwlMascot";
import { BookOpen, CheckCircle, XCircle, ArrowRight, HeartCrack } from "lucide-react";

interface Props {
  isOpen: boolean;
  question: ChapterQuestion;
  selectedChoiceText?: string;
  correctChoiceText: string;
  heartsRemaining: number;
  onAcknowledge: () => void;
}

export default function SolutionSheet({
  isOpen,
  question,
  selectedChoiceText,
  correctChoiceText,
  heartsRemaining,
  onAcknowledge,
}: Props) {
  // Allow Enter or Spacebar to acknowledge and advance
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onAcknowledge();
      }
    },
    [isOpen, onAcknowledge]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-rose-500/30 bg-slate-900 p-5 sm:p-8 shadow-2xl shadow-rose-950/60 flex flex-col justify-between">
        {/* Amber top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />

        {/* Header with Owl Tutor */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <OwlMascot size={48} mood="reading" />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300 font-bold uppercase tracking-wider">
                <HeartCrack className="w-3.5 h-3.5 text-rose-400" />
                <span>Heart Lost · Core Insight Required</span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight">
                Pedagogical Solution
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-xs font-mono text-slate-300">
            <span>Remaining:</span>
            <span className="font-bold text-rose-400">{heartsRemaining} HP</span>
          </div>
        </div>

        {/* Problem Prompt */}
        <div className="mb-4 rounded-2xl border border-white/5 bg-slate-950/70 p-4 text-sm sm:text-base text-slate-200 leading-relaxed">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Question Concept
          </span>
          <MathText text={question.prompt} />
        </div>

        {/* Answers Contrast Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
          {/* User Selection */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-3.5 flex items-start gap-2.5">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block mb-0.5">
                Your Selection
              </span>
              <div className="text-rose-200 font-medium">
                {selectedChoiceText ? (
                  <MathText text={selectedChoiceText} />
                ) : (
                  <span className="italic text-slate-400">Timed out before answer</span>
                )}
              </div>
            </div>
          </div>

          {/* Correct Verification */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-3.5 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-0.5">
                Verified Truth
              </span>
              <div className="text-emerald-200 font-semibold">
                <MathText text={correctChoiceText} />
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Derivation */}
        {question.solution ? (
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Step-by-Step Solution</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
              <MathText text={question.solution} />
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-white/5 bg-slate-950/40 p-3 text-xs text-slate-400 italic">
            This problem has been added to your Review Attic for spaced recall practice.
          </div>
        )}

        {/* Footer Action: "Got it" Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Added to Review Attic
          </span>

          <button
            onClick={onAcknowledge}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-7 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-950/40 active:scale-95 transition-all cursor-pointer font-display"
          >
            <span>Got it, continue climb</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
