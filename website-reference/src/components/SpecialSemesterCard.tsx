"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import AddToCartButton from "@/components/AddToCartButton";
import { formatEtb } from "@/data/packages";
import { IS_FREE_MODE } from "@/lib/ownership";
import type { SpecialPackage, SpecialSemester } from "@/data/special-packages";

export default function SpecialSemesterCard({
  pkg,
  sem,
}: {
  pkg: SpecialPackage;
  sem: SpecialSemester;
}) {
  return (
    <div className="card-modern flex flex-col h-full justify-between shadow-xl overflow-hidden rounded-xl sm:rounded-2xl">
      <Link
        href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
        className="group flex flex-col"
      >
        <div className="card-media-wrap aspect-video">
          <SafeCoverImage src={sem.image} alt={sem.label} />
        </div>
      </Link>

      <div className="p-2.5 sm:p-4 md:p-5 flex flex-col flex-1 border-t border-white/8 space-y-2 sm:space-y-3 justify-between">
        <div>
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-300">
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span>{sem.courses.length} courses</span>
            </div>
            {!IS_FREE_MODE && (
              <span className="font-display font-bold text-cyan-300 text-xs sm:text-sm md:text-base">
                {formatEtb(sem.priceEtb)}
              </span>
            )}
          </div>

          <h2 className="font-display text-sm sm:text-lg md:text-xl font-bold text-white line-clamp-1 sm:line-clamp-none">
            {sem.label}
          </h2>
        </div>

        {/* Single clear action to start learning */}
        <div className="pt-1">
          <Link
            href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
            className="btn-open w-full text-center py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />
            <span>Start Learning</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
          </Link>
        </div>

        {!IS_FREE_MODE && (
          <div className="mt-auto pt-2">
            <AddToCartButton packageId={sem.packageId} variant="ghost" hideIfAccessible />
          </div>
        )}
      </div>
    </div>
  );
}
