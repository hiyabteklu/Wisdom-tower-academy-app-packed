import { notFound } from "next/navigation";
import {
  getResource,
  resourceHubs,
  HUB_ALIASES,
  type ResourceType,
} from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import ResourceHubChips from "@/components/ResourceHubChips";

export function generateStaticParams() {
  return resourceHubs.map((r) => ({ resource: r.id }));
}

export default async function UatResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: resourceId } = await params;
  const resource = getResource(resourceId);

  if (!resource) notFound();

  const hub = (HUB_ALIASES[resource.id] || resource.id) as ResourceType;
  const scopePath = "uat";
  const trackerScopeId = `uat-${resource.id}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-emerald-500/20 via-teal-500/5 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy/uat" />

        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-1">
            UAT · Learning hub
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-sm text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={trackerScopeId}
            scopeLabel={`UAT · ${resource.name}`}
            accent={resource.accent}
            scopePath={scopePath}
            hub={hub}
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub={hub}
          packageId="uat"
          accent={resource.accent}
          trackerScopeId={trackerScopeId}
        />

        <ResourceHubChips basePath="/academy/uat" activeId={resource.id} />
      </div>
    </div>
  );
}
