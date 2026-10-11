/**
 * Ethiopian secondary curriculum subjects (flat lists — no natural/social split).
 * Each grade has its own subject set.
 *
 * Subject thumbnails live in public/images/Grade 9 … Grade 12 (see GRADE_IMAGE_FILES).
 */

export type GradeSubject = {
  id: string;
  name: string;
  /** Lucide icon name key used by GradeSubjectIcon (fallback when there is no image) */
  icon: string;
  hint?: string;
  /** Thumbnail from public/images/Grade N/ */
  image?: string;
};

const GRADE_IMAGE_DIR: Record<string, string> = {
  "9": "Grade 9",
  "10": "Grade 10",
  "11": "Grade 11",
  "12": "Grade 12",
};

/** Exact file names inside each grade folder (extensions differ per file). */
const GRADE_IMAGE_FILES: Record<string, Record<string, string>> = {
  "9": {
    biology: "g9-biology.jpg",
    chemistry: "g9-chemistry.jpg",
    economics: "g9-economics.jpg",
    geography: "g9-geography.jpg",
    history: "g9-history.jpg",
    mathematics: "g9-math.jpg",
    physics: "g9-physics.jpg",
  },
  "10": {
    biology: "g10-biology.jpg",
    chemistry: "g10-chemistry.jpg",
    economics: "g10-economics.jpg",
    geography: "g10-geography.jpg",
    history: "g10-history.jpg",
    mathematics: "g10-math.jpg",
    physics: "g10-physics.jpg",
  },
  "11": {
    biology: "g11-biology.jpeg",
    chemistry: "g11-chemistry.jpg",
    economics: "g11-economics.jpeg",
    geography: "g11-geography.jpeg",
    history: "g11-history.jpeg",
    mathematics: "g11-math.jpeg",
    physics: "g11-physics.jpeg",
  },
  "12": {
    biology: "g12-biology.jpeg",
    chemistry: "g12-chemistry.jpeg",
    economics: "g12-economics.jpeg",
    english: "g12-english.jpeg",
    geography: "g12-geography.jpeg",
    history: "g12-history.jpeg",
    mathematics: "g12-math.jpeg",
    physics: "g12-physics.jpeg",
    sat: "sat.jpeg",
  },
};

/** Public URL of a subject thumbnail, or undefined when no image exists for it. */
export function gradeSubjectImage(gradeId: string, subjectId: string): string | undefined {
  const dir = GRADE_IMAGE_DIR[gradeId];
  const file = GRADE_IMAGE_FILES[gradeId]?.[subjectId];
  if (!dir || !file) return undefined;
  return `/images/${encodeURIComponent(dir)}/${file}`;
}

function withImages(gradeId: string, subjects: GradeSubject[]): GradeSubject[] {
  return subjects.map((s) => ({ ...s, image: gradeSubjectImage(gradeId, s.id) }));
}

const G9_SUBJECTS: GradeSubject[] = withImages("9", [
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Matter, atoms, reactions" },
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Algebra, geometry, number work" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Motion, forces, energy" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Cells, organisms, life processes" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Earth systems and places" },
  { id: "history", name: "History", icon: "scroll", hint: "Past societies and change" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Resources, markets, choices" },
]);

const G10_SUBJECTS: GradeSubject[] = withImages("10", [
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Functions, geometry, statistics" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Systems, ecology, health" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Bonding, stoichiometry" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Waves, electricity foundations" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Human and physical geography" },
  { id: "history", name: "History", icon: "scroll", hint: "Regional and world contexts" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Production and national economy" },
]);

const G11_SUBJECTS: GradeSubject[] = withImages("11", [
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Advanced algebra and exam path" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Genetics, physiology, ecology" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Mechanics, energy, fields" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Structure, reactions, equilibrium" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Markets, macro, development" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Population, development, Ethiopia" },
  { id: "history", name: "History", icon: "scroll", hint: "Ethiopia and global history" },
]);

const G12_SUBJECTS: GradeSubject[] = withImages("12", [
  { id: "english", name: "English", icon: "book", hint: "Leaving-exam English" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Organic and physical chemistry" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Exam depth across life sciences" },
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Exam-ready pure and applied math" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Electromagnetism, modern physics" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Exam depth in geo systems" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Exam depth in economic theory" },
  { id: "history", name: "History", icon: "scroll", hint: "Exam depth in historical analysis" },
  { id: "sat", name: "SAT", icon: "target", hint: "SAT-style practice and strategies" },
]);

export function subjectsForGrade(gradeId: string): GradeSubject[] {
  if (gradeId === "9") return G9_SUBJECTS;
  if (gradeId === "10") return G10_SUBJECTS;
  if (gradeId === "11") return G11_SUBJECTS;
  if (gradeId === "12") return G12_SUBJECTS;
  return [];
}

export function getGradeSubject(
  gradeId: string,
  subjectId: string
): GradeSubject | undefined {
  return subjectsForGrade(gradeId).find((s) => s.id === subjectId);
}

/** @deprecated Streams removed — kept for leftover imports */
export type GradeStream = {
  id: "natural" | "social";
  label: string;
  blurb: string;
  accent: string;
  border: string;
  subjects: GradeSubject[];
};

/** @deprecated Use subjectsForGrade instead */
export function streamsForGrade(gradeId: string): GradeStream[] {
  const subjects = subjectsForGrade(gradeId);
  return [
    {
      id: "natural",
      label: "Subjects",
      blurb: "All subjects for this grade",
      accent: "text-emerald-300",
      border: "border-emerald-400/30",
      subjects,
    },
  ];
}
