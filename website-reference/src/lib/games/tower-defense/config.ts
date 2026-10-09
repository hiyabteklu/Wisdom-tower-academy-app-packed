/**
 * Centralized gameplay configuration & balance constants
 * Tower Defense of Knowledge
 */

import { PowerUpInventory, WaveConfig, DefenseRank } from "./types";

export type GameDifficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_MAX_MISSES: Record<GameDifficulty, number> = {
  easy: 15,
  medium: 10,
  hard: 5,
};

export function getMaxMissesForDifficulty(difficulty: GameDifficulty): number {
  return DIFFICULTY_MAX_MISSES[difficulty] || 10;
}

export const STARTING_TOWER_HEALTH = 10;
export const MAX_TOWER_HEALTH = 15;

export const BASE_TIME_PER_QUESTION_SEC = 25;

export const INITIAL_POWER_UPS: PowerUpInventory = {
  freeze: 1,      // 1 free Chronos Stasis to start
  fiftyFifty: 2,  // 2 Logic Filters
  extraHeart: 0,  // Earned between waves
  skip: 1,        // 1 Tactical Deflection
};

export const CHRONOS_STASIS_DURATION_SEC = 12;

export const COMBO_THRESHOLDS = [
  { count: 8, multiplier: 4, label: "Quad Core Focus (x4)" },
  { count: 5, multiplier: 3, label: "High Mastery (x3)" },
  { count: 3, multiplier: 2, label: "Active Recall (x2)" },
  { count: 0, multiplier: 1, label: "" },
];

export function getComboMultiplier(currentStreak: number): number {
  for (const t of COMBO_THRESHOLDS) {
    if (currentStreak >= t.count) return t.multiplier;
  }
  return 1;
}

export const BASE_POINTS = {
  basic: 100,
  fast: 150,
  tank: 250,
  boss: 500,
};

export const WAVE_CONFIGURATIONS: WaveConfig[] = [
  { waveNumber: 1, enemyCount: 3, hasBoss: false, timePerQuestionSec: 25, description: "Wave 1: Vanguard Scouts: Standard Exam Drill" },
  { waveNumber: 2, enemyCount: 4, hasBoss: false, timePerQuestionSec: 24, description: "Wave 2: Accelerated Incursion: Rapid Problem Solving" },
  { waveNumber: 3, enemyCount: 5, hasBoss: true,  timePerQuestionSec: 22, description: "Wave 3: Midterm Siege: Armored Question Node Encounter" },
  { waveNumber: 4, enemyCount: 6, hasBoss: false, timePerQuestionSec: 20, description: "Wave 4: Cumulative Swarm: Advanced Analytical Proofs" },
  { waveNumber: 5, enemyCount: 7, hasBoss: true,  timePerQuestionSec: 18, description: "Wave 5: National Exam Inquisitor: Final Synthesis Boss" },
];

export function getWaveConfig(waveNum: number): WaveConfig {
  if (waveNum <= WAVE_CONFIGURATIONS.length) {
    return WAVE_CONFIGURATIONS[waveNum - 1];
  }
  // Endless procedural scaling beyond wave 5
  return {
    waveNumber: waveNum,
    enemyCount: Math.min(10, 6 + Math.floor(waveNum / 2)),
    hasBoss: waveNum % 2 === 1,
    timePerQuestionSec: Math.max(14, 18 - Math.floor((waveNum - 5) / 2)),
    description: `Wave ${waveNum}: Infinite Defense Threshold: Maximum Academic Pressure`,
  };
}

export function calculateDefenseRank(wavesCleared: number, accuracyPct: number): DefenseRank {
  if (wavesCleared >= 5 && accuracyPct >= 85) return "Paragon of Wisdom";
  if (wavesCleared >= 4 && accuracyPct >= 75) return "Arch-Guardian";
  if (wavesCleared >= 3) return "Citadel Warden";
  if (wavesCleared >= 1) return "Apprentice Sentinel";
  return "Novice Scholar";
}
