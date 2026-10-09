"use client";

import { useEffect, useCallback } from "react";
import { EnemyUnit } from "@/lib/games/tower-defense/types";
import MathText from "@/components/MathText";
import { Clock, HelpCircle } from "lucide-react";

interface Props {
  enemy: EnemyUnit;
  timeRemainingSec: number;
  totalTimeSec: number;
  onSelectChoice: (choiceIndex: number) => void;
  disabled?: boolean;
}

const CHOICE_LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuestionCard({
  enemy,
  timeRemainingSec,
  totalTimeSec,
  onSelectChoice,
  disabled = false,
}: Props) {
  const choices = enemy.shuffledChoices;
  const timePct = Math.max(0, Math.min(100, (timeRemainingSec / totalTimeSec) * 100));

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toUpperCase();

      // Check numbers 1-4
      if (["1", "2", "3", "4"].includes(key)) {
        const index = parseInt(key, 10) - 1;
        if (index < choices.length && !enemy.eliminatedChoiceIndices.includes(index)) {
          onSelectChoice(index);
        }
      }

      // Check letters A-D
      if (["A", "B", "C", "D"].includes(key)) {
        const index = key.charCodeAt(0) - 65;
        if (index < choices.length && !enemy.eliminatedChoiceIndices.includes(index)) {
          onSelectChoice(index);
        }
      }
    },
    [disabled, choices.length, enemy.eliminatedChoiceIndices, onSelectChoice]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const isLowTime = timeRemainingSec <= 5;
  const isMedTime = timeRemainingSec <= 10 && timeRemainingSec > 5;

  return (
    <div className="relative rounded-3xl border border-white/12 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Top Header: Timer Bar & Time Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className={`w-4 h-4 ${isLowTime ? "text-rose-400 animate-spin" : "text-cyan-400"}`} />
            <span>Response Window</span>
          </div>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              isLowTime
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                : isMedTime
                ? "bg-amber-500/20 text-amber-300"
                : "bg-cyan-500/20 text-cyan-300"
            }`}
          >
            {timeRemainingSec.toFixed(1)}s
          </span>
        </div>

        {/* Smooth Countdown Bar */}
        <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              isLowTime
                ? "bg-rose-500 shadow-sm shadow-rose-500"
                : isMedTime
                ? "bg-amber-400"
                : "bg-gradient-to-r from-cyan-400 to-emerald-400"
            }`}
            style={{ width: `${timePct}%` }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-8">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 mt-1 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold font-mono">
            Q
          </span>
          <div className="text-base sm:text-lg md:text-xl font-medium text-white leading-relaxed tracking-wide">
            <MathText text={enemy.question.prompt} />
          </div>
        </div>
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {choices.map((choice, index) => {
          const letter = CHOICE_LETTERS[index] || String(index + 1);
          const isEliminated = enemy.eliminatedChoiceIndices.includes(index);

          return (
            <button
              key={index}
              disabled={disabled || isEliminated}
              onClick={() => onSelectChoice(index)}
              className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                isEliminated
                  ? "border-slate-800 bg-slate-950/40 opacity-30 cursor-not-allowed line-through"
                  : disabled
                  ? "border-slate-800 bg-slate-900/60 opacity-60 cursor-default"
                  : "border-slate-700/80 bg-slate-800/70 hover:border-cyan-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]"
              }`}
            >
              {/* Option Letter Tag */}
              <span
                className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-colors ${
                  isEliminated
                    ? "bg-slate-900 text-slate-600 border border-slate-800"
                    : "bg-slate-900 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950"
                }`}
              >
                {letter}
              </span>

              {/* Option Content with LaTeX */}
              <div className="flex-1 text-sm sm:text-base font-normal text-slate-200 leading-snug pt-1">
                <MathText text={choice} />
              </div>

              {/* Keyboard Shortcut Hint for Desktop */}
              <span className="hidden md:inline-block text-[10px] font-mono text-slate-500 opacity-60 pt-1.5">
                [{letter}]
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400/80" />
          <span>Press keys [A-D] or [1-4] for rapid tactical firing</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Source: Official Exam Archive
        </span>
      </div>
    </div>
  );
}
