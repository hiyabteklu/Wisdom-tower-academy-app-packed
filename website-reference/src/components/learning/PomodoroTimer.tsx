"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Timer, SlidersHorizontal, Check } from "lucide-react";
import {
  FOCUS_EVENT,
  formatFocusClock,
  pauseFocus,
  pickNudge,
  pickStartLine,
  readFocusState,
  remainingSec,
  resetFocus,
  setPreset,
  startFocus,
  type FocusState,
} from "@/lib/focus-timer";

const PRESETS = [
  { label: "Focus 25", minutes: 25 },
  { label: "Short 5", minutes: 5 },
  { label: "Long 15", minutes: 15 },
  { label: "Sprint 45", minutes: 45 },
] as const;

export default function PomodoroTimer() {
  const [state, setState] = useState<FocusState>(() => readFocusState());
  const [left, setLeft] = useState(() => remainingSec(readFocusState()));
  const [startLine, setStartLine] = useState<string | null>(null);
  const [nudge, setNudge] = useState<ReturnType<typeof pickNudge> | null>(null);
  const [pendingAction, setPendingAction] = useState<"pause" | "reset" | null>(null);
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(30);

  const sync = useCallback(() => {
    const s = readFocusState();
    setState(s);
    setLeft(remainingSec(s));
  }, []);

  useEffect(() => {
    sync();
    const onEvt = () => sync();
    window.addEventListener(FOCUS_EVENT, onEvt);
    window.addEventListener("storage", onEvt);
    return () => {
      window.removeEventListener(FOCUS_EVENT, onEvt);
      window.removeEventListener("storage", onEvt);
    };
  }, [sync]);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      const s = readFocusState();
      const r = remainingSec(s);
      setLeft(r);
      if (r <= 0 && s.running) {
        resetFocus(s.totalSec);
        sync();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("wt-focus-timer"));
        }
        try {
          navigator.vibrate?.(200);
        } catch {
          /* ignore */
        }
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [state.running, sync]);

  function onStart() {
    startFocus();
    setStartLine(pickStartLine());
    sync();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("wt-focus-timer"));
    }
  }

  function requestStop(kind: "pause" | "reset") {
    if (!state.running) {
      if (kind === "reset") {
        resetFocus();
        setStartLine(null);
        sync();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("wt-focus-timer"));
        }
      }
      return;
    }
    setPendingAction(kind);
    setNudge(pickNudge());
  }

  function confirmStop() {
    if (pendingAction === "pause") pauseFocus();
    if (pendingAction === "reset") resetFocus();
    setPendingAction(null);
    setNudge(null);
    setStartLine(null);
    sync();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("wt-focus-timer"));
    }
  }

  function keepGoing() {
    setPendingAction(null);
    setNudge(null);
  }

  const progress = state.totalSec > 0 ? 1 - left / state.totalSec : 0;
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const running = state.running && left > 0;

  return (
    <>
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="flex flex-wrap justify-center items-center gap-2 mb-6">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={running}
              onClick={() => {
                setPreset(p.minutes * 60);
                setStartLine(null);
                setCustomInputOpen(false);
                sync();
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("wt-focus-timer"));
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
                state.totalSec === p.minutes * 60
                  ? "border-white/30 bg-white/20 text-white shadow-sm"
                  : "border-white/[0.08] bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]"
              } disabled:opacity-50`}
            >
              {p.label}
            </button>
          ))}

          <button
            type="button"
            disabled={running}
            onClick={() => setCustomInputOpen((prev) => !prev)}
            className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              customInputOpen || !PRESETS.some((p) => p.minutes * 60 === state.totalSec)
                ? "border-white/30 bg-white/20 text-white shadow-sm"
                : "border-white/[0.08] bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]"
            } disabled:opacity-50`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {!PRESETS.some((p) => p.minutes * 60 === state.totalSec)
                ? `Custom (${Math.round(state.totalSec / 60)}m)`
                : "Custom"}
            </span>
          </button>
        </div>

        {/* Inline Custom Minutes Selector */}
        {customInputOpen && !running && (
          <div className="mb-6 p-4 rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl max-w-xs mx-auto animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-slate-300 mb-2 tracking-wide">
              Custom Duration
            </p>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min={1}
                max={360}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, Math.min(360, Number(e.target.value) || 1)))}
                className="w-20 px-3 py-1.5 rounded-full bg-slate-950/80 border border-white/15 text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-white/40"
              />
              <span className="text-xs text-slate-300 font-medium">min</span>
              <button
                type="button"
                onClick={() => {
                  setPreset(customMinutes * 60);
                  setStartLine(null);
                  setCustomInputOpen(false);
                  sync();
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("wt-focus-timer"));
                  }
                }}
                className="px-4 py-1.5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Set</span>
              </button>
            </div>
          </div>
        )}

        <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="text-white transition-[stroke-dashoffset] duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-4xl sm:text-5xl font-black tabular-nums text-white tracking-tight">
              {formatFocusClock(left)}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">
              {running ? "Focus" : left === 0 ? "Done" : "Ready"}
            </p>
          </div>
        </div>

        {startLine && running ? (
          <p className="mb-5 text-sm text-slate-200 leading-relaxed max-w-sm mx-auto font-medium">
            {startLine}
          </p>
        ) : null}

        <div className="flex items-center justify-center gap-3">
          {running ? (
            <button
              type="button"
              onClick={() => requestStop("pause")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/15 active:scale-95 transition-all duration-150 cursor-pointer shadow-md"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={left <= 0}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-40 active:scale-95 transition-all duration-150 cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => requestStop("reset")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Timer continues running across all subjects and notes.
        </p>
      </div>

      {nudge && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          role="dialog"
          aria-modal
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 text-center shadow-2xl">
            <p className="text-4xl mb-3" aria-hidden>
              {nudge.face}
            </p>
            <h3 className="text-lg font-bold text-white mb-1.5">{nudge.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">{nudge.body}</p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={keepGoing}
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 active:scale-95 transition-all duration-150 shadow-md cursor-pointer"
              >
                Keep studying
              </button>
              <button
                type="button"
                onClick={confirmStop}
                className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-sm font-semibold text-slate-300 hover:text-white active:scale-95 transition-all duration-150 cursor-pointer"
              >
                {pendingAction === "reset" ? "Reset anyway" : "Pause anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
