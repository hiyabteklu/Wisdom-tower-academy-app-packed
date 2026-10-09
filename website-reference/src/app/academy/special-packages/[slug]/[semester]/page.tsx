import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import AddToCartButton from "@/components/AddToCartButton";
import CategoryBackButton from "@/components/CategoryBackButton";
import { getSemester, getSpecialPackage, specialPackages } from "@/data/special-packages";
import { getResource, resourceHubs } from "@/data/academy";

export function generateStaticParams() {
  const params: { slug: string; semester: string }[] = [];
  for (const pkg of specialPackages) {
    for (const sem of pkg.semesters) {
      params.push({ slug: pkg.slug, semester: sem.id });
    }
    for (const r of resourceHubs) {
      params.push({ slug: pkg.slug, semester: r.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; semester: string }>;
}) {
  const { slug, semester } = await params;
  const resource = getResource(semester);
  if (resource) {
    const pkg = getSpecialPackage(slug);
    return {
      title: `${resource.name} · ${pkg?.name || "Special Packages"}`,
    };
  }
  const found = getSemester(slug, semester);
  if (!found) return { title: "Semester" };
  return {
    title: `${found.sem.label} · ${found.pkg.name}`,
  };
}

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ slug: string; semester: string }>;
}) {
  const { slug, semester } = await params;

  // If user requested a learning hub directly, e.g. /academy/special-packages/electrical-computer-engineering/books
  const resource = getResource(semester);
  if (resource) {
    const hubPkg = getSpecialPackage(slug);
    if (hubPkg) {
      return (
        <div className="relative min-h-[80vh]">
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <CategoryBackButton fallback={`/academy/special-packages/${hubPkg.slug}`} />

            <div className="max-w-2xl mx-auto mb-10 text-center animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">
                {hubPkg.name} · {hubPkg.yearLabel}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                <span className={resource.accent}>{resource.name}</span>
              </h1>
              <p className="text-sm text-wisdom-muted max-w-lg mx-auto">
                {resource.description}. Choose an engineering course below to open official {resource.name.toLowerCase()}.
              </p>
            </div>

            <div className="space-y-8">
              {hubPkg.semesters.map((s) => (
                <div key={s.id}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-violet-300 mb-3 px-1">
                    {s.label}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
                    {s.courses.map((c) => (
                      <Link
                        key={c.code}
                        href={`/academy/special-packages/${hubPkg.slug}/${s.id}/${c.slug}/${resource.id}`}
                        className="group flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-white/10 bg-wisdom-card hover:border-violet-400/40 hover:bg-white/[0.04] transition-all shadow-md"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] sm:text-[11px] font-mono text-violet-300/80 mb-0.5 block">{c.code}</span>
                          <h3 className="font-semibold text-xs sm:text-sm text-white group-hover:text-violet-300 transition-colors truncate">
                            {c.title}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-wisdom-muted truncate">{s.label}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  const found = getSemester(slug, semester);
  if (!found) notFound();
  const { pkg, sem } = found;

  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryBackButton fallback={`/academy/special-packages/${pkg.slug}`} />

        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">
          {pkg.name} · {pkg.yearLabel}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-6">
          {sem.label}
        </h1>

        <div className="mb-8 max-w-md">
          <AddToCartButton packageId={sem.packageId} hideIfAccessible />
        </div>

        {sem.courses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 p-8 text-center text-wisdom-muted">
            Courses for this semester will appear here when published.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
            {sem.courses.map((c) => (
              <Link
                key={c.code}
                href={`/academy/special-packages/${pkg.slug}/${sem.id}/${c.slug}`}
                className="card-modern group flex flex-col h-full justify-between shadow-md overflow-hidden rounded-xl sm:rounded-2xl"
              >
                <div className="card-media-wrap aspect-video">
                  <SafeCoverImage src={c.image} alt="" />
                </div>
                <div className="p-2 sm:p-2.5 md:p-4 border-t border-white/8 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-mono text-violet-300/80 mb-0.5 block">{c.code}</span>
                    <h2 className="font-display text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-violet-200 leading-snug line-clamp-2">
                      {c.title}
                    </h2>
                  </div>
                  <div className="mt-2 pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="btn-open">
                      <span>Open</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-3">
          <Link
            href={`/academy/special-packages/${pkg.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
          >
            All {pkg.name} Semesters
          </Link>
        </div>
      </div>
    </div>
  );
}
