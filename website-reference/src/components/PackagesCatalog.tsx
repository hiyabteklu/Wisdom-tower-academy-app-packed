"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, BookOpen } from "lucide-react";
import { formatEtb, type AcademyPackage } from "@/data/packages";
import {
  listSellablePackages,
  getStaticSellablePackages,
  setRuntimeCatalog,
} from "@/lib/catalog";
import { isPackageOwned, IS_FREE_MODE } from "@/lib/ownership";
import { addToCart } from "@/lib/cart";
import { useCachedQuery } from "@/hooks/useCachedQuery";

function PackageCatalogCard({ pkg }: { pkg: AcademyPackage }) {
  return (
    <article className="card-modern group flex flex-col h-full justify-between shadow-lg shadow-black/25 overflow-hidden rounded-xl sm:rounded-2xl">
      <div className="card-media-wrap aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.image}
          alt={pkg.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-1 border-t border-white/8 space-y-2 sm:space-y-3 justify-between">
        <div>
          {/* Title */}
          <div className="flex items-baseline justify-between gap-1.5 sm:gap-3">
            <h2 className="font-display text-xs sm:text-base md:text-lg font-bold text-white leading-snug truncate flex-1">
              {pkg.name}
            </h2>
          </div>
        </div>

        {/* Single clear action to start learning (full label, not truncated) */}
        <div className="pt-1">
          <Link
            href={pkg.href || "/learning"}
            className="btn-open w-full text-center py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />
            <span>Start Learning</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function PackageGrid({ list }: { list: AcademyPackage[] }) {
  if (list.length === 0) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
      {list.map((pkg) => (
        <PackageCatalogCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}

export default function PackagesCatalog() {
  const staticPackages = useMemo(() => getStaticSellablePackages(), []);
  const { data: list } = useCachedQuery<AcademyPackage[]>(
    "catalog:sellable",
    listSellablePackages,
    {
      initialData: staticPackages,
      scope: "public",
    }
  );

  useEffect(() => {
    if (list) {
      setRuntimeCatalog(list);
    }
  }, [list]);

  if (!list || list.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6 py-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-wisdom-card/60 p-4 animate-pulse space-y-3"
          >
            <div className="aspect-video w-full rounded-xl bg-white/5" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-8 w-full rounded-lg bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  const grades = list.filter((p) => p.group === "grades");
  const branches = list.filter((p) => p.group === "branch");
  // Only the two semesters individually are enough; remove full year card
  const specials = list.filter(
    (p) =>
      p.group === "special" &&
      p.id !== "ece-y3" &&
      p.id !== "ece" &&
      !p.id.toLowerCase().includes("full-year") &&
      !p.id.toLowerCase().includes("full_year") &&
      !p.name.toLowerCase().includes("full year")
  );
  const other = list.filter(
    (p) =>
      !["grades", "branch", "special"].includes(p.group) &&
      !p.id.toLowerCase().includes("full-year") &&
      !p.name.toLowerCase().includes("full year")
  );

  return (
    <>
      {grades.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mb-4">Grades 9–12</h2>
          <PackageGrid list={grades} />
        </>
      )}

      {branches.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mt-14 mb-4">Other branches</h2>
          <PackageGrid list={branches} />
        </>
      )}

      {specials.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mt-14 mb-2">Special packages</h2>
          <PackageGrid list={specials} />
        </>
      )}

      {other.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mt-14 mb-4">More</h2>
          <PackageGrid list={other} />
        </>
      )}
    </>
  );
}
