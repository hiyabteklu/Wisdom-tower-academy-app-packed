import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  Lightbulb,
  Building2,
  Library,
  GraduationCap as GradCap,
  Trees,
  Shield,
  Compass,
} from "lucide-react";
import VoiceMessageCard from "@/components/VoiceMessageCard";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import PartnershipPath from "@/components/PartnershipPath";
import SafeCoverImage from "@/components/SafeCoverImage";
import { packageImages } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

/** Flip to true when real student voices and quotes are ready. */
const SHOW_STUDENT_VOICES = false;

type ProgramCard = {
  id: string;
  href: string;
  name: string;
  category: string;
  image: string;
  accent: string;
  border: string;
  description: string;
};

const programs: ProgramCard[] = [
  {
    id: "special",
    href: "/academy/special-packages/electrical-computer-engineering",
    name: "ELECTRICAL & COMPUTER ENGINEERING",
    category: "Department Track",
    image: "/images/special-packages/ece.jpg",
    accent: "text-violet-300",
    border: "hover:border-violet-400/40",
    description: "Senior Electrical and Computer Engineering, Semester 1 & Semester 2. Course material written for your department with chapter question banks, flashcards, and official solved exams.",
  },
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    category: "First-Year University",
    image: packageImages.freshman,
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    description: "Complete course hubs for Natural & Social streams with textbook notes, question banks, and exams.",
  },
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    category: "Secondary Education",
    image: packageImages["grade-9-12"],
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    description: "National secondary curriculum with chapter-by-chapter drills and matriculation practice.",
  },
  {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    category: "Occupational Assessment",
    image: packageImages.coc,
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
    description: "Center of Competence assessment question banks and applied practical revision guides.",
  },
  {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    category: "University Entrance",
    image: packageImages.uat,
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    description: "Undergraduate Admission Test preparation covering quantitative reasoning and verbal problem solving.",
  },
  {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    category: "Postgraduate Entrance",
    image: packageImages.gat,
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    description: "Graduate Admission Test practice sets, analytical reasoning drills, and timed simulations.",
  },
  {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    category: "Graduation Assessment",
    image: packageImages["exit-exam"],
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
    description: "National university exit examination materials to consolidate your field of study.",
  },
  {
    id: "remedial",
    href: "/academy/remedial",
    name: "Remedial Program",
    category: "Foundation Catch-Up",
    image: packageImages.remedial,
    accent: "text-amber-400",
    border: "hover:border-amber-400/40",
    description: "Core prerequisite subject strengthening for university transition and placement success.",
  },
];

const freeResources = [
  /* Games commented out per request
  {
    href: "/games/tower-climb",
    name: "Tower Climb",
    blurb: "Ascend course chapters floor by floor with your scholarly owl",
    icon: Compass,
    accent: "text-amber-300",
    border: "border-white/12 hover:border-amber-400/40",
    iconBg: "border-amber-400/30 bg-amber-500/15 text-amber-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(251,191,36,0.35)]",
  },
  {
    href: "/games/tower-defense",
    name: "Tower Defense",
    blurb: "Survive exam problem waves and defend your Knowledge Citadel",
    icon: Shield,
    accent: "text-emerald-300",
    border: "border-white/12 hover:border-emerald-400/40",
    iconBg: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(52,211,153,0.3)]",
  },
  */
  {
    href: "/academy/success-stories",
    name: "Success Stories",
    blurb: "How top students prepared and what they learned along the way",
    icon: Trophy,
    accent: "text-amber-300",
    border: "border-white/12 hover:border-amber-400/40",
    iconBg: "border-amber-400/30 bg-amber-500/15 text-amber-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(251,191,36,0.35)]",
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Practical ways to learn faster and remember more",
    icon: Lightbulb,
    accent: "text-cyan-300",
    border: "border-white/12 hover:border-cyan-400/40",
    iconBg: "border-cyan-400/30 bg-cyan-500/15 text-cyan-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(34,211,238,0.3)]",
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Friends, focus, lectures, and life between classes",
    icon: Trees,
    accent: "text-sky-300",
    border: "border-white/12 hover:border-sky-400/40",
    iconBg: "border-sky-400/30 bg-sky-500/15 text-sky-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(56,189,248,0.3)]",
  },
  {
    href: "/academy/universities",
    name: "Universities",
    blurb: "Schools, programs, and what each is known for",
    icon: Building2,
    accent: "text-violet-300",
    border: "border-white/12 hover:border-violet-400/40",
    iconBg: "border-violet-400/30 bg-violet-500/15 text-violet-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(167,139,250,0.3)]",
  },
  {
    href: "/academy/departments",
    name: "Departments",
    blurb: "Clear picture of each field before you choose",
    icon: Library,
    accent: "text-orange-300",
    border: "border-white/12 hover:border-orange-400/40",
    iconBg: "border-orange-400/30 bg-orange-500/15 text-orange-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(251,146,60,0.3)]",
  },
  {
    href: "/academy/scholarships",
    name: "Scholarships",
    blurb: "Funding options and how to apply with confidence",
    icon: GradCap,
    accent: "text-rose-300",
    border: "border-white/12 hover:border-rose-400/40",
    iconBg: "border-rose-400/30 bg-rose-500/15 text-rose-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(244,63,94,0.3)]",
  },
];

const voiceStudents = [
  { name: "Hiwot", program: "Grade 12", duration: "0:42", accent: "text-amber-400" },
  { name: "Yonas", program: "Freshman", duration: "0:38", accent: "text-sky-400" },
  { name: "Meron", program: "UAT", duration: "0:51", accent: "text-violet-400" },
  { name: "Abel", program: "COC", duration: "0:35", accent: "text-emerald-400" },
];

export default function AcademyPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12 animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Wisdom Tower Academy
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
            {programs.map((program) => (
              <article
                key={program.id}
                className="card-modern group flex flex-col h-full justify-between shadow-md shadow-black/25 overflow-hidden rounded-xl sm:rounded-2xl"
              >
                <Link href={program.href} className="card-media-wrap aspect-video block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={program.image}
                    alt={program.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </Link>
                <div className="p-2 sm:p-2.5 md:p-3.5 flex items-center justify-between gap-1.5 sm:gap-2 border-t border-white/8 flex-1">
                  <h2
                    className={`font-display text-xs sm:text-sm md:text-base font-bold tracking-tight text-white ${program.accent} line-clamp-2 min-w-0 flex-1`}
                  >
                    {program.name}
                  </h2>
                  <Link
                    href={program.href}
                    className="btn-open shrink-0"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <section className="mt-16 sm:mt-20 md:mt-24">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                Other resources
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
              {freeResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="card-modern group p-3 sm:p-5 flex flex-col justify-between h-full rounded-xl sm:rounded-2xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                        <div
                          className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm ${item.iconBg}`}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/[0.08] transition-colors">
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                      <h3
                        className={`font-display text-xs sm:text-base md:text-lg font-bold mb-1 transition-colors ${item.accent}`}
                      >
                        {item.name}
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-slate-400 leading-relaxed font-normal line-clamp-2">
                        {item.blurb}
                      </p>
                    </div>

                    <div className="mt-3 sm:mt-5 pt-2 sm:pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Guide
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-cyan-300 transition-colors">
                        Open
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {SHOW_STUDENT_VOICES && (
            <section className="mt-24 md:mt-28">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                  What students say about us
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {voiceStudents.map((s) => (
                  <VoiceMessageCard
                    key={s.name}
                    name={s.name}
                    program={s.program}
                    duration={s.duration}
                    accent={s.accent}
                  />
                ))}
              </div>
              <TestimonialMarquee />
            </section>
          )}

          <section className="mt-24 md:mt-28 hide-on-app" id="partnership">
            <div className="max-w-3xl mx-auto">
              <PartnershipPath />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
