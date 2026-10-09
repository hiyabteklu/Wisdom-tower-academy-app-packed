import { notFound } from "next/navigation";
import Link from "next/link";
import { getResource, resourceHubs } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import { BookOpen, Construction } from "lucide-react";

export function generateStaticParams() {
  return resourceHubs.map((r) => ({ resource: r.id }));
}

export default async function ExitExamResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: resourceId } = await params;
  const resource = getResource(resourceId);

  if (!resource) notFound();

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-fuchsia-500/20 via-pink-500/5 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy/exit-exam" />

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
            Exit Exam · Learning hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={`exit-exam-${resource.id}`}
            scopeLabel={`Exit Exam · ${resource.name}`}
            accent={resource.accent}
          />
        </div>

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden animate-fade-up">
          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/60 text-wisdom-muted">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Content coming soon</h2>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed mb-8">
              Exit Exam {resource.name.toLowerCase()} materials will appear here. Track scores
              above.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/academy/exit-exam"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium hover:border-fuchsia-400/40 hover:text-fuchsia-400 transition-colors"
              >
                All Exit Exam hubs
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-500 text-white text-sm font-semibold hover:bg-fuchsia-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Request materials
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`/academy/exit-exam/${h.id}`}
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
