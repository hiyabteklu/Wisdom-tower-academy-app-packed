/**
 * Ethiopian secondary curriculum subjects (flat lists — no natural/social split).
 * Each grade has its own subject set.
 */

export type GradeSubject = {
  id: string;
  name: string;
  /** Lucide icon name key used by GradeSubjectIcon */
  icon: string;
  hint?: string;
  image?: string;
};

const G9_SUBJECTS: GradeSubject[] = [
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Matter, atoms, reactions" },
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Algebra, geometry, number work" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Motion, forces, energy" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Cells, organisms, life processes" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Earth systems and places" },
  { id: "history", name: "History", icon: "scroll", hint: "Past societies and change" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Resources, markets, choices" },
];

const G10_SUBJECTS: GradeSubject[] = [
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Functions, geometry, statistics" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Systems, ecology, health" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Bonding, stoichiometry" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Waves, electricity foundations" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Human and physical geography" },
  { id: "history", name: "History", icon: "scroll", hint: "Regional and world contexts" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Production and national economy" },
];

const G11_SUBJECTS: GradeSubject[] = [
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Advanced algebra and exam path" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Genetics, physiology, ecology" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Mechanics, energy, fields" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Structure, reactions, equilibrium" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Markets, macro, development" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Population, development, Ethiopia" },
  { id: "history", name: "History", icon: "scroll", hint: "Ethiopia and global history" },
];

const G12_SUBJECTS: GradeSubject[] = [
  { id: "english", name: "English", icon: "book", hint: "Leaving-exam English" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Organic and physical chemistry" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Exam depth across life sciences" },
  { id: "mathematics", name: "Math", icon: "calculator", hint: "Exam-ready pure and applied math" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Electromagnetism, modern physics" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Exam depth in geo systems" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Exam depth in economic theory" },
  { id: "history", name: "History", icon: "scroll", hint: "Exam depth in historical analysis" },
  { id: "sat", name: "SAT", icon: "target", hint: "SAT-style practice and strategies" },
  { id: "exam-tips", name: "Exam tips", icon: "lightbulb", hint: "Study tactics and exam-day guidance" },
];

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
