import { packageImages } from "@/data/packages";

export type ResourceType =
  | "books"
  | "short-notes"
  | "videos"
  | "flashcards"
  | "question-banks"
  | "exams";

export interface ResourceHub {
  id: ResourceType;
  name: string;
  description: string;
  accent: string;
  glow: string;
  icon: string;
  /** public/images/hubs/{id}.jpg — same images sitewide */
  image: string;
}

function hubImg(id: ResourceType) {
  return `/images/hubs/${id}.jpg`;
}

/** Legacy hub URL/id → current id */
export const HUB_ALIASES: Record<string, ResourceType> = {
  references: "short-notes",
  notes: "short-notes",
  "short-note": "short-notes",
  textbooks: "books",
  textbook: "books",
  book: "books",
  cards: "flashcards",
  flashcard: "flashcards",
  "question-bank": "question-banks",
  questions: "question-banks",
  exam: "exams",
};

export function resolveHubId(id: string): string {
  return HUB_ALIASES[id] || id;
}

export interface Grade {
  id: string;
  label: string;
  short: string;
  subtitle: string;
  accent: string;
  ring: string;
  gradient: string;
  image: string;
}

export const grades: Grade[] = [
  {
    id: "9",
    label: "Grade 9",
    short: "G9",
    subtitle: "Foundation year: core subjects & study habits",
    accent: "text-sky-400",
    ring: "border-sky-400/40 hover:border-sky-400/70",
    gradient: "from-sky-500/25 via-sky-500/5 to-transparent",
    image: packageImages["grade-9"],
  },
  {
    id: "10",
    label: "Grade 10",
    short: "G10",
    subtitle: "Build depth: practice & concept mastery",
    accent: "text-violet-400",
    ring: "border-violet-400/40 hover:border-violet-400/70",
    gradient: "from-violet-500/25 via-violet-500/5 to-transparent",
    image: packageImages["grade-10"],
  },
  {
    id: "11",
    label: "Grade 11",
    short: "G11",
    subtitle: "Advance: exam readiness & application",
    accent: "text-amber-400",
    ring: "border-amber-400/40 hover:border-amber-400/70",
    gradient: "from-amber-500/25 via-amber-500/5 to-transparent",
    image: packageImages["grade-11"],
  },
  {
    id: "12",
    label: "Grade 12",
    short: "G12",
    subtitle: "Peak year: finals, entrance & polish",
    accent: "text-emerald-400",
    ring: "border-emerald-400/40 hover:border-emerald-400/70",
    gradient: "from-emerald-500/25 via-emerald-500/5 to-transparent",
    image: packageImages["grade-12"],
  },
];

/**
 * Public learning hubs shown on every subject/package.
 * Videos are intentionally omitted until content is ready — keep "videos" in
 * ResourceType / HubId so admin + DB can still use it later.
 */
export const resourceHubs: ResourceHub[] = [
  {
    id: "books",
    name: "Books",
    description: "Core textbooks and curated reading lists",
    accent: "text-sky-400",
    glow: "group-hover:shadow-sky-500/20",
    icon: "book",
    image: hubImg("books"),
  },
  {
    id: "short-notes",
    name: "Short Notes",
    description: "Concise notes, summaries, and study guides",
    accent: "text-violet-400",
    glow: "group-hover:shadow-violet-500/20",
    icon: "library",
    image: hubImg("short-notes"),
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Quick recall decks for key concepts",
    accent: "text-amber-400",
    glow: "group-hover:shadow-amber-500/20",
    icon: "layers",
    image: hubImg("flashcards"),
  },
  {
    id: "question-banks",
    name: "Question Banks",
    description: "Practice sets by topic and difficulty",
    accent: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/20",
    icon: "list",
    image: hubImg("question-banks"),
  },
  {
    id: "exams",
    name: "Exams",
    description: "Past papers, mocks, and timed drills",
    accent: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/20",
    icon: "clipboard",
    image: hubImg("exams"),
  },
];

export function getGrade(id: string) {
  return grades.find((g) => g.id === id);
}

export function getResource(id: string) {
  const resolved = resolveHubId(id);
  return resourceHubs.find((r) => r.id === resolved);
}
