import Link from "next/link";
import { grades } from "@/data/academy";
import { ArrowRight } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import { getPackage, packageIdForGrade } from "@/data/packages";

export default function GradesPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-14">
        <CategoryBackButton fallback="/learning" />

        <div className="mb-6 sm:mb-8 animate-fade-up text-left">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-sky-400/90 mb-1.5">
            Secondary Curriculum
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Grade <span className="text-sky-400">9–12</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6">
          {grades.map((grade) => (
            <article
              key={grade.id}
              className="card-modern group flex flex-col h-full justify-between shadow-md shadow-black/25 overflow-hidden rounded-xl sm:rounded-2xl"
            >
              <Link href={`/academy/grades/${grade.id}`} className="card-media-wrap aspect-video block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={grade.image}
                  alt={grade.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </Link>
              <div className="p-2 sm:p-2.5 md:p-3.5 flex items-center justify-between gap-1.5 sm:gap-2 border-t border-white/8 flex-1">
                <h2
                  className={`font-display text-xs sm:text-sm md:text-base font-bold ${grade.accent} truncate min-w-0 flex-1`}
                >
                  {grade.label}
                </h2>
                <Link
                  href={`/academy/grades/${grade.id}`}
                  className="btn-open shrink-0"
                >
                  <span>Open</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
