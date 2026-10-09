import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { remedialSubjects, getRemedialSubject } from "@/data/remedial";
import { getResource, resourceHubs } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";

export function generateStaticParams() {
  const params: { subject: string }[] = [];
  for (const s of remedialSubjects) {
    params.push({ subject: s.id });
  }
  for (const r of resourceHubs) {
    params.push({ subject: r.id });
  }
  return params;
}

export default async function RemedialSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectId } = await params;

  // If user navigated to /academy/remedial/books, /academy/remedial/short-notes, etc.
  const resource = getResource(subjectId);
  if (resource) {
    return (
      <div className="relative min-h-[80vh]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <CategoryBackButton fallback="/academy/remedial" />

          <div className="max-w-2xl mx-auto mb-10 text-center animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Remedial Program
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              <span className={resource.accent}>{resource.name}</span>
            </h1>
            <p className="text-sm text-wisdom-muted max-w-lg mx-auto">
              {resource.description}. Choose any remedial subject below to open official {resource.name.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
            {remedialSubjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/academy/remedial/${sub.id}/${resource.id}`}
                className="group flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-white/10 bg-wisdom-card hover:border-amber-400/40 hover:bg-white/[0.04] transition-all shadow-md"
              >
                <div className="min-w-0 pr-2">
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base text-white group-hover:text-amber-300 transition-colors truncate">
                    {sub.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-wisdom-muted truncate">Remedial Curriculum</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const subject = getRemedialSubject(subjectId);
  if (!subject) notFound();

  const scopePath = `remedial/${subject.id}`;

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy/remedial" />

        <div className="max-w-2xl mx-auto mb-8 text-center animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300 mb-2">
            Remedial Program · Subject
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {subject.name}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <AcademicResultSaver
            scopeId={`remedial-${subject.id}`}
            scopeLabel={`Remedial · ${subject.name}`}
            accent="text-amber-400"
            scopePath={scopePath}
          />
        </div>

        <ResourceHubGrid
          basePath={`/academy/remedial/${subject.id}`}
          packageId="remedial"
          scopePath={scopePath}
        />
      </div>
    </div>
  );
}
