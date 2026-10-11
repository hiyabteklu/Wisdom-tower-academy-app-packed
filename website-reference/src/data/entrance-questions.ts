/**
 * Entrance Questions package: past national entrance exams by stream, subject and year.
 *
 * Structure:  Entrance Questions -> Natural / Social -> Subject -> Year -> Exams
 * Exam content is NOT hard-coded. Each year page reads published `exams` rows from
 * Supabase (learning_resources) using this scope path:
 *
 *     entrance/{stream}/{subject}/{year}      e.g. entrance/natural/physics/2016
 *
 * Add them from Admin -> Content library -> Entrance Questions.
 */

export const ENTRANCE_PACKAGE_ID = "entrance-questions";
export const ENTRANCE_BASE_PATH = "/academy/entrance-questions";

/** File on disk is public/images/Entrance questions.jpeg (space is URL-encoded). */
export const ENTRANCE_IMAGE = "/images/Entrance%20questions.jpeg";

export const ENTRANCE_YEARS = ["2014", "2015", "2016", "2017", "2018", "2019"] as const;
export type EntranceYear = (typeof ENTRANCE_YEARS)[number];

export type EntranceSubject = {
  id: string;
  name: string;
  /** Icon key used by GradeSubjectIcon */
  icon: string;
};

export type EntranceStreamId = "natural" | "social";

export type EntranceStream = {
  id: EntranceStreamId;
  label: string;
  image: string;
  accent: string;
  subjects: EntranceSubject[];
};

const ENGLISH: EntranceSubject = { id: "english", name: "English", icon: "book" };
const MATH: EntranceSubject = { id: "mathematics", name: "Mathematics", icon: "calculator" };
const SAT: EntranceSubject = {
  id: "sat",
  name: "Scholastic Aptitude Test (SAT)",
  icon: "target",
};

export const ENTRANCE_STREAMS: EntranceStream[] = [
  {
    id: "natural",
    label: "Natural Science",
    image: "/images/natural.jpeg",
    accent: "text-emerald-300",
    subjects: [
      ENGLISH,
      MATH,
      SAT,
      { id: "physics", name: "Physics", icon: "atom" },
      { id: "chemistry", name: "Chemistry", icon: "flask" },
      { id: "biology", name: "Biology", icon: "leaf" },
    ],
  },
  {
    id: "social",
    label: "Social Science",
    image: "/images/social.jpeg",
    accent: "text-amber-300",
    subjects: [
      ENGLISH,
      MATH,
      SAT,
      { id: "geography", name: "Geography", icon: "globe" },
      { id: "history", name: "History", icon: "scroll" },
      { id: "economics", name: "Economics", icon: "coins" },
    ],
  },
];

export function getEntranceStream(id: string): EntranceStream | undefined {
  return ENTRANCE_STREAMS.find((s) => s.id === id);
}

export function getEntranceSubject(
  streamId: string,
  subjectId: string
): EntranceSubject | undefined {
  return getEntranceStream(streamId)?.subjects.find((s) => s.id === subjectId);
}

export function isEntranceYear(year: string): year is EntranceYear {
  return (ENTRANCE_YEARS as readonly string[]).includes(year);
}

/** Supabase learning_resources.scope_path for one subject + year. */
export function entranceScope(streamId: string, subjectId: string, year: string): string {
  return `entrance/${streamId}/${subjectId}/${year}`;
}
