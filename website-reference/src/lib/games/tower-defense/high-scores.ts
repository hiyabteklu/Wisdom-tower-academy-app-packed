/**
 * LocalStorage persistence for Tower Defense high scores, personal records, and Defense XP.
 */

import { DefenseRunStats } from "./types";

const HIGH_SCORES_KEY = "wta_td_high_scores_v1";
const DEFENSE_XP_KEY = "wta_td_total_xp_v1";

export function saveDefenseRun(stats: DefenseRunStats): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    const existing: DefenseRunStats[] = raw ? JSON.parse(raw) : [];
    existing.unshift(stats);

    // Limit to latest 50 runs to preserve local storage limits
    const trimmed = existing.slice(0, 50);
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(trimmed));

    // Accumulate total defense XP
    const prevXp = getStoredTotalDefenseXp();
    localStorage.setItem(DEFENSE_XP_KEY, String(prevXp + stats.defenseXp));
  } catch (err) {
    console.warn("[TowerDefense] Could not persist run statistics:", err);
  }
}

export function getStoredHighScores(): DefenseRunStats[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getTowerPersonalBest(towerId: string): {
  bestScore: number;
  highestWave: number;
  bestAccuracy: number;
} {
  const all = getStoredHighScores();
  const towerRuns = all.filter((r) => r.towerId === towerId);

  if (towerRuns.length === 0) {
    return { bestScore: 0, highestWave: 0, bestAccuracy: 0 };
  }

  let bestScore = 0;
  let highestWave = 0;
  let bestAccuracy = 0;

  for (const run of towerRuns) {
    if (run.score > bestScore) bestScore = run.score;
    if (run.waveReached > highestWave) highestWave = run.waveReached;
    if (run.accuracyPct > bestAccuracy) bestAccuracy = run.accuracyPct;
  }

  return { bestScore, highestWave, bestAccuracy };
}

export function getStoredTotalDefenseXp(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(DEFENSE_XP_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}
