import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourse, specialPackages } from "@/data/special-packages";
import { getResource, resourceHubs } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import type { HubId } from "@/lib/content";
import { eceScope } from "@/lib/content";

export function generateStaticParams() {
  const params: { slug: string; semester: string; course: string; resource: string }[] = [];
  for (const pkg of specialPackages) {
    for (const sem of pkg.semesters) {
      for (const c of sem.courses) {
        for (const r of resourceHubs) {
          params.push({
            slug: pkg.slug,
            semester: sem.id,
            course: c.slug,
            resource: r.id,
          });
        }
      }
    }
  }
  return params;
}

export default async function SpecialCourseResourcePage({
  params,
}: {
  params: Promise<{ slug: string; semester: string; course: string; resource: string }>;
}) {
  const { slug, semester, course: courseSlug, resource: resourceId } = await params;
  const found = getCourse(slug, semester, courseSlug);
  const resource = getResource(resourceId);

  if (!found || !resource) notFound();
  const { pkg, sem, course } = found;
  const courseBase = `/academy/special-packages/${pkg.slug}/${sem.id}/${course.slug}`;
  const hub = resource.id as HubId;
  // Must match admin Content panel scope_path when uploading
  const scopePath = eceScope(sem.id, course.slug);
  const packageId = sem.packageId;
  const trackerScopeId = `special-${pkg.slug}-${sem.id}-${course.slug}-${resource.id}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={courseBase} />

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
            {course.code} · Learning hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={trackerScopeId}
            scopeLabel={`${course.code} · ${resource.name}`}
            accent={resource.accent}
            scopePath={scopePath}
            hub={hub}
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub={hub}
          packageId={packageId}
          accent={resource.accent}
          trackerScopeId={trackerScopeId}
        />

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`${courseBase}/${h.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                h.id === resource.id
                  ? `${h.accent} border-current bg-white/5`
                  : "border-white/10 text-wisdom-muted hover:border-white/20"
              }`}
            >
              {h.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
