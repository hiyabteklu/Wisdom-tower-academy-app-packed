/**
 * Academy packages — prices updated Sep 2026.
 * G9–11 250 · G12 400 · COC 250 · UAT 300 · Freshman 350 · ECE S1 300 · Remedial 250.
 * GAT & Exit Exam pathways are not sold yet (coming soon hubs).
 */

export type AcademyPackage = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  priceEtb: number;
  href: string;
  image: string;
  includes: string[];
  enrolledLabel: string;
  group: "grades" | "branch" | "special";
};

export const PACKAGE_PRICE_ETB = 250;
export const FRESHMAN_PRICE_ETB = 350;

export const packageImages = {
  "grade-9-12": "/images/packages/grade-9-12_9842aa.jpeg",
  "grade-9": "/images/packages/grade-9_67df27.jpeg",
  "grade-10": "/images/packages/grade-10_156767.jpeg",
  "grade-11": "/images/packages/grade-11_6309fc.jpeg",
  "grade-12": "/images/packages/grade-12_f1ddef.jpeg",
  freshman: "/images/packages/freshman_00241b.jpeg",
  uat: "/images/packages/uat_56b257.jpeg",
  gat: "/images/packages/gat_46ddb1.jpeg",
  coc: "/images/packages/coc_e44a09.jpeg",
  "exit-exam": "/images/packages/exit-exam_c32a43.jpeg",
  remedial: "/images/packages/remedial.jpg",
} as const;

export const CORE_PACKAGE_INCLUDES = [
  "Official Textbooks & Comprehensive Reference Books",
  "Chapter-by-Chapter Short Notes & Key Summaries",
  "Extensive Chapter Question Banks",
  "Mock & Model Practice Exams",
  "All worked with official step-by-step solutions + Explain with AI",
  "All official universities midterms & finals worked with detailed solutions",
  "Flashcards for rapid active recall",
  "And more!",
];

export const academyPackages: AcademyPackage[] = [
  {
    id: "grade-9",
    name: "Grade 9 Package",
    shortName: "G9",
    description:
      "Start secondary with material built for Grade 9, not recycled general notes. Clear explanations, chapter practice, and exam-style questions so you build real confidence from the first term. Unlock a full grade or move subject by subject as you need.",
    priceEtb: 250,
    href: "/academy/grades/9",
    image: packageImages["grade-9"],
    includes: [
      "Complete Grade 9 syllabus & curriculum coverage",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "320+ students",
    group: "grades",
  },
  {
    id: "grade-10",
    name: "Grade 10 Package",
    shortName: "G10",
    description:
      "Grade 10 is where depth matters. Structured notes, chapter question banks, and solved practice exams help you master concepts before they pile up. Study the full grade or focus on the subjects that need the most work.",
    priceEtb: 250,
    href: "/academy/grades/10",
    image: packageImages["grade-10"],
    includes: [
      "Complete Grade 10 curriculum & stream preparation",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "410+ students",
    group: "grades",
  },
  {
    id: "grade-11",
    name: "Grade 11 Package",
    shortName: "G11",
    description:
      "Grade 11 raises the standard. Get subject notes written for this level, dense practice by chapter, and exams with full solutions so you know exactly how answers are built. One package for the full grade, or buy only what you need.",
    priceEtb: 250,
    href: "/academy/grades/11",
    image: packageImages["grade-11"],
    includes: [
      "Complete Grade 11 Natural & Social science streams",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "480+ students",
    group: "grades",
  },
  {
    id: "grade-12",
    name: "Grade 12 Package",
    shortName: "G12",
    description:
      "The year that counts most. Grade 12 material is organized for finals pace: precise notes, chapter drills, flashcards for fast review, and practice exams with solutions. Prepare with the same discipline the exam will demand.",
    priceEtb: 400,
    href: "/academy/grades/12",
    image: packageImages["grade-12"],
    includes: [
      "Complete Grade 12 syllabus & national matriculation prep",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "560+ students",
    group: "grades",
  },
  {
    id: "freshman",
    name: "Freshman Package",
    shortName: "Freshman",
    description:
      "Every first-year course in one place, natural and social streams included. Notes, chapter questions, flashcards, and solved practice exams for 20+ courses, plus tools that keep you on track: GPA on the Ethiopian scale, field leaderboards, progress per subject, study planner, and a focus timer. Built so you never hunt for quality material across random files.",
    priceEtb: FRESHMAN_PRICE_ETB,
    href: "/academy/freshman",
    image: packageImages.freshman,
    includes: [
      "All 20+ freshman courses (natural and social streams)",
      "Ethiopian university GPA calculator & field leaderboard",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "890+ students",
    group: "branch",
  },
  {
    id: "uat",
    name: "UAT Package",
    shortName: "UAT",
    description:
      "University Admission Test prep that respects how the exam is actually written. Focused notes, chapter question banks, flashcards for rapid recall, and practice exams with solutions. Train under the same pressure you will face on test day.",
    priceEtb: 300,
    href: "/academy/uat",
    image: packageImages.uat,
    includes: [
      "Comprehensive UAT quantitative & verbal entrance tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "610+ students",
    group: "branch",
  },
  {
    id: "gat",
    name: "GAT Package",
    shortName: "GAT",
    description:
      "Graduate Admission Test resources organized the way the exam expects you to think. Notes on core GAT material, chapter questions, flashcards, and practice exams with solutions. Built for serious candidates who want structure, not scattered PDFs.",
    priceEtb: 300,
    href: "/academy/gat",
    image: packageImages.gat,
    includes: [
      "Postgraduate GAT analytical & quantitative problem tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "Coming soon",
    group: "branch",
  },
  {
    id: "coc",
    name: "COC Package",
    shortName: "COC",
    description:
      "Certificate of Competency prep with clear notes, chapter practice, flashcards, and solved exams. Material aimed at the skills and judgment the assessment rewards, so you walk in knowing the standard, not guessing it.",
    priceEtb: 250,
    href: "/academy/coc",
    image: packageImages.coc,
    includes: [
      "Occupational standard competencies & evaluation prep",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "380+ students",
    group: "branch",
  },
  {
    id: "exit-exam",
    name: "Exit Exam Package",
    shortName: "Exit Exam",
    description:
      "University exit exam review by department, with structured notes and practice when materials open. Designed for final-year students who need focused revision, not generic summaries.",
    priceEtb: 300,
    href: "/academy/exit-exam",
    image: packageImages["exit-exam"],
    includes: [
      "Department graduation exit exam comprehensive tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "Coming soon",
    group: "branch",
  },
  {
    id: "remedial",
    name: "Remedial Package",
    shortName: "Remedial",
    description:
      "Catch-up pathway for core subjects. Strengthen foundations in English, Maths, Physics, Chemistry, Biology, History and Geography with the same learning hubs used across the Academy: notes, flashcards, question banks and practice exams.",
    priceEtb: 250,
    href: "/academy/remedial",
    image: packageImages.remedial,
    includes: [
      "All seven core remedial prerequisite subjects",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "New pathway",
    group: "branch",
  },
  {
    id: "ece-y3-sem-1",
    name: "ECE Year 3: Semester 1",
    shortName: "ECE S1",
    description:
      "Senior Electrical and Computer Engineering, Semester 1. Course material written for your department, not generic engineering notes. Each course carries its own question bank, flashcards, and practice exams with solutions. More departments join this track over time.",
    priceEtb: 300,
    href: "/academy/special-packages/electrical-computer-engineering/sem-1",
    image: "/images/special-packages/ece-sem-1.jpg",
    includes: [
      "All 7 Year 3 Semester 1 engineering courses",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "Special track",
    group: "special",
  },
  {
    id: "ece-y3-sem-2",
    name: "ECE Year 3: Semester 2",
    shortName: "ECE S2",
    description:
      "Senior Electrical and Computer Engineering, Semester 2. Same department standard as Semester 1: course-level notes, chapter questions, flashcards, and solved practice exams for every listed course.",
    priceEtb: 300,
    href: "/academy/special-packages/electrical-computer-engineering/sem-2",
    image: "/images/special-packages/ece-sem-2.jpg",
    includes: [
      "All 7 Year 3 Semester 2 engineering courses",
      ...CORE_PACKAGE_INCLUDES,
    ],
    enrolledLabel: "Special track",
    group: "special",
  },
];

export const GRADE_9_12_PACKAGE: AcademyPackage = {
  id: "grade-9-12",
  name: "Grade 9–12 Secondary Curriculum",
  shortName: "G9–12",
  description:
    "Complete Grade 9 to 12 secondary curriculum. Master textbook chapters, drill with targeted questions, practice with timed exams, and prepare thoroughly for national matriculation.",
  priceEtb: 1000,
  href: "/academy/grades",
  image: packageImages["grade-9-12"],
  includes: [
    "Complete Grade 9, 10, 11, and 12 Ethiopian national curriculum",
    ...CORE_PACKAGE_INCLUDES,
  ],
  enrolledLabel: "1,200+ students",
  group: "grades",
};

export function getPackage(id: string): AcademyPackage | undefined {
  if (id === "grade-9-12") return GRADE_9_12_PACKAGE;
  return academyPackages.find((p) => p.id === id);
}

export function packageIdForGrade(gradeId: string): string {
  return `grade-${gradeId}`;
}

export type PaymentMethodId = "telebirr" | "cbe" | "abyssinia" | "other";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  shortLabel: string;
  logo: string;
  instructions: string[];
  accountLabel: string;
  accountValue: string;
  accountName: string;
};

const ACCOUNT_NAME = "Hiyab Teklu";

export const paymentMethods: PaymentMethod[] = [
  {
    id: "telebirr",
    name: "Telebirr",
    shortLabel: "Telebirr",
    logo: "/images/banks/telebirr.png",
    accountLabel: "Telebirr number",
    accountValue: "0900763030",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Open Telebirr and send the exact package amount.",
      "Put the order reference in the remark / reason field.",
      "Keep the SMS confirmation. Enter the transaction ID on the form below.",
    ],
  },
  {
    id: "cbe",
    name: "Commercial Bank of Ethiopia (CBE)",
    shortLabel: "CBE",
    logo: "/images/banks/cbe.png",
    accountLabel: "CBE account",
    accountValue: "1000665070654",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Transfer the exact package amount to the CBE account above.",
      "Use the order reference in the transfer remark if available.",
      "Keep the receipt. Enter the transaction reference on the form below.",
    ],
  },
  {
    id: "abyssinia",
    name: "Bank of Abyssinia",
    shortLabel: "Abyssinia",
    logo: "/images/banks/abyssinia.png",
    accountLabel: "Abyssinia account",
    accountValue: "211958545",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Transfer the exact package amount to the Abyssinia account above.",
      "Use the order reference in the transfer remark if available.",
      "Keep the receipt. Enter the transaction reference on the form below.",
    ],
  },
  {
    id: "other",
    name: "Other bank / method",
    shortLabel: "Other",
    logo: "/images/banks/other.png",
    accountLabel: "Account details",
    accountValue: "Contact support for account details",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Use the account details provided after you select this method.",
      "Send the exact package amount.",
      "Upload your receipt or enter the transaction reference for verification.",
    ],
  },
];

export function formatEtb(amount: number): string {
  return `${amount.toLocaleString("en-ET")} ETB`;
}
