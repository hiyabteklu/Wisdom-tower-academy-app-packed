"use client";

import { ShieldAlert, ArrowRight, BookOpen, AlertOctagon } from "lucide-react";
import MathText from "@/components/MathText";

interface Props {
  isOpen: boolean;
  questionPrompt: string;
  selectedChoiceText?: string;
  correctChoiceText: string;
  solution?: string;
  isTimeout: boolean;
  towerHpRemaining: number;
  onContinue: () => void;
}

export default function BreachResolutionModal({
  isOpen,
  questionPrompt,
  selectedChoiceText,
  correctChoiceText,
  solution,
  isTimeout,
  towerHpRemaining,
  onContinue,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-rose-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-rose-950/50">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            {isTimeout ? (
              <AlertOctagon className="w-6 h-6 text-amber-400" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
              {isTimeout ? "Defense Timeout: Node Breached" : "Incorrect Tactical Computation"}
            </h2>
            <p className="text-xs text-rose-300/90 font-mono">
              Tower Integrity: -1 HP | Remaining Core Health:{" "}
              <span className="font-bold text-white">{towerHpRemaining}</span>
            </p>
          </div>
        </div>

        {/* Question Prompt Review */}
        <div className="mb-4 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Exam Problem Node
          </span>
          <div className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed">
            <MathText text={questionPrompt} />
          </div>
        </div>

        {/* Answer Contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* User Selection */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block mb-1">
              {isTimeout ? "Outcome" : "Your Answer"}
            </span>
            <div className="text-sm font-medium text-rose-200">
              {isTimeout ? (
                <span className="italic text-slate-400">Timer expired before answer</span>
              ) : selectedChoiceText ? (
                <MathText text={selectedChoiceText} />
              ) : (
                "No answer selected"
              )}
            </div>
          </div>

          {/* Correct Verification */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
              Verified Solution
            </span>
            <div className="text-sm font-medium text-emerald-200">
              <MathText text={correctChoiceText} />
            </div>
          </div>
        </div>

        {/* Detailed Mathematical Derivation */}
        {solution && (
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Pedagogical Derivation & Proof</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
              <MathText text={solution} />
            </div>
          </div>
        )}

        {/* Continue Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-950/50 hover:brightness-110 active:scale-95 transition-all text-sm"
          >
            <span>Fortify & Proceed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
