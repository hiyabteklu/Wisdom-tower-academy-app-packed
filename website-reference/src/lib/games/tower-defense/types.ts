/**
 * Data structures and types for Tower Defense of Knowledge (Web Game)
 * Strict requirement: Only Exam questions (hub === "exams") are used.
 */

export type ExamDifficulty = "easy" | "medium" | "hard";

export interface ExamQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  solution?: string;
  difficulty?: ExamDifficulty;
  subject: string;
  examTitle: string;
  scopePath?: string;
  packageId?: string;
}

export type EnemyType = "basic" | "fast" | "tank" | "boss";

export interface EnemyUnit {
  id: string;
  question: ExamQuestion;
  shuffledChoices: string[];
  shuffledCorrectIndex: number;
  eliminatedChoiceIndices: number[]; // From 50/50 power-up
  type: EnemyType;
  maxHp: number;
  hp: number;
  speedMultiplier: number;
  timeLimitSec: number;
  title: string;
  loreLabel: string;
  x?: number; // 0 to 100% position on screen
  y?: number; // 0 to 100% position on screen
  isTargeted?: boolean;
}

export interface FlyingArrow {
  id: string;
  letter: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  progress: number; // 0 to 1
  isCorrect: boolean;
  state: "flying" | "hit" | "bouncing" | "fallen";
  rotation: number;
  createdAt: number;
}

export interface ArcadeParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export interface TowerState {
  maxHp: number;
  hp: number;
  isBreached: boolean;
  lastDamageTakenAt?: number;
}

export interface PowerUpInventory {
  freeze: number;      // Chronos Stasis: freezes timer and march for 12s
  fiftyFifty: number;  // Logic Filter: eliminates 2 incorrect options
  extraHeart: number;  // Fortify Core: restores +1 Tower HP (up to max)
  skip: number;        // Tactical Deflection: bypasses current question without damage
}

export type PowerUpType = keyof PowerUpInventory;

export interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  hasBoss: boolean;
  timePerQuestionSec: number;
  description: string;
}

export interface MissedQuestionReview {
  question: ExamQuestion;
  selectedChoiceIndex?: number;
  selectedChoiceText?: string;
  correctChoiceText: string;
  solution?: string;
  timestamp: number;
}

export interface DefenseRunStats {
  towerId: string;
  towerTitle: string;
  subject: string;
  score: number;
  waveReached: number;
  wavesCleared: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPct: number;
  maxCombo: number;
  defenseXp: number;
  defenseRank: DefenseRank;
  dateIso: string;
  missedQuestions: MissedQuestionReview[];
}

export type DefenseRank = 
  | "Novice Scholar"
  | "Apprentice Sentinel"
  | "Citadel Warden"
  | "Arch-Guardian"
  | "Paragon of Wisdom";

export interface TowerTrack {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  badge: string;
  accentColor: string; // Tailwind color class
  packageId?: string;
  isLocked: boolean;
  lockReason?: string;
  questionCount: number;
  questions: ExamQuestion[];
  personalBestScore?: number;
  personalBestWave?: number;
}
