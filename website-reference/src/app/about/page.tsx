import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Cpu,
  Layers,
  Globe2,
  Compass,
  CheckCircle2,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  Users,
  Building2,
  Code2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us · Wisdom Tower Academy",
  description:
    "Discover the vision, engineering, and pedagogical philosophy powering Wisdom Tower Academy, elevating Ethiopian e-learning into a world-class, 21st-century academic sphere.",
};

const PILLARS = [
  {
    icon: Cpu,
    title: "21st-Century Learning Architecture",
    description:
      "Learning today requires active cognition, not passive consumption. We fuse adaptive question banks, interactive flashcard recall, and on-demand AI conceptual tutoring into a single frictionless workspace.",
    badge: "Advanced EdTech",
  },
  {
    icon: Layers,
    title: "100% Aligned to the New Curriculum",
    description:
      "Built from the ground up to reflect Ethiopia’s reformed competence-based modular framework. Every chapter note, practice test, and syllabus track matches the exact standards taught across the nation.",
    badge: "Official Alignment",
  },
  {
    icon: Globe2,
    title: "Nationwide Low-Bandwidth Resilience",
    description:
      "Education must reach every student, regardless of connectivity. Our platform uses edge-caching and offline-first storage so materials remain instantly readable across all regions of Ethiopia.",
    badge: "Offline-First",
  },
  {
    icon: Compass,
    title: "Beyond Academics: The Whole Scholar",
    description:
      "We bridge students from exam halls to real-world impact. Explore verified scholarship databases, university campus guides, career competency prep, and lifelong intellectual networks.",
    badge: "Holistic Trajectory",
  },
];

const CONTINUUM = [
  {
    level: "Grades 9 – 12",
    title: "Secondary Foundation & National Matriculation",
    desc: "Comprehensive natural and social science curriculum tracks, chapter question banks, model exams, and matriculation preparation.",
    accent: "text-sky-400",
    border: "border-sky-400/20",
    bg: "from-sky-500/10 to-transparent",
  },
  {
    level: "Remedial & UAT",
    title: "Higher Education Transition & Entrance",
    desc: "Rigorous prerequisite remediation and University Admission Test (UAT) drills designed to secure university placement.",
    accent: "text-amber-400",
    border: "border-amber-400/20",
    bg: "from-amber-500/10 to-transparent",
  },
  {
    level: "Freshman Core",
    title: "First-Year University Excellence",
    desc: "All 20+ common freshman courses with official midterm and final exams worked, Ethiopian GPA tracking, and field leaderboards.",
    accent: "text-purple-400",
    border: "border-purple-400/20",
    bg: "from-purple-500/10 to-transparent",
  },
  {
    level: "Senior Tracks & Exit Exam",
    title: "Department Specialization & Graduation",
    desc: "Advanced engineering tracks (ECE), professional competency assessments (COC), and National University Exit Exam question banks.",
    accent: "text-emerald-400",
    border: "border-emerald-400/20",
    bg: "from-emerald-500/10 to-transparent",
  },
];

const METRICS = [
  { value: "30K+", label: "Ambitious Scholars", sub: "Active across secondary and universities" },
  { value: "20+", label: "Freshman Courses", sub: "Complete notes, banks, and worked exams" },
  { value: "100%", label: "Curriculum Aligned", sub: "Tailored to Ethiopia's new modular system" },
  { value: "0ms", label: "Offline Cache Delay", sub: "Read downloaded notes with zero data usage" },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-[90vh] py-14 sm:py-20 md:py-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[50rem] h-[28rem] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[40rem] left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[70rem] right-10 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-amber-400/10 text-amber-300 border border-amber-400/25 mb-6 shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            The Next Era of Ethiopian EdTech
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Elevating Ethiopian Education into a{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              World-Class Sphere.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            Wisdom Tower Academy is engineered from first principles around how Ethiopia’s new curriculum works
            and how modern 21st-century minds learn. We bring all of high school, university entrance, freshman year,
            and department graduation into one unified, distraction-free ecosystem.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/academy"
              className="btn-primary text-sm sm:text-base px-7 py-3.5 shadow-lg shadow-amber-500/20"
            >
              Explore Academic Pathways
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/packages"
              className="btn-secondary text-sm sm:text-base px-6 py-3.5 border-white/20 hover:border-amber-400/50"
            >
              View Available Packages
            </Link>
          </div>
        </header>

        {/* Metrics Banner */}
        <section className="mb-24 md:mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="card-modern p-5 sm:p-6 text-center border-white/10 bg-wisdom-card/60 backdrop-blur-sm"
              >
                <p className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight text-gradient">
                  {m.value}
                </p>
                <p className="text-sm sm:text-base font-bold text-amber-300 mt-1">{m.label}</p>
                <p className="text-xs text-wisdom-muted mt-1 leading-snug">{m.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Genesis & Vision: Why We Built This */}
        <section className="mb-24 md:mb-32">
          <div className="card-modern p-6 sm:p-10 md:p-12 border-amber-400/20 bg-gradient-to-br from-wisdom-card via-wisdom-navy/95 to-wisdom-dark shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-3 block">
                The Paradigm Shift
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6">
                Ending the Era of Scattered PDFs, Chaotic Groups, and Guesswork.
              </h2>

              <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                <p>
                  For years, Ethiopian students have fought an uphill battle: hunting through dozens of random Telegram
                  channels, deciphering low-resolution photocopies of outdated materials, and struggling to find worked
                  solutions that actually explain the underlying science. When the Ethiopian Ministry of Education
                  introduced the comprehensive new curriculum framework, this challenge multiplied.
                </p>
                <p>
                  We refused to accept that standard. We asked: <em>What if an Ethiopian student had access to a learning
                  environment as refined, fluid, and powerful as the world&apos;s leading institutions?</em>
                </p>
                <p>
                  Wisdom Tower Academy is our answer. A unified platform where textbooks, chapter-by-chapter summaries,
                  question banks, flashcard decks, and official university midterm and final exams live together with
                  clean typography, instant search, and zero distractions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 21st Century Learning Architecture Pillars */}
        <section className="mb-24 md:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2 block">
              Core Engineering Philosophy
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pillars of the 21st-Century Scholar
            </h2>
            <p className="mt-3 text-sm sm:text-base text-wisdom-muted leading-relaxed">
              Every pixel, algorithm, and curriculum module is designed to give you an unfair intellectual advantage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="card-modern p-6 sm:p-8 flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2.5">
                      {p.title}
                    </h3>
                    <p className="text-sm text-slate-300/90 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* The Unified Academic Continuum */}
        <section className="mb-24 md:mb-32">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-2 block">
              One Unified Journey
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              High School to Graduation & Beyond
            </h2>
            <p className="mt-3 text-sm sm:text-base text-wisdom-muted leading-relaxed">
              Never start from scratch again. Your notes, your test history, and your study momentum stay with you
              across every pivotal transition of your academic career.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {CONTINUUM.map((item, idx) => (
              <div
                key={item.level}
                className={`card-modern p-5 sm:p-6 flex flex-col justify-between border ${item.border} bg-gradient-to-b ${item.bg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-mono font-bold ${item.accent}`}>
                      0{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-wisdom-muted">
                      {item.level}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beyond Academics Section */}
        <section className="mb-24 md:mb-32">
          <div className="rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-950/20 via-wisdom-card to-wisdom-dark p-6 sm:p-10 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 block">
                  The Broader Horizon
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Bridging Ethiopian Students Beyond the Classroom.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  True leadership requires more than acing a test. We equip students with strategic tools to navigate
                  higher education and professional careers:
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 pt-2">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Verified Scholarship Portals:</strong> Curated listings of fully funded international and domestic scholarship opportunities.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Campus Life & University Field Guides:</strong> Deep-dive overviews into Ethiopian public and private universities to help students choose the right environment.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Career Competencies & COC Readiness:</strong> Practical guidance and occupational assessments that bridge technical skills to market demand.</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                  <Award className="w-8 h-8 text-amber-300 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Ethiopian GPA Scale Engine</h3>
                    <p className="text-xs text-wisdom-muted">Calculate, project, and optimize your semester GPA</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-cyan-300 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Field Leaderboards</h3>
                    <p className="text-xs text-wisdom-muted">Measure your progress with peers in your discipline</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-purple-300 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Explain with AI</h3>
                    <p className="text-xs text-wisdom-muted">Formative conceptual breakdowns on tricky exam problems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Integrity & Independence */}
        <section className="mb-24 md:mb-32">
          <div className="card-modern p-6 sm:p-8 md:p-10 border-white/10 text-center max-w-3xl mx-auto">
            <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
              Part of the Wisdom Tower Ecosystem
            </h2>
            <p className="text-sm text-slate-300/90 leading-relaxed mb-6">
              Wisdom Tower Academy is the dedicated educational wing of Wisdom Tower. Our digital agency services,
              custom software development, and enterprise technologies operate under Wisdom Digital. Here at the Academy,
              every line of code and every faculty hour is 100% focused on student success, academic excellence, and
              the intellectual future of Ethiopia.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-wisdom-muted">
              <span>Addis Ababa, Ethiopia</span>
              <span>•</span>
              <span>Serving Scholars Nationwide</span>
            </div>
          </div>
        </section>

        {/* Final High-Energy CTA */}
        <section className="text-center py-8">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            You Belong at the Top of Your Field.
          </h2>
          <p className="text-base sm:text-lg text-wisdom-muted max-w-xl mx-auto mb-8 leading-relaxed">
            Stop studying with scattered fragments. Enter a structured, premium ecosystem built to make you thrive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-primary text-sm sm:text-base px-8 py-4 shadow-xl shadow-amber-500/20"
            >
              Create Free Account & Start Learning
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/academy"
              className="btn-secondary text-sm sm:text-base px-6 py-4"
            >
              Browse All Academy Hubs
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
