/**
 * Central gameplay configuration and balance constants for Tower Climb
 */

import { ZoneTheme, FloorState } from "./types";

// Standard Floor Constants
export const STANDARD_FLOOR_QUESTIONS = 8;
export const STANDARD_FLOOR_HEARTS = 3;
export const STANDARD_QUESTION_TIME_SEC = 20;

// Boss Floor Constants (Every 5th floor)
export const BOSS_FLOOR_INTERVAL = 5;
export const BOSS_FLOOR_QUESTIONS = 12;
export const BOSS_FLOOR_HEARTS = 4;
export const BOSS_QUESTION_TIME_SEC = 22;

// Streaks & Combos
export const COMBO_MULTIPLIERS = [
  { streak: 5, multiplier: 3, label: "Ascension Focus (x3)" },
  { streak: 3, multiplier: 2, label: "Wise Flow (x2)" },
  { streak: 0, multiplier: 1, label: "" },
];

export function getClimbComboMultiplier(streak: number): number {
  for (const c of COMBO_MULTIPLIERS) {
    if (streak >= c.streak) return c.multiplier;
  }
  return 1;
}

// Power-up earning threshold (1 tactical power-up granted every 5-streak)
export const POWERUP_STREAK_REWARD_INTERVAL = 5;
export const FREEZE_DURATION_SEC = 10;

// Star Criteria
export function calculateStars(wrongCount: number, failed: boolean): number {
  if (failed) return 0;
  if (wrongCount === 0) return 3;
  if (wrongCount <= 2) return 2;
  return 1;
}

// Base XP calculations
export const BASE_QUESTION_XP = 20;
export const STAR_BONUS_XP = {
  1: 50,
  2: 100,
  3: 200,
};

// Resilience & Paywall Flag
// When false: all floors with cached or available content can be climbed freely
// When true: floors beyond FREE_FLOORS_PER_TOWER require package ownership
export const ENFORCE_PAYWALL = false;
export const FREE_FLOORS_PER_TOWER = 3;

export function getZoneForFloor(floorNum: number): ZoneTheme {
  if (floorNum <= 10) return "stone-foundation";
  if (floorNum <= 20) return "library-hall";
  if (floorNum <= 30) return "clockwork-gallery";
  if (floorNum <= 40) return "observatory";
  return "sky-crown";
}

export const ZONE_DETAILS: Record<
  ZoneTheme,
  {
    name: string;
    description: string;
    range: string;
    bgGradient: string;
    accentHex: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  "stone-foundation": {
    name: "Stone Foundation",
    description: "Rugged ancient granite chambers carved with fundamental axioms.",
    range: "Floors 1–10",
    bgGradient: "from-slate-950 via-[#0e1626] to-slate-950",
    accentHex: "#38bdf8",
    borderClass: "border-slate-700/60",
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
  },
  "library-hall": {
    name: "Library Hall",
    description: "Towering bookshelves and whispered illuminated manuscripts.",
    range: "Floors 11–20",
    bgGradient: "from-[#110e1c] via-[#1a142e] to-[#0d0a17]",
    accentHex: "#a78bfa",
    borderClass: "border-purple-500/30",
    badgeClass: "bg-purple-950/60 text-purple-300 border-purple-500/40",
  },
  "clockwork-gallery": {
    name: "Clockwork Gallery",
    description: "Intricate spinning bronze gears ticking with rhythmic precision.",
    range: "Floors 21–30",
    bgGradient: "from-[#1a1309] via-[#241a0d] to-[#120c06]",
    accentHex: "#f59e0b",
    borderClass: "border-amber-500/30",
    badgeClass: "bg-amber-950/60 text-amber-300 border-amber-500/40",
  },
  "observatory": {
    name: "Observatory",
    description: "Midnight skylight dome tracking stellar trajectories and constants.",
    range: "Floors 31–40",
    bgGradient: "from-[#081524] via-[#0b2138] to-[#06101c]",
    accentHex: "#38bdf8",
    borderClass: "border-cyan-500/30",
    badgeClass: "bg-cyan-950/60 text-cyan-300 border-cyan-500/40",
  },
  "sky-crown": {
    name: "Sky Crown",
    description: "The ethereal pinnacle surrounded by auroras of ultimate mastery.",
    range: "Floors 41+",
    bgGradient: "from-[#1a0f2b] via-[#2c1445] to-[#11091e]",
    accentHex: "#f43f5e",
    borderClass: "border-rose-500/30",
    badgeClass: "bg-rose-950/60 text-rose-300 border-rose-500/40",
  },
};

/**
 * Universal Floor Gating check
 * Single source of truth for unlock status.
 * Never destroys or hides floors; sets state to "locked" visually.
 */
export function isFloorUnlocked(opts: {
  floorNumber: number;
  highestClearedFloor: number;
  isPackageOwned: boolean;
  hasCachedQuestions: boolean;
}): FloorState {
  const { floorNumber, highestClearedFloor, isPackageOwned, hasCachedQuestions } = opts;

  // If questions are missing and offline
  if (!hasCachedQuestions) {
    return "needs-download";
  }

  // Sequential progression: floor 1 is playable; later floors require floor-1 to be cleared
  const isPrerequisiteMet = floorNumber === 1 || floorNumber <= highestClearedFloor + 1;
  const isCleared = floorNumber <= highestClearedFloor;

  if (isCleared) {
    return "cleared";
  }

  if (!isPrerequisiteMet) {
    return "locked";
  }

  // If paywall is enforced
  if (ENFORCE_PAYWALL) {
    const isFreeFloor = floorNumber <= FREE_FLOORS_PER_TOWER;
    if (!isFreeFloor && !isPackageOwned) {
      return "locked";
    }
  }

  return "playable";
}
