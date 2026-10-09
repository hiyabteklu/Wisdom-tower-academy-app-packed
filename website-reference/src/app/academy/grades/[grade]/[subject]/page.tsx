import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getGrade, getResource, grades, resourceHubs } from "@/data/academy";
import { subjectsForGrade, getGradeSubject } from "@/data/grade-subjects";
import { packageIdForGrade } from "@/data/packages";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";

export function generateStaticParams() {
  const params: { grade: string; subject: string }[] = [];
  for (const g of grades) {
    for (const s of subjectsForGrade(g.id)) {
      params.push({ grade: g.id, subject: s.id });
    }
    for (const r of resourceHubs) {
      params.push({ grade: g.id, subject: r.id });
    }
  }
  return params;
}

export default async function GradeSubjectPage({
  params,
}: {
  params: Promise<{ grade: string; subject: string }>;
}) {
  const { grade: gradeId, subject: subjectId } = await params;
  const grade = getGrade(gradeId);
  if (!grade) notFound();

  // If user requested a resource hub (e.g. /academy/grades/9/books)
  const resource = getResource(subjectId);
  if (resource) {
    const subjects = subjectsForGrade(grade.id);
    return (
      <div className="relative min-h-[80vh]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br ${grade.gradient}`}
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
          <CategoryBackButton fallback={`/academy/grades/${grade.id}`} />

          <div className="mb-4 sm:mb-6 animate-fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-1">
              {grade.label} Curriculum
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
              <span className={resource.accent}>{resource.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-wisdom-muted max-w-lg">
              {resource.description}. Select a subject below to access official {resource.name.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/academy/grades/${grade.id}/${sub.id}/${resource.id}`}
                className="group flex items-center justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 bg-wisdom-card hover:border-sky-400/40 hover:bg-white/[0.04] transition-all shadow-md"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-1">
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
                    <GradeSubjectIcon name={sub.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm text-white group-hover:text-sky-300 transition-colors truncate">
                      {sub.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-wisdom-muted truncate">Open {resource.name}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const subject = getGradeSubject(gradeId, subjectId);
  if (!subject) notFound();

  const packageId = packageIdForGrade(grade.id);
  const scopePath = `grade/${grade.id}/${subject.id}`;
  const basePath = `/academy/grades/${grade.id}/${subject.id}`;

  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br ${grade.gradient}`}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <CategoryBackButton fallback={`/academy/grades/${grade.id}`} />

        <div className="mb-4 sm:mb-6 animate-fade-up">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-wisdom-muted mb-1">
            {grade.label} Curriculum · Subject
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {subject.name}
          </h1>
        </div>

        <div className="w-full mb-6">
          <AcademicResultSaver
            scopeId={`grade-${grade.id}-${subject.id}`}
            scopeLabel={`${grade.label} · ${subject.name}`}
            accent={grade.accent}
            scopePath={scopePath}
          />
        </div>

        <p className="text-xs font-bold tracking-[0.15em] uppercase text-wisdom-muted mb-3 text-left">
          Learning hubs
        </p>

        <ResourceHubGrid
          basePath={basePath}
          packageId={packageId}
          scopePath={scopePath}
        />
      </div>
    </div>
  );
}
