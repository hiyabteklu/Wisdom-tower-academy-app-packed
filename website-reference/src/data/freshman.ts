export interface FreshmanSubject {
  id: string;
  name: string;
  description: string;
  /** 16:9 cover — public/images/freshman/{id}.jpg */
  image: string;
}

function img(id: string) {
  return `/images/freshman/${id}.jpg`;
}

export const freshmanSubjects: FreshmanSubject[] = [
  {
    id: "math-natural",
    name: "Math Natural",
    description: "Calculus (differentiation and integration), analytic geometry, vectors, matrices, and algebraic systems for STEM disciplines.",
    image: img("math-natural"),
  },
  {
    id: "math-social",
    name: "Math Social",
    description: "Algebraic foundations, linear programming, financial mathematics, descriptive and inferential statistics for social sciences.",
    image: img("math-social"),
  },
  {
    id: "physical-fitness",
    name: "Physical Fitness",
    description: "Health-related fitness, cardiovascular endurance, strength development, and lifetime personal wellness principles.",
    image: img("physical-fitness"),
  },
  {
    id: "english-1",
    name: "English 1",
    description: "Academic reading strategies, complex grammatical structures, formal paragraph mechanics, and expository writing.",
    image: img("english-1"),
  },
  {
    id: "physics",
    name: "Physics",
    description: "Classical mechanics, vectors, motion in one and two dimensions, work-energy theorem, fluid dynamics, and thermodynamics.",
    image: img("physics"),
  },
  {
    id: "psychology",
    name: "Psychology",
    description: "Biological bases of behavior, cognitive psychology, learning theories, motivation, personality development, and mental health.",
    image: img("psychology"),
  },
  {
    id: "logic",
    name: "Logic",
    description: "Formal propositions, truth tables, categorical logic, syllogistic deductions, and fallacies in argumentation.",
    image: img("logic"),
  },
  {
    id: "geography",
    name: "Geography",
    description: "Physical landscape processes, climate dynamics, population distribution, and resource management across Ethiopia and the Horn.",
    image: img("geography"),
  },
  {
    id: "anthropology",
    name: "Anthropology",
    description: "Human biological and cultural evolution, ethnographic methods, indigenous traditions, and societal institutions in Ethiopia.",
    image: img("anthropology"),
  },
  {
    id: "civics",
    name: "Civics",
    description: "Constitutional principles, federal governance structure, human rights jurisprudence, rule of law, and civic participation.",
    image: img("civics"),
  },
  {
    id: "economics",
    name: "Economics",
    description: "Microeconomic behavior (supply, demand, consumer theory, production costs) and macroeconomic aggregates (GDP, fiscal policy, monetary systems).",
    image: img("economics"),
  },
  {
    id: "emerging-technology",
    name: "Emerging Technology",
    description: "Architectures and applications of AI, data science, IoT networks, cloud computing, cybersecurity, and additive manufacturing.",
    image: img("emerging-technology"),
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    description: "Venture ideation, business model design, market validation, Ethiopian regulatory frameworks, and financial planning.",
    image: img("entrepreneurship"),
  },
  {
    id: "global-trends",
    name: "Global Trends",
    description: "Post-Cold War international order, regional cooperation in East Africa, global trade policies, multilateral institutions, and environmental diplomacy.",
    image: img("global-trends"),
  },
  {
    id: "history",
    name: "History",
    description: "Historical trajectory of Ethiopia and the Horn of Africa: statecraft, trade networks, modernization initiatives, and historical historiography.",
    image: img("history"),
  },
  {
    id: "inclusiveness",
    name: "Inclusiveness",
    description: "Principles of universal design, disability rights, inclusive education paradigms, vulnerability assessments, and supportive public accommodations.",
    image: img("inclusiveness"),
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Atomic orbital theory, molecular geometry, stoichiometry, thermodynamics, chemical kinetics, chemical equilibria, and solution chemistry.",
    image: img("chemistry"),
  },
  {
    id: "biology",
    name: "Biology",
    description: "Cell architecture, bioenergetics, DNA replication, gene expression, plant and animal physiology, and ecological ecosystems.",
    image: img("biology"),
  },
  {
    id: "cpp-programming",
    name: "C++ Programming",
    description: "Structured problem solving, procedural programming in C++, pointer arithmetic, memory allocation, arrays, and object-oriented abstractions.",
    image: img("cpp-programming"),
  },
  {
    id: "applied-math-1",
    name: "Applied Math 1",
    description: "Applied differential equations, matrix methods, numerical approximations, and mathematical modeling for physical sciences.",
    image: img("applied-math-1"),
  },
  {
    id: "english-2",
    name: "English 2",
    description: "Advanced research methodology, source synthesis, APA/IEEE citation standards, literature reviews, argumentative essays, and oral academic presentations.",
    image: img("english-2"),
  },
];

/** Legacy URL/id → current id */
export const FRESHMAN_SUBJECT_ALIASES: Record<string, string> = {
  mathematics: "math-natural",
};

export function resolveFreshmanSubjectId(id: string): string {
  return FRESHMAN_SUBJECT_ALIASES[id] || id;
}

export function getFreshmanSubject(id: string) {
  const resolved = resolveFreshmanSubjectId(id);
  return freshmanSubjects.find((s) => s.id === resolved);
}
