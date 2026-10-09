"use client";

import { useState } from "react";
import { ReviewAtticItem } from "@/lib/games/tower-climb/types";
import { removeQuestionFromAttic } from "@/lib/games/tower-climb/store";
import MathText from "@/components/MathText";
import OwlMascot from "./OwlMascot";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Trash2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  items: ReviewAtticItem[];
  onClose: () => void;
  onItemResolved: () => void;
}

export default function ReviewAtticModal({
  isOpen,
  items,
  onClose,
  onItemResolved,
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleResolve = (questionId: string) => {
    removeQuestionFromAttic(questionId);
    onItemResolved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400" />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <OwlMascot size={46} mood="reading" />
            <div>
              <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
                Review Attic
              </h2>
              <p className="text-xs text-slate-400">
                Spaced remediation queue for questions missed during tower ascent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono font-bold text-cyan-300 border border-white/5">
              {items.length} Queued
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-6">
          {items.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-300">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400 opacity-90" />
              <p className="font-bold text-base mb-1">Your Review Attic is Clear!</p>
              <p className="text-xs text-emerald-400/80 max-w-xs mx-auto">
                No active misconceptions queued. All missed problems have been reviewed and mastered.
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const isExpanded = expandedIndex === idx;

              return (
                <div
                  key={item.question.id}
                  className="rounded-2xl border border-white/5 bg-slate-950/70 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 text-xs font-mono font-bold">
                        #{idx + 1}
                      </span>
                      <div className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-2">
                        <MathText text={item.question.prompt} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <span className="text-[11px] font-mono text-cyan-400">
                        {isExpanded ? "Close" : "Study"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-white/5 space-y-4 animate-fade-in text-xs sm:text-sm">
                      {/* Full Prompt */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 text-slate-200">
                        <MathText text={item.question.prompt} />
                      </div>

                      {/* Choice Analysis */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/15">
                          <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1">
                            Your Choice
                          </span>
                          <div className="text-rose-200 font-medium">
                            {item.selectedText ? (
                              <MathText text={item.selectedText} />
                            ) : (
                              <span className="italic text-slate-500">Timed out before answer</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">
                            Verified Correct
                          </span>
                          <div className="text-emerald-200 font-semibold">
                            <MathText text={item.correctText} />
                          </div>
                        </div>
                      </div>

                      {/* Full Solution Proof */}
                      {item.solution && (
                        <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/15 text-slate-300 leading-relaxed">
                          <span className="text-[10px] font-mono uppercase text-cyan-300 block mb-1 font-bold">
                            Pedagogical Derivation:
                          </span>
                          <MathText text={item.solution} />
                        </div>
                      )}

                      {/* Action Button: Clear from Attic */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleResolve(item.question.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Concept Mastered (Clear from Attic)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/5 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Close Attic
          </button>
        </div>
      </div>
    </div>
  );
}
