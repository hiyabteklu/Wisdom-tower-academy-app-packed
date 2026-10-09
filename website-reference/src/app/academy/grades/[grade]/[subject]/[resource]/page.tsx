import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrade, getResource, grades, resourceHubs } from "@/data/academy";
import { subjectsForGrade, getGradeSubject } from "@/data/grade-subjects";
import { packageIdForGrade } from "@/data/packages";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import type { HubId } from "@/lib/content";

export function generateStaticParams() {
  const params: { grade: string; subject: string; resource: string }[] = [];
  for (const g of grades) {
    for (const s of subjectsForGrade(g.id)) {
      for (const r of resourceHubs) {
        params.push({ grade: g.id, subject: s.id, resource: r.id });
      }
    }
  }
  return params;
}

export default async function GradeSubjectResourcePage({
  params,
}: {
  params: Promise<{ grade: string; subject: string; resource: string }>;
}) {
  const { grade: gradeId, subject: subjectId, resource: resourceId } = await params;
  const grade = getGrade(gradeId);
  const subject = getGradeSubject(gradeId, subjectId);
  const resource = getResource(resourceId);

  if (!grade || !subject || !resource) notFound();

  const hub = resource.id as HubId;
  const packageId = packageIdForGrade(grade.id);
  const scopePath = `grade/${grade.id}/${subject.id}`;
  const trackerScopeId = `grade-${grade.id}-${subject.id}-${resource.id}`;
  const subjectHref = `/academy/grades/${grade.id}/${subject.id}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${grade.gradient}`}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <CategoryBackButton fallback={subjectHref} />

        <div className="mb-4 sm:mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-1">
            {grade.label} · {subject.name} · Learning hub
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-6">
          <AcademicResultSaver
            scopeId={trackerScopeId}
            scopeLabel={`${grade.label} · ${subject.name} · ${resource.name}`}
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

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`/academy/grades/${grade.id}/${subject.id}/${h.id}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                h.id === resource.id
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-white/10 text-wisdom-muted hover:border-white/20 hover:text-white"
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
