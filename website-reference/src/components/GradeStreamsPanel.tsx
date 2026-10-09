"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { subjectsForGrade } from "@/data/grade-subjects";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";

export default function GradeStreamsPanel({ gradeId }: { gradeId: string }) {
  const subjects = subjectsForGrade(gradeId);

  return (
    <div className="perspective-scene grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 stagger-children">
      {subjects.map((sub) => (
        <Link
          key={sub.id}
          href={`/academy/grades/${gradeId}/${sub.id}`}
          prefetch={true}
          className="card-modern group flex flex-col shadow-md shadow-black/20 hover:border-sky-400/35 transition-all overflow-hidden"
        >
          {/* Big native icon container representing the subject */}
          <div className="relative aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-wisdom-navy to-slate-900 border-b border-white/8 group-hover:from-slate-900 group-hover:to-sky-950/50 transition-colors">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 text-sky-300 group-hover:scale-110 group-hover:border-sky-400/50 group-hover:bg-sky-500/20 group-hover:text-sky-200 transition-all duration-300 shadow-inner">
              <GradeSubjectIcon name={sub.icon} className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
            </div>
          </div>

          {/* Title + Open button side-by-side, no junk texts */}
          <div className="p-2 sm:p-2.5 md:p-3.5 flex items-center justify-between gap-1.5 sm:gap-2 flex-1">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-sky-200 transition-colors truncate min-w-0 flex-1">
              {sub.name}
            </h3>

            <span className="btn-open shrink-0">
              <span>Open</span>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
