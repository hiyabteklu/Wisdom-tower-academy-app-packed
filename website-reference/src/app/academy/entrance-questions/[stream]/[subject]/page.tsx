import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  ENTRANCE_BASE_PATH,
  ENTRANCE_STREAMS,
  ENTRANCE_YEARS,
  getEntranceStream,
  getEntranceSubject,
} from "@/data/entrance-questions";

export function generateStaticParams() {
  return ENTRANCE_STREAMS.flatMap((st) =>
    st.subjects.map((sub) => ({ stream: st.id, subject: sub.id }))
  );
}

export default async function EntranceSubjectPage({
  params,
}: {
  params: Promise<{ stream: string; subject: string }>;
}) {
  const { stream: streamId, subject: subjectId } = await params;
  const stream = getEntranceStream(streamId);
  const subject = getEntranceSubject(streamId, subjectId);
  if (!stream || !subject) notFound();

  const streamHref = `${ENTRANCE_BASE_PATH}/${stream.id}`;

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <CategoryBackButton fallback={streamHref} />

        <div className="mb-5 sm:mb-6 animate-fade-up">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-wisdom-muted mb-0.5">
            Entrance Questions · {stream.label}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {subject.name}
          </h1>
        </div>

        <p className="text-xs font-bold tracking-[0.15em] uppercase text-wisdom-muted mb-3 text-left">
          Exam year
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {ENTRANCE_YEARS.map((year) => (
            <Link
              key={year}
              href={`${streamHref}/${subject.id}/${year}`}
              prefetch={true}
              className="card-modern group flex items-center justify-between gap-3 p-3.5 sm:p-5 shadow-md shadow-black/20 hover:border-teal-400/35 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-500/10 text-teal-300 group-hover:bg-teal-500/20 transition-colors">
                  <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <h3 className="font-display text-lg sm:text-2xl font-extrabold tabular-nums text-white group-hover:text-teal-200 transition-colors">
                  {year}
                </h3>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
