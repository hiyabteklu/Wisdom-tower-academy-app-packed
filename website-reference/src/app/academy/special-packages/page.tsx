import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import SpecialSemesterCard from "@/components/SpecialSemesterCard";
import { specialPackages } from "@/data/special-packages";

export const metadata = {
  title: "Electrical & Computer Engineering · Wisdom Tower Academy",
  description:
    "Senior Electrical and Computer Engineering track: Semester 1 & Semester 2 courses, notes, question banks, and exams",
};

export default function SpecialPackagesPage() {
  const pkg = specialPackages[0];

  return (
    <div className="relative min-h-[70vh] py-10 md:py-16">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryBackButton fallback="/learning" />

        <header className="mb-6 sm:mb-8 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-1.5">
            Department track · {pkg.yearLabel}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {pkg.name}
          </h1>
        </header>

        {/* Two semesters directly inside ECE, no intermediate replicate card */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-5 md:gap-6">
          {pkg.semesters.map((sem) => (
            <SpecialSemesterCard key={sem.id} pkg={pkg} sem={sem} />
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-3">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
          >
            Academy Pathways
          </Link>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
          >
            All Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
