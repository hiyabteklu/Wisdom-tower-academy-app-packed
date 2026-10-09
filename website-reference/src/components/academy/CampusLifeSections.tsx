import Link from "next/link";
import {
  ArrowRight,
  Users,
  Heart,
  Brain,
  Flame,
  Shield,
  Coffee,
  BookOpen,
  MapPin,
  UsersRound,
  MessageSquare,
  Library,
  Building2,
  AlertTriangle,
  ListChecks,
  CheckCircle2,
} from "lucide-react";

export function CampusFriends() {
  return (
    <section id="friends" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-11 h-11 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0 shadow-sm">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300 text-[10px] font-mono font-bold flex items-center justify-center">
              01
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300/90">
              Social Dynamics
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Friends & Social Life
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-6 sm:p-7 space-y-3.5 shadow-[0_8px_30px_rgb(0_0_0/0.18)]">
          <h3 className="font-display text-base sm:text-lg font-bold text-white">
            Keeping friends without losing the semester
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            University is where many people meet the friends they keep for years. That matters.
            What also matters is that endless availability-answering every message the moment
            it arrives, accepting every invitation because saying no feels rude-leaves almost
            no quiet stretch for real study.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            You do not need to become cold. You need a simple pattern: some hours are for work,
            and during those hours you are allowed to be slow to reply. When you are free, be
            actually free. People respect clarity more than vague half-attention all day long.
          </p>
          <div className="pt-2">
            <ul className="space-y-2">
              {[
                "Block a few study hours where your phone is not the priority.",
                "Put social plans after those blocks when you can, not in the middle of them.",
                "A short, honest 'I am finishing this, talk later' is enough; you do not owe a speech.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 font-reading">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-rose-300 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-2.5 shadow-md">
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              What &ldquo;everyone is doing&rdquo; really means
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
              Peer pressure on campus rarely looks like orders. More often it is the quiet assumption
              that skipping class is normal, or that starting assignments the night before is standard.
              Decide your minimum standards in advance and study near peers who work diligently.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-2.5 shadow-md">
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Loneliness is not discipline
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
              Cutting everyone off is not a healthy strategy. Most students thrive with one or two
              steady, reliable relationships rather than large superficial circles. Schedule
              meaningful connections like a weekly study walk or a short call home.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CampusMind() {
  return (
    <section id="mind" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-11 h-11 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 flex items-center justify-center shrink-0 shadow-sm">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 text-[10px] font-mono font-bold flex items-center justify-center">
              02
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300/90">
              Mental Stamina
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Energy & Pressure Management
          </h2>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <article className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-3 shadow-md hover:border-white/20 transition-all">
          <div className="flex items-center gap-2.5 text-violet-300">
            <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              When motivation comes and goes
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            Some weeks you feel sharp; other weeks opening the textbook feels heavy. On low-energy
            days, shrink the scope: do a 15-minute recall review or one section of problems. Continuity
            beats boom-and-bust cramming.
          </p>
        </article>

        <article className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-3 shadow-md hover:border-white/20 transition-all">
          <div className="flex items-center gap-2.5 text-violet-300">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Noticing burnout early
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            Burnout builds quietly: you sleep but wake up exhausted, tasks feel numb, or irritability
            spikes. Cut study volume, simplify your commitments, and talk to someone early instead
            of pushing until complete collapse.
          </p>
        </article>

        <article className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-3 shadow-md hover:border-white/20 transition-all">
          <div className="flex items-center gap-2.5 text-violet-300">
            <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Showing up routinely
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            Do not wait for inspirational moods. Anchor to simple physical triggers: the same desk,
            a consistent starting hour, and an easy first step. Reliable small steps get you across
            four or five undergraduate years.
          </p>
        </article>

        <article className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-3 shadow-md hover:border-white/20 transition-all">
          <div className="flex items-center gap-2.5 text-violet-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Rest that actually restores
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            Infinite phone scrolling leaves you depleted. Authentic restoration means uninterrupted
            sleep, sunlight, walking outdoors, screen-free meals, and genuine human conversations.
          </p>
        </article>
      </div>
    </section>
  );
}

export function CampusLectures() {
  return (
    <section id="lectures" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-11 h-11 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0 shadow-sm">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-300 text-[10px] font-mono font-bold flex items-center justify-center">
              03
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300/90">
              Classroom Strategy
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Lectures & Classroom Time
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-2 shadow-md">
            <h3 className="font-display text-sm sm:text-base font-bold text-sky-200">
              Where you sit and how you listen
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
              Sitting in front where you clearly view the board reduces the cognitive strain of
              staying locked into complex derivations. The back rows invite distractions and lost hours.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-2 shadow-md">
            <h3 className="font-display text-sm sm:text-base font-bold text-sky-200">
              Attendance without perfectionism
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
              You will occasionally miss class. What matters is never leaving a missed core concept
              unrepaired. Treat the day you missed as the deadline to copy notes and derive the examples.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-2 shadow-md">
            <h3 className="font-display text-sm sm:text-base font-bold text-sky-200">
              Phone silence and attention resets
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
              Attention drifts for everyone. Silence notifications and mark the moment your focus
              strayed. Focus is a muscle you re-engage throughout the hour, not an all-or-nothing test.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 sm:p-6 space-y-2 shadow-md">
            <h3 className="font-display text-sm sm:text-base font-bold text-sky-200">
              When the instruction feels dense
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
              Not every professor explains concepts accessibly. Treat the lecture as an outline of
              what the university values, then verify concepts in textbooks or with classmates immediately after.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-sky-400/25 bg-sky-500/[0.06] backdrop-blur-xl p-5 sm:p-6 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
            <p className="font-bold text-sky-200">The 15-Minute Same-Day Payoff</p>
            <p className="text-slate-300 font-reading">
              Immediately after a demanding lecture, write three core takeaways on a blank page from
              memory before checking your notes. This simple habit preserves weeks of preparation effort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CampusPlaces() {
  return (
    <section id="places" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-5 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center">
              04
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/90">
              Campus Facilities
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Places, Study Groups & Faculty
          </h2>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <article className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 space-y-3 shadow-md hover:border-white/20 transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-sm">
            <Library className="w-4 h-4" />
          </div>
          <h3 className="font-display text-sm sm:text-base font-bold text-white">
            Use buildings on purpose
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            The university library is for deep concentration; dorms and cafeterias are for unwinding.
            Separating physical spaces prevents mental clutter.
          </p>
        </article>

        <article className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 space-y-3 shadow-md hover:border-white/20 transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-sm">
            <UsersRound className="w-4 h-4" />
          </div>
          <h3 className="font-display text-sm sm:text-base font-bold text-white">
            Group work discipline
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            Agree on milestones, dates, and ownership early. Never leave collective assignments
            for a frantic overnight rush the evening before submission.
          </p>
        </article>

        <article className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl p-5 space-y-3 shadow-md hover:border-white/20 transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="font-display text-sm sm:text-base font-bold text-white">
            Approaching instructors
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            Bring precise problem statements to office hours early in the term. Instructors respect
            proactive curiosity much more than vague last-minute exam panicking.
          </p>
        </article>
      </div>
    </section>
  );
}

export function CampusChecklist() {
  return (
    <section className="mb-14 rounded-3xl border border-sky-400/20 bg-[#0c1328]/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0_0_0/0.18)]">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 flex items-center justify-center">
          <ListChecks className="w-4 h-4" />
        </div>
        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
          A Simple Weekly Reflection Check
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed font-reading">
        You do not need to tick every box every week. Use this diagnostic when the term begins
        feeling noisy, unfocused, or overwhelming:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
        {[
          "At least one stretch of real focus away from group chats and open invitations",
          "One genuine conversation or check-in, not only reacting to notifications",
          "Same-day review after the hardest lecture you attended",
          "Studying at least once in a place chosen for the work, not only by habit",
          "An honest look at sleep, mood, and avoidance, reducing load when running empty",
          "For any group task, roles and dates written down before deadlines approach",
        ].map((item) => (
          <div
            key={item}
            className="flex gap-3 items-start rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 font-reading"
          >
            <Heart className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
            <span className="text-slate-300 leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CampusFooter() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0c1328]/80 backdrop-blur-xl p-8 sm:p-10 text-center space-y-4 shadow-lg">
      <div className="w-12 h-12 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 flex items-center justify-center mx-auto shadow-sm">
        <Building2 className="w-5 h-5" />
      </div>
      <h2 className="font-display text-lg sm:text-xl font-bold text-white">
        Campus Habits and Study Skill Go Together
      </h2>
      <p className="text-slate-300 max-w-md mx-auto text-xs sm:text-sm leading-relaxed font-reading">
        How you live among people and places determines how much mental energy you have available.
        Pair this guide with evidence-based study techniques and university program details.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        <Link
          href="/academy/study-techniques"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95"
        >
          <span>Study Techniques</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/academy/universities"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.04] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <span>Universities Guide</span>
        </Link>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.04] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <span>Academy Home</span>
        </Link>
      </div>
    </div>
  );
}
