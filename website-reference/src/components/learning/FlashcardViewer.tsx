"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, X, RotateCcw, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { saveProgress } from "@/lib/contentWithOffline";
import RichContent from "@/components/learning/RichContent";

type Card = { front: string; back: string };
type Props = { meta: Record<string, unknown>; resourceId?: string };
type Grade = "know" | "learning" | "again";

const SWIPE_THRESHOLD = 60;
const ANIM_MS = 320;

export default function FlashcardViewer({ meta, resourceId }: Props) {
  const cards = (Array.isArray(meta.cards) ? meta.cards : []) as Card[];
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [grades, setGrades] = useState<Record<number, Grade>>({});
  const [done, setDone] = useState(false);
  const [slideDir, setSlideDir] = useState<"next" | "prev" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const vals = Object.values(grades);
    const know = vals.filter((g) => g === "know").length;
    const learning = vals.filter((g) => g === "learning").length;
    const again = vals.filter((g) => g === "again").length;
    const seen = vals.length;
    const total = cards.length;
    const accuracy = seen ? Math.round((know / seen) * 100) : 0;
    return { know, learning, again, seen, total, accuracy };
  }, [grades, cards.length]);

  useEffect(() => {
    if (!resourceId || cards.length === 0) return;
    void saveProgress({
      resourceId,
      progressPct: Math.round((stats.seen / Math.max(1, cards.length)) * 100),
      meta: { flashcards: stats },
    });
  }, [stats, resourceId, cards.length]);

  const goTo = useCallback(
    (nextIndex: number, dir: "next" | "prev") => {
      if (isAnimating || nextIndex < 0 || nextIndex >= cards.length) return;
      setIsAnimating(true);
      setSlideDir(dir);
      setFlipped(false);
      window.setTimeout(() => {
        setI(nextIndex);
        setSlideDir(null);
        window.setTimeout(() => setIsAnimating(false), 40);
      }, ANIM_MS);
    },
    [isAnimating, cards.length]
  );

  const grade = useCallback(
    (g: Grade) => {
      setGrades((prev) => ({ ...prev, [i]: g }));
      if (i < cards.length - 1) {
        goTo(i + 1, "next");
      } else {
        setDone(true);
      }
    },
    [i, cards.length, goTo]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || isAnimating) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) {
      if (i < cards.length - 1) goTo(i + 1, "next");
    } else {
      if (i > 0) goTo(i - 1, "prev");
    }
  };

  if (!cards.length) {
    return <p className="text-sm text-wisdom-muted">No cards in this deck yet.</p>;
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-6 text-center space-y-3">
        <BarChart3 className="w-8 h-8 mx-auto text-violet-300" />
        <p className="font-display text-xl font-bold text-white">Deck complete</p>
        <p className="text-sm text-wisdom-muted">
          Know {stats.know} · Learning {stats.learning} · Again {stats.again}
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setGrades({});
            setI(0);
            setFlipped(false);
            setSlideDir(null);
            setIsAnimating(false);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-bold"
        >
          <RotateCcw className="w-4 h-4" /> Practice again
        </button>
      </div>
    );
  }

  const card = cards[i];
  const slideClass =
    slideDir === "next"
      ? "fc-slide-out-left"
      : slideDir === "prev"
        ? "fc-slide-out-right"
        : "fc-slide-idle";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg border border-white/10 px-2.5 py-1 text-wisdom-muted">
          {i + 1}/{cards.length}
        </span>
        <span className="rounded-lg border border-emerald-400/25 px-2.5 py-1 text-emerald-200">
          Know {stats.know}
        </span>
        <span className="rounded-lg border border-amber-400/25 px-2.5 py-1 text-amber-200">
          Learning {stats.learning}
        </span>
        <span className="rounded-lg border border-rose-400/25 px-2.5 py-1 text-rose-200">
          Again {stats.again}
        </span>
      </div>

      <div
        className="fc-scene"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ minHeight: 300 }}
      >
        <div
          ref={cardRef}
          className={`fc-card ${slideClass} ${flipped ? "is-flipped" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Answer: tap to flip back" : "Question: tap to flip"}
          onClick={() => {
            if (!isAnimating) setFlipped((f) => !f);
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              if (!isAnimating) setFlipped((f) => !f);
            }
          }}
        >
          <div className="fc-face fc-front">
            <p className="text-xs uppercase tracking-wider text-violet-300 font-extrabold mb-2.5">
              Question · tap to flip
            </p>
            <div className="study-prose text-white text-lg sm:text-xl font-bold italic font-serif leading-snug">
              <RichContent body={card.front} />
            </div>
          </div>

          <div className="fc-face fc-back">
            <p className="text-xs uppercase tracking-wider text-cyan-300 font-extrabold mb-2.5">
              Answer · tap to flip
            </p>
            <div className="study-prose text-white text-lg sm:text-xl font-bold italic font-serif leading-snug">
              <RichContent body={card.back} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-wisdom-muted">
        Swipe left/right to change card · Tap to flip
      </p>

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goTo(i - 1, "prev")}
            disabled={i === 0 || isAnimating}
            className="p-2 rounded-xl border border-white/12 disabled:opacity-40"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(i + 1, "next")}
            disabled={i >= cards.length - 1 || isAnimating}
            className="p-2 rounded-xl border border-white/12 disabled:opacity-40"
            aria-label="Next card"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => grade("again")}
            disabled={isAnimating}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-400/40 text-rose-200 text-sm font-semibold disabled:opacity-40"
          >
            <X className="w-4 h-4" /> Again
          </button>
          <button
            type="button"
            onClick={() => grade("learning")}
            disabled={isAnimating}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-amber-400/40 text-amber-200 text-sm font-semibold disabled:opacity-40"
          >
            Learning
          </button>
          <button
            type="button"
            onClick={() => grade("know")}
            disabled={isAnimating}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 text-wisdom-dark text-sm font-bold disabled:opacity-40"
          >
            <Check className="w-4 h-4" /> Know
          </button>
        </div>
      </div>
    </div>
  );
}
