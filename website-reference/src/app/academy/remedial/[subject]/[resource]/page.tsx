import { notFound } from "next/navigation";
import {
  getResource,
  resourceHubs,
  HUB_ALIASES,
  type ResourceType,
} from "@/data/academy";
import { getRemedialSubject, remedialSubjects } from "@/data/remedial";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import ResourceHubChips from "@/components/ResourceHubChips";

export function generateStaticParams() {
  const params: { subject: string; resource: string }[] = [];
  for (const s of remedialSubjects) {
    for (const r of resourceHubs) {
      params.push({ subject: s.id, resource: r.id });
    }
  }
  return params;
}

export default async function RemedialSubjectResourcePage({
  params,
}: {
  params: Promise<{ subject: string; resource: string }>;
}) {
  const { subject: subjectId, resource: resourceId } = await params;
  const subject = getRemedialSubject(subjectId);
  const resource = getResource(resourceId);

  if (!subject || !resource) notFound();

  const hub = (HUB_ALIASES[resource.id] || resource.id) as ResourceType;
  const scopePath = `remedial/${subject.id}`;
  const trackerScopeId = `remedial-${subject.id}-${resource.id}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback={`/academy/remedial/${subject.id}`} />

        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300 mb-1">
            Remedial · {subject.name}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-sm text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={trackerScopeId}
            scopeLabel={`Remedial · ${subject.name} · ${resource.name}`}
            accent={resource.accent}
            scopePath={scopePath}
            hub={hub}
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub={hub}
          packageId="remedial"
          accent={resource.accent}
          trackerScopeId={trackerScopeId}
        />

        <ResourceHubChips
          basePath={`/academy/remedial/${subject.id}`}
          activeId={resource.id}
        />
      </div>
    </div>
  );
}
