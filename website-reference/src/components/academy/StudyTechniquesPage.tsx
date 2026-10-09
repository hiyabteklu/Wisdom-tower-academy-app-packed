import { BookOpen } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import PageNotes from "@/components/academy/PageNotes";
import {
  StudyRecall,
  StudySpacing,
  StudyTesting,
  StudyInterleave,
  StudyHabits,
  StudyTraps,
  StudyFooter,
} from "@/components/academy/StudyTechniquesSections";

const navItems = [
  { id: "recall", label: "Active recall", accent: "text-amber-300" },
  { id: "spacing", label: "Spacing", accent: "text-orange-300" },
  { id: "testing", label: "Practice tests", accent: "text-rose-300" },
  { id: "interleave", label: "Mixing topics", accent: "text-violet-300" },
  { id: "habits", label: "Everyday habits", accent: "text-cyan-300" },
  { id: "traps", label: "What to drop", accent: "text-rose-200" },
];

export default function StudyTechniquesPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/3 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-rose-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-8 md:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.05] border border-white/10 text-amber-300 mb-3">
            Other resources
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-4">
            <span className="text-white">Evidence-Based </span>
            <span className="text-amber-300">Study Techniques</span>
          </h1>
          <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-reading">
            <p>
              Covering pages and highlighting lines can feel like work. Often it is only exposure.
              What tends to stick is what you can produce from memory without looking: a definition in your
              own words, a method you can choose under time pressure, a problem you solve from a
              blank page.
            </p>
            <p>
              This guide walks through methods that match how memory actually forms. None of them
              require an innate gift. They require structured retrieval, honest feedback, and
              deliberate practice.
            </p>
          </div>
        </header>

        {/* Quick Jump Pills: Control Center Style */}
        <nav className="mb-10 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border border-white/10 bg-[#0c1328]/70 hover:bg-[#0f1833]/85 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <span className={item.accent}>•</span> {item.label}
            </a>
          ))}
        </nav>

        {/* Why the usual routine disappoints */}
        <section className="mb-12 rounded-3xl border border-amber-400/25 bg-[#0c1328]/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0_0_0/0.18)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Why the usual routine disappoints
              </h2>
              <p>
                Rereading a chapter until it feels familiar is calming. Watching a clear video is
                pleasant. Neither one forces your mind to generate the answer. On exam day the
                question is closed book, timed, and mixed with other topics. If your only practice
                was open book and smooth, the gap shows up late.
              </p>
              <p>
                A better measure of a study session is simple: what can you produce from memory
                afterward? If the answer is thin, the session taught less than the hours suggest.
              </p>
            </div>
          </div>
        </section>

        <StudyRecall />
        <StudySpacing />
        <StudyTesting />
        <StudyInterleave />
        <StudyHabits />
        <StudyTraps />
        <StudyFooter />
        <PageNotes pageSlug="study-techniques" />
      </div>
    </div>
  );
}
