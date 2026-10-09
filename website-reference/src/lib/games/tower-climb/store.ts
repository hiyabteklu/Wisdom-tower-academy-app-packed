/**
 * Local-first persistence store for Tower Climb
 * Stores floor records, XP, badges, streaks, and Review Attic
 */

import { TowerClimbProfile, ReviewAtticItem, ChapterQuestion } from "./types";

const CLIMB_STORAGE_KEY = "wta_tc_profile_v1";

const DEFAULT_PROFILE: TowerClimbProfile = {
  totalXp: 0,
  level: 1,
  badges: [],
  streakDays: 0,
  reviewAttic: [],
  dailyClimb: {
    currentStreak: 0,
    bestStreak: 0,
    questions: [],
    isCompletedToday: false,
  },
  floorRecords: {},
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadClimbProfile(): TowerClimbProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(CLIMB_STORAGE_KEY);
    const parsed = safeParse<TowerClimbProfile>(raw, DEFAULT_PROFILE);

    // Check if daily climb completed today
    const todayStr = new Date().toISOString().split("T")[0];
    const lastCompletedStr = parsed.dailyClimb?.lastCompletedDateIso?.split("T")[0];
    const isCompletedToday = todayStr === lastCompletedStr;

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      dailyClimb: {
        ...DEFAULT_PROFILE.dailyClimb,
        ...(parsed.dailyClimb || {}),
        isCompletedToday,
      },
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveClimbProfile(profile: TowerClimbProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLIMB_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn("[TowerClimb] Could not persist profile to localStorage:", err);
  }
}

export function saveFloorCompletion(opts: {
  courseId: string;
  floorNumber: number;
  stars: number;
  score: number;
  xpEarned: number;
}): { newBadges: string[]; currentLevel: number } {
  const profile = loadClimbProfile();
  const key = `${opts.courseId}_f${opts.floorNumber}`;
  const existing = profile.floorRecords[key];

  const bestStars = Math.max(existing?.stars || 0, opts.stars);
  const bestScore = Math.max(existing?.bestScore || 0, opts.score);

  profile.floorRecords[key] = {
    stars: bestStars,
    bestScore,
    clearedAt: new Date().toISOString(),
  };

  profile.totalXp += opts.xpEarned;
  profile.level = 1 + Math.floor(profile.totalXp / 500);

  const newBadges: string[] = [];

  // Badge check: First climb
  if (!profile.badges.includes("first-climb")) {
    profile.badges.push("first-climb");
    newBadges.push("first-climb");
  }

  // Badge check: Perfect floor
  if (opts.stars === 3 && !profile.badges.includes("perfect-floor")) {
    profile.badges.push("perfect-floor");
    newBadges.push("perfect-floor");
  }

  // Badge check: Boss slain (every 5th floor)
  if (opts.floorNumber % 5 === 0 && !profile.badges.includes("boss-slain")) {
    profile.badges.push("boss-slain");
    newBadges.push("boss-slain");
  }

  // Badge check: Zone cleared (floor 10)
  if (opts.floorNumber >= 10 && !profile.badges.includes("zone-cleared")) {
    profile.badges.push("zone-cleared");
    newBadges.push("zone-cleared");
  }

  saveClimbProfile(profile);
  return { newBadges, currentLevel: profile.level };
}

export function addMissedQuestionToAttic(opts: {
  question: ChapterQuestion;
  selectedText?: string;
  correctText: string;
  solution?: string;
}): void {
  const profile = loadClimbProfile();
  const existingIdx = profile.reviewAttic.findIndex((item) => item.question.id === opts.question.id);

  if (existingIdx !== -1) {
    profile.reviewAttic[existingIdx].attemptsCount += 1;
    profile.reviewAttic[existingIdx].timestamp = Date.now();
    profile.reviewAttic[existingIdx].selectedText = opts.selectedText;
  } else {
    profile.reviewAttic.unshift({
      question: opts.question,
      selectedText: opts.selectedText,
      correctText: opts.correctText,
      solution: opts.solution,
      timestamp: Date.now(),
      attemptsCount: 1,
    });
  }

  // Limit attic to 60 items
  profile.reviewAttic = profile.reviewAttic.slice(0, 60);
  saveClimbProfile(profile);
}

export function removeQuestionFromAttic(questionId: string): void {
  const profile = loadClimbProfile();
  profile.reviewAttic = profile.reviewAttic.filter((item) => item.question.id !== questionId);
  saveClimbProfile(profile);
}

export function recordDailyClimbCompleted(): { currentStreak: number; newBadge?: string } {
  const profile = loadClimbProfile();
  const todayStr = new Date().toISOString().split("T")[0];
  const lastDate = profile.dailyClimb?.lastCompletedDateIso?.split("T")[0];

  let streak = profile.dailyClimb?.currentStreak || 0;
  if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDate === yesterdayStr) {
      streak += 1;
    } else if (lastDate === todayStr) {
      // already recorded today
    } else {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  const bestStreak = Math.max(profile.dailyClimb?.bestStreak || 0, streak);

  profile.dailyClimb = {
    ...profile.dailyClimb,
    lastCompletedDateIso: new Date().toISOString(),
    currentStreak: streak,
    bestStreak,
    isCompletedToday: true,
  };

  profile.streakDays = streak;
  profile.totalXp += 150; // Daily climb bonus
  profile.level = 1 + Math.floor(profile.totalXp / 500);

  let newBadge: string | undefined;
  if (streak >= 7 && !profile.badges.includes("seven-day-streak")) {
    profile.badges.push("seven-day-streak");
    newBadge = "seven-day-streak";
  }

  saveClimbProfile(profile);
  return { currentStreak: streak, newBadge };
}
