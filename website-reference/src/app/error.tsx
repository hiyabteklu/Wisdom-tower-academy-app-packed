"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, BookOpen } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Wisdom Tower Academy] Unhandled error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg rounded-3xl border border-rose-500/25 bg-wisdom-card p-7 sm:p-10 text-center shadow-card-3d animate-scale-in">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400/90 mb-1.5">
          Temporary Display Issue
        </p>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Something went wrong
        </h1>

        <p className="text-sm text-wisdom-muted leading-relaxed max-w-md mx-auto mb-8">
          An unexpected issue occurred while rendering this view. Your study sessions,
          progress, and account data remain completely safe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-wisdom-dark font-bold text-sm hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>

          <Link
            href="/learning"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-cyan-300" />
            Learning hub
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-medium text-sm hover:text-white hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
