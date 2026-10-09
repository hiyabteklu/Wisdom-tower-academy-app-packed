"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calculator as CalcIcon,
  X,
  Minimize2,
  Maximize2,
  Delete,
  GripHorizontal,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { closeToolOverlay } from "@/lib/native-app";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
  isStandalone?: boolean;
};

// Factorial helper
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * Natural Scientific Formula Evaluator
 * Evaluates expressions like:
 *   sin(30)
 *   cos(45) + sqrt(16)
 *   2^3 + log(100)
 *   5!
 * Supports both DEG and RAD modes!
 */
function evaluateScientificExpression(raw: string, isRad: boolean): number {
  if (!raw.trim()) return 0;

  // Auto-close open parentheses
  let openParens = 0;
  for (const ch of raw) {
    if (ch === "(") openParens++;
    if (ch === ")") openParens--;
  }
  let expr = raw;
  while (openParens > 0) {
    expr += ")";
    openParens--;
  }

  // Pre-process factorial: number! -> fact(number)
  expr = expr.replace(/(\d+(?:\.\d+)?|\([^)]+\))!/g, "fact($1)");

  // Pre-process percentage: number% -> (number/100)
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

  // Replace symbols
  expr = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\^/g, "**")
    .replace(/π/g, `(${Math.PI})`)
    .replace(/\be\b/g, `(${Math.E})`);

  // Transform trigonometric and math functions according to Deg/Rad mode
  const trigTransforms = isRad
    ? {
        "sin\\(": "Math.sin(",
        "cos\\(": "Math.cos(",
        "tan\\(": "Math.tan(",
        "asin\\(": "Math.asin(",
        "acos\\(": "Math.acos(",
        "atan\\(": "Math.atan(",
      }
    : {
        // Degree mode transforms
        "sin\\(([^)]+)\\)": "Math.sin(($1) * Math.PI / 180)",
        "cos\\(([^)]+)\\)": "Math.cos(($1) * Math.PI / 180)",
        "tan\\(([^)]+)\\)": "Math.tan(($1) * Math.PI / 180)",
        "asin\\(([^)]+)\\)": "(Math.asin($1) * 180 / Math.PI)",
        "acos\\(([^)]+)\\)": "(Math.acos($1) * 180 / Math.PI)",
        "atan\\(([^)]+)\\)": "(Math.atan($1) * 180 / Math.PI)",
      };

  for (const [pattern, replacement] of Object.entries(trigTransforms)) {
    expr = expr.replace(new RegExp(pattern, "g"), replacement);
  }

  // Standard functions
  expr = expr
    .replace(/sqrt\(/g, "Math.sqrt(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/abs\(/g, "Math.abs(");

  // Custom factorial evaluator wrapper
  (window as any).__fact = factorial;
  expr = expr.replace(/fact\(/g, "window.__fact(");

  // Security sanitize: only allow safe Math characters
  const sanitized = expr.replace(/Math\.[a-zA-Z0-9]+/g, "").replace(/window\.__fact/g, "");
  if (!/^[0-9+\-*/().\s,*]+$/.test(sanitized)) {
    return NaN;
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${expr});`);
    const val = fn();
    return typeof val === "number" && !Number.isNaN(val) ? val : NaN;
  } catch {
    return NaN;
  }
}

export default function ScientificCalculator({
  isOpen,
  onClose,
  isEmbedded = false,
  isStandalone = false,
}: Props) {
  const [expression, setExpression] = useState("");
  const [displayResult, setDisplayResult] = useState("0");
  const [isRad, setIsRad] = useState(false); // Default: DEG (standard for high school/freshman)
  const [lastAnswer, setLastAnswer] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [history, setHistory] = useState<{ expr: string; res: string }[]>([]);

  // Draggable position state for floating mode
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    closeToolOverlay("calculator");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen && pos === null && !isEmbedded && typeof window !== "undefined") {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const targetW = Math.min(360, w - 24);
      setPos({
        x: Math.max(12, w - targetW - 16),
        y: Math.max(70, h - 560),
      });
    }
  }, [isOpen, pos, isEmbedded]);

  // Insert token in natural mathematical order (e.g. sin( -> 30 -> ) -> =)
  const appendToken = useCallback((token: string) => {
    setExpression((prev) => {
      // If we just evaluated and type a digit or function, start fresh
      return prev + token;
    });
  }, []);

  const clearAll = useCallback(() => {
    setExpression("");
    setDisplayResult("0");
  }, []);

  const backspace = useCallback(() => {
    setExpression((prev) => {
      if (!prev) return "";
      // If ends with a function call like 'sin(' or 'sqrt(', delete the whole function name
      const fnMatches = ["sin(", "cos(", "tan(", "asin(", "acos(", "atan(", "sqrt(", "log(", "ln(", "abs("];
      for (const fn of fnMatches) {
        if (prev.endsWith(fn)) {
          return prev.slice(0, -fn.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, []);

  const calculate = useCallback(() => {
    if (!expression.trim()) return;

    try {
      const result = evaluateScientificExpression(expression, isRad);
      if (Number.isNaN(result) || !Number.isFinite(result)) {
        setDisplayResult("Error");
      } else {
        const rounded = Math.round(result * 1e10) / 1e10;
        const resultStr = String(rounded);
        setDisplayResult(resultStr);
        setLastAnswer(rounded);
        setHistory((h) => [{ expr: expression, res: resultStr }, ...h.slice(0, 4)]);
      }
    } catch {
      setDisplayResult("Error");
    }
  }, [expression, isRad]);

  if (!isOpen) return null;

  const content = (
    <div
      ref={cardRef}
      className={`bg-[#0a1122] border border-cyan-400/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans ${
        isStandalone
          ? "w-full max-w-xl mx-auto p-4 sm:p-6"
          : isEmbedded
            ? "w-full max-w-xl mx-auto p-4 sm:p-6"
            : isFullScreen
              ? "fixed inset-0 z-[130] rounded-none border-none p-4 sm:p-6"
              : "w-[min(23rem,calc(100vw-1.5rem))] p-4"
      }`}
      style={
        !isEmbedded && !isStandalone && !isFullScreen && pos
          ? {
              position: "fixed",
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: 130,
            }
          : undefined
      }
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <CalcIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Scientific Calculator
            </h3>
            <span className="text-[10px] text-cyan-300 font-mono">
              Natural Input Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Deg / Rad toggle */}
          <button
            type="button"
            onClick={() => setIsRad((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isRad
                ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
            }`}
          >
            {isRad ? "RAD" : "DEG"}
          </button>

          {!isEmbedded && !isStandalone && (
            <button
              type="button"
              onClick={() => setIsFullScreen((v) => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullScreen ? "Restore" : "Full Screen"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold active:scale-95 transition-all cursor-pointer"
            title="Close calculator and return to tools"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* ── Display Box ── */}
      <div className="my-3 p-3.5 rounded-2xl bg-[#040813] border border-white/10 flex flex-col justify-end text-right min-h-[5.5rem] shadow-inner select-text">
        <div className="text-xs text-slate-400 font-mono overflow-x-auto whitespace-nowrap scrollbar-none min-h-[1.25rem]">
          {expression || "sin(30) = 0.5"}
        </div>
        <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-300 overflow-x-auto whitespace-nowrap scrollbar-none tracking-tight mt-1">
          {displayResult}
        </div>
      </div>

      {/* ── Keypad Grid (Scientific Layout) ── */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 select-none text-xs sm:text-sm font-semibold">
        {/* Row 1: Trig functions */}
        <button
          type="button"
          onClick={() => appendToken("sin(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          sin
        </button>
        <button
          type="button"
          onClick={() => appendToken("cos(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          cos
        </button>
        <button
          type="button"
          onClick={() => appendToken("tan(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          tan
        </button>
        <button
          type="button"
          onClick={() => appendToken("π")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-purple-300 active:scale-95 transition-all"
        >
          π
        </button>
        <button
          type="button"
          onClick={() => appendToken("e")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-purple-300 active:scale-95 transition-all"
        >
          e
        </button>

        {/* Row 2: Inverses & Powers */}
        <button
          type="button"
          onClick={() => appendToken("asin(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          asin
        </button>
        <button
          type="button"
          onClick={() => appendToken("acos(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          acos
        </button>
        <button
          type="button"
          onClick={() => appendToken("atan(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          atan
        </button>
        <button
          type="button"
          onClick={() => appendToken("sqrt(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-purple-300 active:scale-95 transition-all"
        >
          √
        </button>
        <button
          type="button"
          onClick={() => appendToken("^")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-purple-300 active:scale-95 transition-all"
        >
          xʸ
        </button>

        {/* Row 3: Log, Ln, Brackets */}
        <button
          type="button"
          onClick={() => appendToken("ln(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          ln
        </button>
        <button
          type="button"
          onClick={() => appendToken("log(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 text-cyan-300 active:scale-95 transition-all"
        >
          log
        </button>
        <button
          type="button"
          onClick={() => appendToken("(")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 active:scale-95 transition-all"
        >
          (
        </button>
        <button
          type="button"
          onClick={() => appendToken(")")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 active:scale-95 transition-all"
        >
          )
        </button>
        <button
          type="button"
          onClick={() => appendToken("!")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-purple-300 active:scale-95 transition-all"
        >
          n!
        </button>

        {/* Row 4: Digits 7,8,9, Del, AC */}
        <button
          type="button"
          onClick={() => appendToken("7")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => appendToken("8")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => appendToken("9")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          9
        </button>
        <button
          type="button"
          onClick={backspace}
          className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 active:scale-95 transition-all flex items-center justify-center"
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 active:scale-95 transition-all font-bold"
        >
          AC
        </button>

        {/* Row 5: Digits 4,5,6, Operators */}
        <button
          type="button"
          onClick={() => appendToken("4")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => appendToken("5")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => appendToken("6")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => appendToken("×")}
          className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-bold active:scale-95 transition-all"
        >
          ×
        </button>
        <button
          type="button"
          onClick={() => appendToken("÷")}
          className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-bold active:scale-95 transition-all"
        >
          ÷
        </button>

        {/* Row 6: Digits 1,2,3, Plus, Minus */}
        <button
          type="button"
          onClick={() => appendToken("1")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => appendToken("2")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => appendToken("3")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => appendToken("+")}
          className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-bold active:scale-95 transition-all"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => appendToken("−")}
          className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 font-bold active:scale-95 transition-all"
        >
          −
        </button>

        {/* Row 7: 0, ., Ans, %, = */}
        <button
          type="button"
          onClick={() => appendToken("0")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => appendToken(".")}
          className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold active:scale-95 transition-all"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => appendToken(String(lastAnswer))}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-amber-300 active:scale-95 transition-all"
          title="Last Answer"
        >
          Ans
        </button>
        <button
          type="button"
          onClick={() => appendToken("%")}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 active:scale-95 transition-all"
        >
          %
        </button>
        <button
          type="button"
          onClick={calculate}
          className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
        >
          =
        </button>
      </div>
    </div>
  );

  return content;
}
