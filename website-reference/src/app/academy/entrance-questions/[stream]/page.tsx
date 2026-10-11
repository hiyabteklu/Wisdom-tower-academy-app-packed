import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";
import {
  ENTRANCE_BASE_PATH,
  ENTRANCE_STREAMS,
  getEntranceStream,
} from "@/data/entrance-questions";

export function generateStaticParams() {
  return ENTRANCE_STREAMS.map((s) => ({ stream: s.id }));
}

export default async function EntranceStreamPage({
  params,
}: {
  params: Promise<{ stream: string }>;
}) {
  const { stream: streamId } = await params;
  const stream = getEntranceStream(streamId);
  if (!stream) notFound();

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <CategoryBackButton fallback={ENTRANCE_BASE_PATH} />

        <div className="mb-5 sm:mb-6 animate-fade-up">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-wisdom-muted mb-0.5">
            Entrance Questions
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className={stream.accent}>{stream.label}</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {stream.subjects.map((sub) => (
            <Link
              key={sub.id}
              href={`${ENTRANCE_BASE_PATH}/${stream.id}/${sub.id}`}
              prefetch={true}
              className="card-modern group flex flex-col shadow-md shadow-black/20 hover:border-teal-400/35 transition-all overflow-hidden"
            >
              <div className="relative aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-wisdom-navy to-slate-900 border-b border-white/8 group-hover:to-teal-950/50 transition-colors">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-500/10 text-teal-300 group-hover:scale-110 group-hover:border-teal-400/50 group-hover:bg-teal-500/20 group-hover:text-teal-200 transition-all duration-300 shadow-inner">
                  <GradeSubjectIcon name={sub.icon} className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
                </div>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3.5 flex items-center justify-between gap-1.5 sm:gap-2 flex-1">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-teal-200 transition-colors min-w-0 flex-1 line-clamp-2">
                  {sub.name}
                </h3>
                <span className="btn-open shrink-0">
                  <span>Open</span>
                  <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
