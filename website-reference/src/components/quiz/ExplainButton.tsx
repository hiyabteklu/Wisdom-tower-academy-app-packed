"use client";

import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";

type Props = {
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
};

export default function ExplainButton(props: Props) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ cached?: boolean; fallback?: boolean } | null>(null);
  const [error, setError] = useState("");

  async function handleExplain() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const data = (await res.json()) as ExplainResponse;
      if (data.explanation) {
        setText(data.explanation);
        setMeta({ cached: data.cached, fallback: data.fallback });
      } else {
        setError(data.error || "Could not load explanation.");
      }
    } catch {
      setError("Network error. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {!text && (
        <button
          type="button"
          onClick={handleExplain}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/20 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          {loading ? "Generating…" : "Explain"}
        </button>
      )}

      {error && <p className="text-xs text-amber-300/90">{error}</p>}

      {text && (
        <div className="rounded-2xl border border-white/10 bg-wisdom-dark/50 px-4 py-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300/90">
              Explanation
            </span>
          </div>
          <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
}
