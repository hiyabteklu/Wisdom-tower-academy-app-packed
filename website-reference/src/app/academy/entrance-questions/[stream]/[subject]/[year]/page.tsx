import { notFound } from "next/navigation";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import {
  ENTRANCE_BASE_PATH,
  ENTRANCE_PACKAGE_ID,
  ENTRANCE_STREAMS,
  ENTRANCE_YEARS,
  entranceScope,
  getEntranceStream,
  getEntranceSubject,
  isEntranceYear,
} from "@/data/entrance-questions";

export function generateStaticParams() {
  return ENTRANCE_STREAMS.flatMap((st) =>
    st.subjects.flatMap((sub) =>
      ENTRANCE_YEARS.map((year) => ({ stream: st.id, subject: sub.id, year }))
    )
  );
}

export default async function EntranceYearPage({
  params,
}: {
  params: Promise<{ stream: string; subject: string; year: string }>;
}) {
  const { stream: streamId, subject: subjectId, year } = await params;
  const stream = getEntranceStream(streamId);
  const subject = getEntranceSubject(streamId, subjectId);
  if (!stream || !subject || !isEntranceYear(year)) notFound();

  // Exams for this year are read from Supabase (learning_resources, hub "exams")
  const scopePath = entranceScope(stream.id, subject.id, year);
  const trackerScopeId = `entrance-${stream.id}-${subject.id}-${year}-exams`;
  const subjectHref = `${ENTRANCE_BASE_PATH}/${stream.id}/${subject.id}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="relative max-w-3xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <CategoryBackButton fallback={subjectHref} />

        <div className="mb-4 sm:mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-1">
            Entrance Questions · {stream.label} · {subject.name}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">
            <span className="text-teal-300">{year} Exam</span>
          </h1>
        </div>

        <div className="mb-6">
          <AcademicResultSaver
            scopeId={trackerScopeId}
            scopeLabel={`${subject.name} · ${year}`}
            accent="text-teal-300"
            scopePath={scopePath}
            hub="exams"
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub="exams"
          packageId={ENTRANCE_PACKAGE_ID}
          accent="text-teal-300"
          trackerScopeId={trackerScopeId}
        />
      </div>
    </div>
  );
}
