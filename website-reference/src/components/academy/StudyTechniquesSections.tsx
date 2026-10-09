import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Clock,
  ClipboardCheck,
  Shuffle,
  FileText,
  MessageCircle,
  Ban,
  Lightbulb,
  CheckCircle2,
  PenLine,
} from "lucide-react";

export function StudyRecall() {
  return (
    <section id="recall" className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">
              01
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
              Core Principle
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Active Recall</h2>
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0_0_0/0.18)]">
        <p className="text-white/95 font-semibold text-xs sm:text-sm">
          Learning is not only what goes in. It is what you can pull back out without the page in front of you.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-reading">
          Recognition is easy. You open the notes, see a formula, and think you know this.
          Closing the book and writing that formula from scratch is harder. That mental effort is
          useful: each time you retrieve something successfully, the synaptic path strengthens.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Try This Routine</span>
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-reading">
              {[
                "After a section, close everything and write what you remember.",
                "Explain a lecture out loud without looking at notes.",
                "Attempt a problem before you watch or read the solution.",
              ].map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Common Trap</span>
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-reading">
              Rereading until the text feels familiar, then stopping. Familiarity is passive recognition, not the ability to produce the answer on exam day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudySpacing() {
  return (
    <section id="spacing" className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300 flex items-center justify-center shrink-0 shadow-sm">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-orange-400/30 bg-orange-500/10 text-orange-300 text-[10px] font-mono font-bold flex items-center justify-center">
              02
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300/90">
              Retention Rhythm
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Spacing Your Review</h2>
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0_0_0/0.18)]">
        <p className="text-white/95 font-semibold text-xs sm:text-sm">
          Memory naturally fades. Returning after deliberate intervals is how you convert short-term exposure into permanent recall.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-reading">
          Cramming an entire chapter in one evening can make you fluent for a few hours. A few days later, much of that fluency disappears.
          Spreading the same total study hours across several spaced intervals leaves substantially higher retention behind.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Try This Routine</span>
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-reading">
              {[
                "Revisit important ideas days and weeks later, not only the night before.",
                "Spend ten minutes on last week's material before starting new work.",
                "Space formulas and definitions; let minor details wait until required.",
              ].map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="text-orange-400 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Common Trap</span>
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-reading">
              Treating a single long night as done for a whole chapter. Short-term fluency during the study session is not the same as durable memory that survives until finals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudyTesting() {
  return (
    <section id="testing" className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0 shadow-sm">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300 text-[10px] font-mono font-bold flex items-center justify-center">
              03
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300/90">
              Low-Stakes Testing
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Practice Testing</h2>
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0_0_0/0.18)]">
        <p className="text-white/95 font-semibold text-xs sm:text-sm">
          Tests are not merely for grading. When used early, self-quizzing is the fastest training mechanism.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-reading">
          Waiting until you feel ready wastes the learning value of early mistakes. A low-stakes quiz or past paper reveals gaps while there is still time to correct them.
          After each attempt, rebuild the correct derivation in writing.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Try This Routine</span>
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-reading">
              {[
                "Attempt practice questions before complete confidence arrives.",
                "Keep a brief error log: what you tried, what went wrong, what is correct.",
                "Time a test section occasionally so you adjust to actual exam pressure.",
              ].map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="text-rose-400 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Common Trap</span>
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-reading">
              Checking the answer key immediately, feeling relieved, and moving on without independently re-solving the problem from scratch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudyInterleave() {
  return (
    <section id="interleave" className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 flex items-center justify-center shrink-0 shadow-sm">
          <Shuffle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 text-[10px] font-mono font-bold flex items-center justify-center">
              04
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300/90">
              Discrimination Skill
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Mixing Related Topics</h2>
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0_0_0/0.18)]">
        <p className="text-white/95 font-semibold text-xs sm:text-sm">
          Doing twenty identical problems feels comfortable. Real university exams shuffle types. Practice should reflect that reality.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-reading">
          Master a method in a focused block first. Once you understand the core mechanics, weave problems with neighboring chapters so selecting the appropriate tool under ambiguity becomes automatic.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Try This Routine</span>
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-reading">
              {[
                "After initial competence, mix problem types in a single drill session.",
                "Revise related chapters in alternating short bursts.",
                "Block practice initially; interleave once the formulas are recognizable.",
              ].map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="text-violet-400 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Common Trap</span>
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-reading">
              Finishing a long run of identical exercises and never practicing selection among competing formulas, leaving you disoriented on exam day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudyHabits() {
  const habits = [
    {
      title: "Blurting & Retrieval",
      icon: PenLine,
      body: "Set a 10-minute timer. Write everything you recall about a topic on a blank page. Compare with your notes, fill the gaps, and retry tomorrow.",
    },
    {
      title: "Plain Language Teaching",
      icon: MessageCircle,
      body: "If you cannot explain an idea in plain words without looking, your mental model is incomplete. Stalling highlights what requires another pass.",
    },
    {
      title: "Turn Notes into Cues",
      icon: FileText,
      body: "Full lecture notes are for initial orientation. For exam revision, shrink them into prompt questions and small diagrams you expand from memory.",
    },
    {
      title: "Protected Focus Blocks",
      icon: Lightbulb,
      body: "Late nights that sacrifice sleep cost more than they yield. A 90-minute protected focus block beats four hours of distracted multitasking.",
    },
  ];

  return (
    <section id="habits" className="mb-12 scroll-mt-24">
      <div className="mb-5">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
          Everyday Habits That Support the Core Four
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          These habits lower cognitive friction and keep your recall and testing schedule consistent.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5">
        {habits.map((h) => {
          const Icon = h.icon;
          return (
            <article
              key={h.title}
              className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 space-y-2.5 shadow-md hover:border-white/20 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shadow-sm">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-white">{h.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-reading">{h.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function StudyTraps() {
  const traps = [
    "Rereading highlighted pages repeatedly until they look familiar",
    "Watching video explanations without pausing to derive the solution yourself",
    "Copying notes from classmates without reconstructing the argument independently",
    "Cramming exclusively the night before and calling it an exam strategy",
    "Avoiding timed mock questions because they feel uncomfortable",
  ];

  return (
    <section id="traps" className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0 shadow-sm">
          <Ban className="w-5 h-5" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
          What to Drop Immediately
        </h2>
      </div>

      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.04] p-5 sm:p-6 space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-rose-200">
          These common study habits feel reassuring but offer almost zero long-term retention:
        </p>
        <ul className="space-y-2">
          {traps.map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 font-reading">
              <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                ×
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function StudyFooter() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-6 sm:p-8 text-center space-y-4 shadow-lg">
      <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto shadow-sm">
        <Lightbulb className="w-5 h-5" />
      </div>
      <h2 className="font-display text-lg sm:text-xl font-bold text-white">
        Technique Still Requires a Sustainable Week
      </h2>
      <p className="text-slate-300 max-w-md mx-auto text-xs sm:text-sm leading-relaxed font-reading">
        Friends, sleep, and physical environment shape whether these methods hold up under midterms.
        Pair these techniques with the campus life navigation guide.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        <Link
          href="/academy/campus-life"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95"
        >
          <span>Campus Life Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.04] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <span>Academy Home</span>
        </Link>
      </div>
    </div>
  );
}
