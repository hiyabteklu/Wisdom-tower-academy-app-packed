export interface RemedialSubject {
  id: string;
  name: string;
  description: string;
  /** 16:9 cover — public/images/remedial/{id}.jpg */
  image: string;
}

function img(id: string) {
  return `/images/remedial/${id}.jpg`;
}

export const remedialSubjects: RemedialSubject[] = [
  {
    id: "english",
    name: "English",
    description: "Grammar fundamentals, reading comprehension, vocabulary expansion, sentence mechanics, and introductory essay writing.",
    image: img("english"),
  },
  {
    id: "maths",
    name: "Maths",
    description: "Algebraic simplification, polynomials, quadratic equations, coordinate geometry, trigonometry, and logarithms.",
    image: img("maths"),
  },
  {
    id: "physics",
    name: "Physics",
    description: "Kinematics, Newton's laws of motion, gravitation, work and power, introductory electrostatics, and wave properties.",
    image: img("physics"),
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Classification of matter, periodic trends, chemical equations, stoichiometric calculations, and introductory acid-base chemistry.",
    image: img("chemistry"),
  },
  {
    id: "biology",
    name: "Biology",
    description: "Cell structure and function, basic taxonomy, human organ systems, plant anatomy, and basic genetics.",
    image: img("biology"),
  },
  {
    id: "history",
    name: "History",
    description: "Modern Ethiopian history, major political transitions, regional interactions, and key global historical milestones.",
    image: img("history"),
  },
  {
    id: "geography",
    name: "Geography",
    description: "Map reading skills, Ethiopian physical geography, climate zones, population demographics, and economic activities.",
    image: img("geography"),
  },
];

export function getRemedialSubject(id: string) {
  return remedialSubjects.find((s) => s.id === id);
}
