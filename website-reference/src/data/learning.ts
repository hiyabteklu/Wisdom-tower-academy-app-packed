/**
 * Demo My Learning content only.
 * Cart is driven by src/lib/cart.ts (localStorage) — not this file.
 */

export type LearningKind = "course" | "service" | "bundle";

export type LearningItem = {
  id: string;
  kind: LearningKind;
  title: string;
  subtitle: string;
  space: "academy" | "digital";
  progress: number;
  status: "in_progress" | "not_started" | "completed";
  href: string;
  image: string;
  lastAccess?: string;
  badge?: string;
};

export const demoLearning: LearningItem[] = [
  {
    id: "l1",
    kind: "course",
    title: "Grade 12 · Mathematics",
    subtitle: "Question banks · solutions · practice path",
    space: "academy",
    progress: 62,
    status: "in_progress",
    href: "/academy/grades/12",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    lastAccess: "Today",
    badge: "Continue",
  },
  {
    id: "l2",
    kind: "course",
    title: "UAT Quantitative Path",
    subtitle: "Mocks, strategies, timed drills",
    space: "academy",
    progress: 28,
    status: "in_progress",
    href: "/academy/uat",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    lastAccess: "Yesterday",
  },
  {
    id: "l3",
    kind: "course",
    title: "Freshman · General Physics",
    subtitle: "Notes, examples, quiz practice",
    space: "academy",
    progress: 100,
    status: "completed",
    href: "/academy/freshman",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbe4f9df?w=600&q=80",
    lastAccess: "Last week",
    badge: "Completed",
  },
];
