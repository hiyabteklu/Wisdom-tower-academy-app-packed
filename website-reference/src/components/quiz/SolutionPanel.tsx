"use client";

import { useState } from "react";
import { BadgeCheck, Lightbulb, Loader2 } from "lucide-react";
import MathText from "@/components/MathText";

type Props = {
  solution?: string;
  enableAi?: boolean;
  questionId: string;
  question: string;
  choices: string[];
  studentAnswer: string;
  correctAnswer: string;
  subject: string;
  difficulty: string;
};

type ExplainResponse = {
  explanation?: string;
  cached?: boolean;
  fallback?: boolean;
  error?: string;
  detail?: string;
};

export default function SolutionPanel({
  solution,
  enableAi = true,
  questionId,
  question,
  choices,
  studentAnswer,
  correctAnswer,
  subject,
  difficulty,
}: Props) {
  const [showSolution, setShowSolution] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiMeta, setAiMeta] = useState<{ cached?: boolean; fallback?: boolean } | null>(
    null
  );
  const [aiError, setAiError] = useState("");

  const hasPremade = Boolean(solution?.trim());

  async function handleAiExplain() {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "question",
          questionId,
          question,
          text: question,
          choices,
          studentAnswer,
          correctAnswer,
          solution,
          subject,
          difficulty,
        }),
      });
      const data = (await res.json()) as ExplainResponse;
      if (data.explanation) {
        setAiText(data.explanation);
        setAiMeta({ cached: data.cached, fallback: data.fallback });
      } else {
        setAiError(data.error || data.detail || "Could not load AI explanation.");
      }
    } catch {
      setAiError("Network error. Try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  if (!hasPremade && !enableAi) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {hasPremade && (
          <button
            type="button"
            onClick={() => setShowSolution((v) => !v)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors ${
              showSolution
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-white/15 bg-white/5 text-white/90 hover:border-emerald-400/30 hover:text-emerald-200"
            }`}
          >
            <BadgeCheck className="w-4 h-4" />
            {showSolution ? "Hide official solution" : "Official solution"}
          </button>
        )}

        {enableAi && (
          <button
            type="button"
            onClick={handleAiExplain}
            disabled={aiLoading || Boolean(aiText && !aiMeta?.fallback)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-200 text-sm font-semibold hover:bg-violet-500/20 disabled:opacity-60 transition-colors"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            {aiLoading
              ? "Generating…"
              : aiText && !aiMeta?.fallback
                ? "AI explanation ready"
                : "Explain with AI"}
          </button>
        )}
      </div>

      {showSolution && hasPremade && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3.5">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/90">
              Official solution
            </span>
          </div>
          <div className="solution-text text-sm sm:text-base font-medium italic text-white leading-relaxed">
            <MathText text={solution || ""} />
          </div>
        </div>
      )}

      {aiError && <p className="text-xs text-amber-300/90">{aiError}</p>}

      {aiText && (
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 px-4 py-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300/90">
              AI explanation
            </span>
          </div>
          <div className="explanation-text text-sm sm:text-base font-medium italic text-white leading-relaxed">
            <MathText text={aiText} />
          </div>
        </div>
      )}
    </div>
  );
}
