/**
 * Pilot quiz bank for development.
 * Replace / extend with real content or load from Supabase later.
 *
 * `solution` = your premade written solution (always free, no AI).
 * AI Explain is a separate optional button for extra tutoring.
 */

export type QuizQuestion = {
  id: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  choices: string[];
  /** Index into choices */
  correctIndex: number;
  /** Premade solution you upload — shown via "Solution" button */
  solution?: string;
};

export const sampleQuestions: QuizQuestion[] = [
  {
    id: "logic-001",
    subject: "Logic",
    difficulty: "easy",
    question: "If all A are B, and all B are C, which conclusion is valid?",
    choices: [
      "Some C are not A",
      "All A are C",
      "No A are C",
      "All C are A",
    ],
    correctIndex: 1,
    solution:
      "This is a classic syllogism (transitive inclusion). If every A is inside B, and every B is inside C, then every A must also be inside C. So “All A are C” is valid. “All C are A” is not required — C can be larger than A. “No A are C” contradicts the chain. “Some C are not A” may be true in some cases but is not forced by the premises alone as the single necessary conclusion among the options.",
  },
  {
    id: "math-001",
    subject: "Mathematics",
    difficulty: "easy",
    question: "What is the value of 2³ × 3²?",
    choices: ["36", "72", "18", "24"],
    correctIndex: 1,
    solution:
      "Compute powers first: 2³ = 2×2×2 = 8, and 3² = 3×3 = 9. Multiply: 8 × 9 = 72. Do not add the exponents across different bases; only multiply the results.",
  },
  {
    id: "physics-001",
    subject: "Physics",
    difficulty: "medium",
    question:
      "A car travels 60 km in 1.5 hours. What is its average speed in km/h?",
    choices: ["30", "40", "45", "90"],
    correctIndex: 1,
    solution:
      "Average speed = distance ÷ time. Distance = 60 km, time = 1.5 h. 60 ÷ 1.5 = 40 km/h. (1.5 hours is 3/2 hours, so 60 × 2/3 = 40.)",
  },
  {
    id: "civics-001",
    subject: "Civics",
    difficulty: "easy",
    question: "In a democratic system, the primary source of political authority is:",
    choices: [
      "The military",
      "The people",
      "A single ruling party only",
      "Foreign governments",
    ],
    correctIndex: 1,
    solution:
      "Democracy means rule by the people: legitimacy comes from citizens through elections and participation. The military, a single party, or foreign governments may hold power in other systems, but they are not the defining source of authority in a democracy.",
  },
  {
    id: "bio-001",
    subject: "Biology",
    difficulty: "medium",
    question: "Which organelle is primarily responsible for producing ATP in eukaryotic cells?",
    choices: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"],
    correctIndex: 2,
    solution:
      "Mitochondria run cellular respiration and produce most ATP (“powerhouses” of the cell). The nucleus stores DNA, ribosomes make proteins, and the Golgi modifies and packages proteins — none are the main ATP factories.",
  },
];

export function getSampleQuestions(subject?: string): QuizQuestion[] {
  if (!subject) return sampleQuestions;
  const key = subject.toLowerCase();
  return sampleQuestions.filter((q) => q.subject.toLowerCase() === key);
}
