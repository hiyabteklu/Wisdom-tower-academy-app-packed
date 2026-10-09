"use client";

import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  Lightbulb,
  Building2,
  Library,
  GraduationCap as GradCap,
  Trees,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import PartnershipPath from "@/components/PartnershipPath";
import { packageImages, getPackage, CORE_PACKAGE_INCLUDES } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

const OPEN_BTN = "btn-open";

type ProgramCard = {
  id: string;
  href: string;
  name: string;
  category: string;
  image: string;
  accent: string;
  border: string;
  description: string;
  includes: string[];
};

const freshmanPkg = getPackage("freshman");
const g912Pkg = getPackage("grade-9-12");
const uatPkg = getPackage("uat");
const gatPkg = getPackage("gat");
const cocPkg = getPackage("coc");
const exitPkg = getPackage("exit-exam");
const remedialPkg = getPackage("remedial");

const allPrograms: ProgramCard[] = [
  {
    id: "special",
    href: "/academy/special-packages/electrical-computer-engineering",
    name: "ECE Engineering",
    category: "Department Track",
    image: "/images/special-packages/ece.jpg",
    accent: "text-violet-300",
    border: "hover:border-violet-400/40",
    description:
      "Senior Electrical and Computer Engineering, Semester 1 & Semester 2. Course material written for your department, not generic engineering notes. Each course carries its own question bank, flashcards, and practice exams with solutions.",
    includes: [
      "All 7 Year 3 Semester 1 engineering courses",
      "All 7 Year 3 Semester 2 engineering courses",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    category: "First-Year University",
    image: packageImages.freshman,
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    description:
      freshmanPkg?.description ||
      "Every first-year course in one place, natural and social streams included. Notes, chapter questions, flashcards, and solved practice exams for 20+ courses, plus tools that keep you on track.",
    includes: freshmanPkg?.includes || [
      "All 20+ freshman courses (natural and social streams)",
      "Ethiopian university GPA calculator & field leaderboard",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    category: "Secondary Curriculum",
    image: packageImages["grade-9-12"],
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    description:
      g912Pkg?.description ||
      "Complete Grade 9 to 12 secondary curriculum. Master textbook chapters, drill with targeted questions, practice with timed exams, and prepare thoroughly for national matriculation.",
    includes: g912Pkg?.includes || [
      "Complete Grade 9, 10, 11, and 12 Ethiopian national curriculum",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    category: "Competency Certification",
    image: packageImages.coc,
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
    description:
      cocPkg?.description ||
      "Certificate of Competency prep with clear notes, chapter practice, flashcards, and solved exams. Material aimed at the skills and judgment the assessment rewards.",
    includes: cocPkg?.includes || [
      "Occupational standard competencies & evaluation prep",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    category: "Undergraduate Entrance",
    image: packageImages.uat,
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    description:
      uatPkg?.description ||
      "University Admission Test prep that respects how the exam is actually written. Focused notes, chapter question banks, flashcards for rapid recall, and practice exams with solutions.",
    includes: uatPkg?.includes || [
      "Comprehensive UAT quantitative & verbal entrance tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    category: "Graduate Admission",
    image: packageImages.gat,
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    description:
      gatPkg?.description ||
      "Graduate Admission Test resources organized the way the exam expects you to think. Notes on core GAT material, chapter questions, flashcards, and practice exams with solutions.",
    includes: gatPkg?.includes || [
      "Postgraduate GAT analytical & quantitative problem tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    category: "University Exit Certification",
    image: packageImages["exit-exam"],
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
    description:
      exitPkg?.description ||
      "University exit exam review by department, with structured notes and practice when materials open. Designed for final-year students who need focused revision, not generic summaries.",
    includes: exitPkg?.includes || [
      "Department graduation exit exam comprehensive tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "remedial",
    href: "/academy/remedial",
    name: "Remedial",
    category: "Higher Ed Catch-Up",
    image: packageImages.remedial,
    accent: "text-amber-400",
    border: "hover:border-amber-400/40",
    description:
      remedialPkg?.description ||
      "Catch-up pathway for core subjects. Strengthen foundations in English, Maths, Physics, Chemistry, Biology, History and Geography with the same learning hubs used across the Academy: notes, flashcards, question banks and practice exams.",
    includes: remedialPkg?.includes || [
      "All seven core remedial prerequisite subjects",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
];

const freeResources = [
  {
    href: "/academy/success-stories",
    name: "Success Stories",
    blurb: "Real preparation strategies, score milestones, and study habits from top-ranking students.",
    icon: Trophy,
    accent: "text-amber-300",
    border: "border-white/10 hover:border-amber-400/40",
    iconBg: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Active recall, spaced repetition, and focus management frameworks proven for exam mastery.",
    icon: Lightbulb,
    accent: "text-cyan-300",
    border: "border-white/10 hover:border-cyan-400/40",
    iconBg: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Living guides, campus navigation, study balance, and dorm survival tips for university students.",
    icon: Trees,
    accent: "text-sky-300",
    border: "border-white/10 hover:border-sky-400/40",
    iconBg: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  },
  {
    href: "/academy/universities",
    name: "Universities Directory",
    blurb: "In-depth profiles, campus climate, department strengths, and admission data across Ethiopia.",
    icon: Building2,
    accent: "text-violet-300",
    border: "border-white/10 hover:border-violet-400/40",
    iconBg: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  },
  {
    href: "/academy/departments",
    name: "Departments Guide",
    blurb: "Understand curriculum requirements, career prospects, and daily realities of each major before choosing.",
    icon: Library,
    accent: "text-orange-300",
    border: "border-white/10 hover:border-orange-400/40",
    iconBg: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  },
  {
    href: "/academy/scholarships",
    name: "Scholarships Guide",
    blurb: "Verified domestic and international funding opportunities with deadline tracking and guidance.",
    icon: GradCap,
    accent: "text-rose-300",
    border: "border-white/10 hover:border-rose-400/40",
    iconBg: "border-rose-400/30 bg-rose-500/10 text-rose-300",
  },
];

function PathwayCard({ program }: { program: ProgramCard }) {
  return (
    <article
      className="card-modern group flex flex-col h-full justify-between shadow-md shadow-black/25 overflow-hidden rounded-xl sm:rounded-2xl"
    >
      <Link href={program.href} className="card-media-wrap aspect-[16/10] sm:aspect-video block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={program.image}
          alt={program.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </Link>

      {/* One content row: title on left, Open button on right */}
      <div className="p-2 sm:p-2.5 md:p-3 flex items-center justify-between gap-1.5 sm:gap-2 border-t border-white/8 flex-1">
        <h3 className="font-display text-xs sm:text-sm md:text-base font-bold tracking-tight text-white truncate min-w-0 flex-1">
          {program.name}
        </h3>

        <Link
          href={program.href}
          className="btn-open shrink-0"
        >
          <span>Open</span>
          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </Link>
      </div>
    </article>
  );
}

export default function LandingPathways() {
  const pathwaysSection = useInView();

  return (
    <>
      <section
        className="pb-16 md:pb-24 relative"
        ref={pathwaysSection.ref}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          {/* All Academic Pathways Grid: tight 2 columns on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 mb-10 sm:mb-16">
            {allPrograms.map((program) => (
              <PathwayCard key={program.id} program={program} />
            ))}
          </div>

          {/* Academic Other Resources Section: icon + title only, 2 columns on mobile */}
          <section className="mb-12">
            <div className="text-center mb-5 sm:mb-8">
              <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-bold text-white">
                Other resources
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3.5">
              {freeResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="card-modern group p-2 sm:p-3 md:p-3.5 flex items-center justify-between gap-2 h-full rounded-xl sm:rounded-2xl"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm ${item.iconBg}`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <h4
                        className={`font-display text-xs sm:text-sm md:text-base font-bold transition-colors truncate text-white ${item.accent}`}
                      >
                        {item.name}
                      </h4>
                    </div>

                    <span className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/[0.08] transition-colors">
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-20 md:mt-24 hide-on-app" id="partnership">
            <div className="max-w-3xl mx-auto">
              <PartnershipPath />
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
