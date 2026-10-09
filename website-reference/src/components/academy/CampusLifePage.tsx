import {
  Users,
  Brain,
  BookOpen,
  Building2,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import PageNotes from "@/components/academy/PageNotes";
import {
  CampusFriends,
  CampusMind,
  CampusLectures,
  CampusPlaces,
  CampusChecklist,
  CampusFooter,
} from "@/components/academy/CampusLifeSections";

const navSections = [
  {
    id: "friends",
    title: "Friends & Social Life",
    blurb: "Staying close to peers without losing your study momentum or semester goals.",
    accent: "text-rose-300",
    border: "border-rose-400/25",
    iconBg: "border-rose-400/30 bg-rose-500/15 text-rose-300",
    icon: Users,
  },
  {
    id: "mind",
    title: "Energy & Pressure",
    blurb: "Recognizing burnout signs, managing midterms anxiety, and scheduling real physical rest.",
    accent: "text-violet-300",
    border: "border-violet-400/25",
    iconBg: "border-violet-400/30 bg-violet-500/15 text-violet-300",
    icon: Brain,
  },
  {
    id: "lectures",
    title: "Lectures & Class Time",
    blurb: "Extracting actionable understanding from every lecture hall hour, even with fast lecturers.",
    accent: "text-sky-300",
    border: "border-sky-400/25",
    iconBg: "border-sky-400/30 bg-sky-500/15 text-sky-300",
    icon: BookOpen,
  },
  {
    id: "places",
    title: "Places, Groups & Staff",
    blurb: "Navigating quiet libraries, study groups, office hours, and university administration.",
    accent: "text-emerald-300",
    border: "border-emerald-400/25",
    iconBg: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    icon: Building2,
  },
];

export default function CampusLifePage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute top-48 right-0 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.05] border border-white/10 text-sky-300 mb-3">
            Other resources
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-4">
            <span className="text-white">Campus Life </span>
            <span className="text-sky-400">Field Guide</span>
          </h1>
          <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-reading">
            <p>
              Most of what decides your grades does not happen only at a desk with a highlighter.
              It happens in the hours between classes: who you sit with, how late you stay online,
              whether you recover after a hard week, and whether a weak lecture still leaves you with
              something you can revise.
            </p>
            <p>
              This page is a practical guide to that side of university: friendships, pressure,
              classrooms, and the buildings and people around you. Nothing here is a personality
              test. It is ordinary advice that works when you apply it imperfectly but consistently.
            </p>
          </div>
        </header>

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {navSections.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group relative rounded-3xl border border-white/[0.08] bg-[#0c1328]/70 hover:bg-[#0f1833]/85 backdrop-blur-xl p-5 sm:p-6 transition-all duration-300 shadow-[0_8px_30px_rgb(0_0_0/0.18)] hover:scale-[1.01] hover:border-white/20 active:scale-[0.99] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-full border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm ${s.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                      Jump to section →
                    </span>
                  </div>
                  <h2 className={`font-display text-lg font-bold mb-1.5 transition-colors ${s.accent}`}>
                    {s.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
                    {s.blurb}
                  </p>
                </div>
              </a>
            );
          })}
        </nav>

        <CampusFriends />
        <CampusMind />
        <CampusLectures />
        <CampusPlaces />
        <CampusChecklist />
        <CampusFooter />
        <PageNotes pageSlug="campus-life" />
      </div>
    </div>
  );
}
