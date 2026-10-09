import { notFound, redirect } from "next/navigation";
import {
  freshmanSubjects,
  getFreshmanSubject,
  FRESHMAN_SUBJECT_ALIASES,
} from "@/data/freshman";
import { getResource, resourceHubs } from "@/data/academy";
import FreshmanLockedPanel from "@/components/FreshmanLockedPanel";
import { FRESHMAN_LOCKED_UNTIL_OPENING } from "@/lib/ownership";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import type { HubId } from "@/lib/content";
import ResourceHubChips from "@/components/ResourceHubChips";

export function generateStaticParams() {
  const params: { subject: string; resource: string }[] = [];
  for (const s of freshmanSubjects) {
    for (const r of resourceHubs) {
      params.push({ subject: s.id, resource: r.id });
    }
  }
  return params;
}

export default async function FreshmanResourcePage({
  params,
}: {
  params: Promise<{ subject: string; resource: string }>;
}) {
  const { subject: subjectId, resource: resourceId } = await params;

  if (FRESHMAN_SUBJECT_ALIASES[subjectId]) {
    redirect(`/academy/freshman/${FRESHMAN_SUBJECT_ALIASES[subjectId]}/${resourceId}`);
  }

  const subject = getFreshmanSubject(subjectId);
  const resource = getResource(resourceId);
  if (!subject || !resource) notFound();

  const hub = resource.id as HubId;
  const scopePath = `freshman/${subject.id}`;
  const trackerScopeId = `freshman-${subject.id}`;

  if (FRESHMAN_LOCKED_UNTIL_OPENING) {
    return (
      <div className="relative min-h-[60vh]">
        <div className="relative max-w-3xl mx-auto px-4 py-12">
          <CategoryBackButton fallback={`/academy/freshman/${subject.id}`} />
          <FreshmanLockedPanel showBack={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[60vh]">
      <div className="relative max-w-3xl mx-auto px-4 py-12">
        <CategoryBackButton fallback={`/academy/freshman/${subject.id}`} />

        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-wisdom-muted mb-1">
            Freshman · {subject.name}
          </p>
          <h1 className={`font-display text-2xl sm:text-3xl font-extrabold ${resource.accent}`}>
            {resource.name}
          </h1>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={trackerScopeId}
            scopeLabel={`Freshman · ${subject.name} · ${resource.name}`}
            accent={resource.accent}
            scopePath={scopePath}
            hub={hub}
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub={hub}
          packageId="freshman"
          accent={resource.accent}
          trackerScopeId={trackerScopeId}
        />

        <ResourceHubChips
          basePath={`/academy/freshman/${subject.id}`}
          activeId={resource.id}
        />
      </div>
    </div>
  );
}
