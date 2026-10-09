import { freshmanSubjects } from "@/data/freshman";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectCard from "@/components/SubjectCard";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import CollapsibleGpa from "@/components/CollapsibleGpa";
import FreshmanPackageGate from "@/components/FreshmanPackageGate";
import { GraduationCap } from "lucide-react";

export default function FreshmanPage() {
  return (
    <FreshmanPackageGate>
      <div className="relative min-h-[80vh]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-purple-500/25 via-pink-500/10 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
          <CategoryBackButton fallback="/learning" />

          <div className="mb-6 sm:mb-8 animate-fade-up">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </span>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Freshman courses
                </h1>
                <p className="text-xs sm:text-sm text-wisdom-muted font-medium mt-0.5">
                  including preengineering &amp; others
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
            <BranchLeaderboard branchName="Freshman" accent="text-purple-400" />
          </div>

          <div className="max-w-4xl mx-auto mb-8 sm:mb-10">
            <CollapsibleGpa />
          </div>

          <div className="mb-4">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted">
              Subjects
            </p>
          </div>

          <div className="perspective-scene grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 stagger-children">
            {freshmanSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                href={`/academy/freshman/${subject.id}`}
                name={subject.name}
                description={subject.description}
                image={subject.image}
              />
            ))}
          </div>
        </div>
      </div>
    </FreshmanPackageGate>
  );
}
