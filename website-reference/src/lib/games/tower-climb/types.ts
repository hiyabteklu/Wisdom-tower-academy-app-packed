/**
 * Type definitions for Tower Climb (quiz progression game)
 * STRICT RULE: Only Question Bank / Chapter Quiz questions are used.
 * Never uses Exam-section questions.
 */

export type ChapterQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  solution?: string;
  chapter: number;
  sortOrder?: number;
  subject: string;
  courseTitle: string;
  scopePath?: string;
  packageId?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type ZoneTheme =
  | "stone-foundation"   // Floors 1-10
  | "library-hall"       // Floors 11-20
  | "clockwork-gallery"  // Floors 21-30
  | "observatory"        // Floors 31-40
  | "sky-crown";         // Floors 41+

export type FloorState = "cleared" | "playable" | "locked" | "needs-download";

export interface TowerFloor {
  floorNumber: number;
  chapterNumber: number;
  title: string;
  subtitle: string;
  isBoss: boolean;
  zone: ZoneTheme;
  state: FloorState;
  stars: number; // 0 to 3
  bestScore: number;
  questions: ChapterQuestion[];
  isFreePreview: boolean;
  packageId?: string;
}

export interface CourseTower {
  id: string; // scope_path, e.g. "freshman/math-natural" or "grade/12/mathematics"
  title: string;
  courseName: string;
  subject: string;
  level: string;
  totalFloors: number;
  packageId?: string;
  isLocked: boolean;
  lockReason?: string;
  accentColor: string;
  floors: TowerFloor[];
  highestUnlockedFloor: number;
  totalStarsEarned: number;
  maxPossibleStars: number;
}

export interface ClimbPowerUps {
  fiftyFifty: number; // Removes 2 wrong choices
  freeze: number;     // Adds +10 seconds
  skip: number;       // Skips question without losing heart
}

export interface ReviewAtticItem {
  question: ChapterQuestion;
  selectedText?: string;
  correctText: string;
  solution?: string;
  timestamp: number;
  attemptsCount: number;
}

export interface DailyClimbState {
  lastCompletedDateIso?: string;
  currentStreak: number;
  bestStreak: number;
  questions: ChapterQuestion[];
  isCompletedToday: boolean;
}

export interface TowerClimbProfile {
  totalXp: number;
  level: number;
  badges: string[];
  streakDays: number;
  reviewAttic: ReviewAtticItem[];
  dailyClimb: DailyClimbState;
  floorRecords: Record<string, { stars: number; bestScore: number; clearedAt: string }>;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: "progression" | "mastery" | "streak" | "remediation";
}
