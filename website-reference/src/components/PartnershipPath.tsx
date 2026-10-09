"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Package,
  ClipboardCheck,
  Handshake,
  Briefcase,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

const COVER = "/images/academy/partnership.jpg";

const stages = [
  {
    n: 1,
    title: "What we’re looking for",
    icon: Package,
    accent: "text-amber-300",
    border: "border-amber-400/40",
    bg: "from-amber-500/20 to-orange-500/5",
    body: "Courses, modules, or learning tools that help students in our community: secondary, freshman, entrance, and professional tracks.",
    points: [
      "Premade courses ready for students",
      "Packages for business, tech, or personal development",
      "Tools that reduce friction in real study paths",
    ],
  },
  {
    n: 2,
    title: "How we review",
    icon: ClipboardCheck,
    accent: "text-sky-300",
    border: "border-sky-400/40",
    bg: "from-sky-500/20 to-cyan-500/5",
    body: "Every proposal is checked against community standards: clarity, accuracy, and usefulness for Ethiopian learners first.",
    points: [
      "Alignment with our six academic branches",
      "Quality of materials and teaching design",
      "Fit with ethics and practical outcomes",
    ],
  },
  {
    n: 3,
    title: "How we partner",
    icon: Handshake,
    accent: "text-emerald-300",
    border: "border-emerald-400/40",
    bg: "from-emerald-500/20 to-teal-500/5",
    body: "From co-branded modules to hosted content on Academy pathways: we structure collaboration so both sides know the scope.",
    points: [
      "Clear ownership and credit",
      "Shared or hosted delivery options",
      "Room to grow with measured adoption",
    ],
  },
  {
    n: 4,
    title: "We’re open",
    icon: Briefcase,
    accent: "text-amber-200",
    border: "border-amber-400/35",
    bg: "from-amber-500/15 to-transparent",
    body: "Bring premade courses, cohort ideas, or institutional packages. Tell us who you serve, what you’ve already built, and how it could sit beside our pathways. Incomplete pitches are fine: clarity beats polish.",
    points: [
      "Student-first content",
      "Business & tech upskilling",
      "Personal development tracks",
      "Co-branded or hosted delivery",
    ],
  },
] as const;

export default function PartnershipPath() {
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

  const stage = stages[open];
  const Icon = stage.icon;
  const allRead = maxReached >= stages.length - 1;

  const tryOpen = useCallback(
    (i: number) => {
      if (i > maxReached) return;
      setOpen(i);
    },
    [maxReached]
  );

  const goNext = useCallback(() => {
    if (open < stages.length - 1) {
      const next = open + 1;
      setMaxReached((m) => Math.max(m, next));
      setOpen(next);
    }
  }, [open]);

  const goPrev = useCallback(() => {
    if (open === 0) return;
    setOpen(open - 1);
  }, [open]);

  return (
    <div className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d hide-on-app">
      {/* 16:9 cover: click to open path */}
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="relative block w-full aspect-video overflow-hidden bg-wisdom-navy text-left group"
        aria-expanded={started}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COVER}
          alt="Open for partnership and collaboration"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-300/95 mb-2">
            Build with us
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-xl">
            Open for partnership &amp; collaboration
          </h2>
          <p className="mt-3 text-sm text-white/80 max-w-md">
            {started ? "Path open below: follow the steps" : "Tap to explore the partnership path"}
          </p>
          {!started && (
            <span className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold shadow-lg shadow-amber-500/30">
              Open path
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </button>

      {started && (
        <div className="p-5 sm:p-7 md:p-8 border-t border-white/10">
          <p className="text-sm text-wisdom-muted mb-6 max-w-2xl leading-relaxed">
            Educators, course creators, and institutions: we review for fit with our community, not
            volume of pitch decks. Read each step in order.
          </p>

          {/* Step tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-5">
            {stages.map((s, i) => {
              const SIcon = s.icon;
              const locked = i > maxReached;
              const isOpen = open === i;
              return (
                <button
                  key={s.n}
                  type="button"
                  disabled={locked}
                  onClick={() => tryOpen(i)}
                  className={`relative flex flex-col items-center shrink-0 min-w-[4.5rem] rounded-xl px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 ${
                    locked ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      isOpen
                        ? `${s.border} bg-gradient-to-br ${s.bg} ${s.accent} scale-105 shadow-md`
                        : "border-white/12 bg-wisdom-dark/60 text-white/60"
                    }`}
                  >
                    {locked ? <Lock className="w-5 h-5" /> : <SIcon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-bold text-center leading-tight ${
                      isOpen ? "text-white" : "text-wisdom-muted"
                    }`}
                  >
                    {s.n}. {s.title.split(" ")[0]}
                  </span>
                </button>
              );
            })}
            <div
              className={`flex flex-col items-center shrink-0 min-w-[4.5rem] px-2 py-2 ${
                allRead ? "" : "opacity-40"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center ${
                  allRead
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                    : "border-white/12 bg-wisdom-dark/60 text-white/30"
                }`}
              >
                {allRead ? <Mail className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <span className="mt-1.5 text-[11px] font-bold text-wisdom-muted">Contact</span>
            </div>
          </div>

          {/* Active stage panel */}
          <div
            key={stage.n}
            className={`rounded-2xl border ${stage.border} bg-gradient-to-br ${stage.bg} p-5 sm:p-6`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-11 h-11 rounded-xl border ${stage.border} bg-wisdom-dark/50 flex items-center justify-center ${stage.accent}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-wider ${stage.accent}`}>
                  Step {stage.n} of {stages.length}
                </p>
                <h3 className="font-display text-xl font-extrabold text-white">{stage.title}</h3>
              </div>
            </div>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-4">{stage.body}</p>

            <ul className="space-y-2 mb-5">
              {stage.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-white/85">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${stage.accent}`} />
                  <span className="leading-snug">{p}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={open === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-white/80 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {open < stages.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border text-sm font-bold ${stage.border} ${stage.accent} bg-white/10 hover:bg-white/15`}
                >
                  Next step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/contact?topic=partnership"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Start a conversation
                </Link>
              )}
            </div>
          </div>

          {!allRead && (
            <p className="mt-4 text-center text-xs text-wisdom-muted">
              Use <strong className="text-white/85">Next step</strong> to unlock the rest. Contact
              unlocks after the final step.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
