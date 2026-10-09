"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Wind, BookOpen, Play } from "lucide-react";
import type { MotivationalQuote } from "@/data/motivational-quotes";

type Props = {
  open: boolean;
  quote: MotivationalQuote | null;
  sessionMinutes: number;
  onContinue: () => void;
  onTakeBreak: () => void;
};

/**
 * Full-screen Pomodoro break overlay shown after focused reading time.
 * Encourages a short breath + shows a motivational quote.
 */
export default function PomodoroBreak({
  open,
  quote,
  sessionMinutes,
  onContinue,
  onTakeBreak,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open || !quote) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pomodoro-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#121a2e] to-[#0a0f1a] shadow-2xl shadow-amber-500/10 overflow-hidden">
        <div className="px-6 pt-7 pb-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
            <Wind className="w-7 h-7" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/90">
            Pomodoro break
          </p>
          <h2
            id="pomodoro-title"
            className="mt-2 text-xl font-bold text-white"
          >
            Take a breath
          </h2>
          <p className="mt-2 text-sm text-white/60">
            You’ve been reading for about {sessionMinutes} minutes. Rest your eyes,
            stretch, drink water: then come back stronger.
          </p>
        </div>

        <blockquote className="mx-5 my-5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
          <p className="text-[15px] leading-relaxed text-white/95 font-medium text-center">
            “{quote.text}”
          </p>
          <footer className="mt-3 text-center text-xs font-semibold text-amber-200/80">
           : {quote.author}
          </footer>
        </blockquote>

        <div className="px-5 pb-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onTakeBreak}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            <BookOpen className="w-4 h-4 opacity-70" />
            I’ll rest a bit
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-wisdom-dark hover:bg-amber-400"
          >
            <Play className="w-4 h-4" />
            Continue reading
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
