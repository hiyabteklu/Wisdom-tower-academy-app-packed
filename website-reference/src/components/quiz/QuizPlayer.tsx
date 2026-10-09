"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/data/sample-questions";
import SolutionPanel from "./SolutionPanel";
import MathText from "@/components/MathText";
import { triggerHaptic } from "@/lib/sound-haptics";
import { triggerCorrectConfetti } from "@/lib/confetti";

type Props = {
  questions: QuizQuestion[];
  title?: string;
  /** Premade Solution button (default on when question has `solution`) */
  enableSolution?: boolean;
  /** Optional AI explain button (default on) */
  enableAiExplain?: boolean;
};

export default function QuizPlayer({
  questions,
  title = "Practice quiz",
  enableSolution = true,
  enableAiExplain = true,
}: Props) {
  const list = useMemo(() => questions, [questions]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongShaking, setWrongShaking] = useState(false);

  if (!list.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-wisdom-card p-6 text-center text-sm text-wisdom-muted">
        No questions available yet.
      </div>
    );
  }

  const q = list[index];
  const correct = q.choices[q.correctIndex];

  function submit(e?: React.MouseEvent<HTMLButtonElement> | HTMLElement) {
    if (selected === null || revealed) return;
    setRevealed(true);
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) {
      const el = e ? ("currentTarget" in e ? e.currentTarget : e) : undefined;
      triggerCorrectConfetti(el);
      setScore((s) => s + 1);
    } else {
      triggerHaptic("wrong");
      setWrongShaking(true);
      setTimeout(() => setWrongShaking(false), 500);
    }
  }

  function next() {
    if (index + 1 >= list.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const percent = Math.round((score / list.length) * 100);
    return (
      <div className="rounded-3xl border border-white/12 bg-wisdom-card p-6 sm:p-8 text-center shadow-card-3d">
        <h3 className="font-display text-xl font-bold mb-2">Quiz complete</h3>
        <p className="text-3xl font-black tabular-nums text-cyan-400 mb-1">{percent}%</p>
        <p className="text-sm text-wisdom-muted mb-6">
          {score} / {list.length} correct
        </p>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
      <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted">{title}</p>
          <p className="text-sm text-white/80">
            Question {index + 1} of {list.length}
            <span className="text-wisdom-muted">
              {" "}· {q.subject} · {q.difficulty}
            </span>
          </p>
        </div>
        <span className="text-xs font-semibold tabular-nums text-cyan-300/90">
          Score {score}
        </span>
      </div>

      <div className="px-5 sm:px-6 py-6">
        <p className="text-base sm:text-lg font-medium text-white leading-relaxed mb-5">
          <MathText text={q.question} />
        </p>

        <ul className="space-y-2.5">
          {q.choices.map((choice, i) => {
            const isSel = selected === i;
            const isCorrect = revealed && i === q.correctIndex;
            const isWrong = revealed && isSel && i !== q.correctIndex;
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    isCorrect
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100"
                      : isWrong
                        ? `border-rose-400/50 bg-rose-500/15 text-rose-100 ${wrongShaking ? "animate-shake-wrong ring-2 ring-rose-500" : ""}`
                        : isSel
                          ? "border-cyan-400/40 bg-cyan-500/10 text-white"
                          : "border-white/10 bg-wisdom-dark/40 hover:border-white/20 text-white/90"
                  }`}
                >
                  <span className="font-semibold text-wisdom-muted mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <MathText text={choice} />
                  {isCorrect && (
                    <CheckCircle2 className="inline w-4 h-4 ml-2 text-emerald-400" />
                  )}
                  {isWrong && <XCircle className="inline w-4 h-4 ml-2 text-rose-400" />}
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && selected !== null && (
          <SolutionPanel
            solution={enableSolution ? q.solution : undefined}
            enableAi={enableAiExplain}
            questionId={q.id}
            question={q.question}
            choices={q.choices}
            studentAnswer={q.choices[selected]}
            correctAnswer={correct}
            subject={q.subject}
            difficulty={q.difficulty}
          />
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {!revealed ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={submit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold disabled:opacity-40"
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400"
            >
              {index + 1 >= list.length ? "Finish" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
