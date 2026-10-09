"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { motivationalQuotes, type MotivationalQuote } from "@/data/motivational-quotes";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function quoteForSlot(now = Date.now()): MotivationalQuote {
  const slot = Math.floor(now / TWO_HOURS_MS);
  const i = Math.abs(slot) % motivationalQuotes.length;
  return motivationalQuotes[i]!;
}

export default function LandingQuoteCard() {
  const [q, setQ] = useState<MotivationalQuote | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setQ(quoteForSlot());
    const t = window.setTimeout(() => setVisible(true), 80);
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setQ(quoteForSlot());
        setVisible(true);
      }, 280);
    }, 60_000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, []);

  if (!q) return null;

  return (
    <section className="pb-10 md:pb-14 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-wisdom-card via-wisdom-navy/90 to-wisdom-card px-6 py-8 sm:px-10 sm:py-10 shadow-card-3d transition-all duration-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
              <Quote className="w-6 h-6" />
            </span>
            <div className="min-w-0 flex-1">
              <blockquote className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-white leading-snug tracking-tight">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-medium text-amber-200/90">- {q.author}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
