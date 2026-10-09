import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryBackButton from "@/components/CategoryBackButton";
import SpecialSemesterCard from "@/components/SpecialSemesterCard";
import { getSpecialPackage, specialPackages } from "@/data/special-packages";

export function generateStaticParams() {
  return specialPackages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = getSpecialPackage(slug);
  return {
    title: pkg ? `${pkg.name} · Special Packages` : "Special Package",
  };
}

export default async function SpecialPackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = getSpecialPackage(slug);
  if (!pkg) notFound();

  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryBackButton fallback="/learning" />

        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">
          Department track · {pkg.yearLabel}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-6">
          {pkg.name}
        </h1>

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
