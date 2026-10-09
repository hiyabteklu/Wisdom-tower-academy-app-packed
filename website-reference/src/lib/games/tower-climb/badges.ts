/**
 * Tower Climb Achievement Badges
 */

import { BadgeDefinition } from "./types";

export const CLIMB_BADGES: BadgeDefinition[] = [
  {
    id: "first-climb",
    title: "First Step",
    description: "Ascend and secure your very first tower floor.",
    iconName: "Footprints",
    category: "progression",
  },
  {
    id: "perfect-floor",
    title: "Scholar's Lantern",
    description: "Attain a flawless 3-star victory with zero hearts lost.",
    iconName: "Sparkles",
    category: "mastery",
  },
  {
    id: "boss-slain",
    title: "Boss Vanquisher",
    description: "Survive the 12-question cumulative test on a Boss Floor.",
    iconName: "ShieldAlert",
    category: "mastery",
  },
  {
    id: "zone-cleared",
    title: "Zone Architect",
    description: "Ascend past an entire 10-floor zone threshold.",
    iconName: "Compass",
    category: "progression",
  },
  {
    id: "comeback-scholar",
    title: "Tenacious Mind",
    description: "Retake and conquer a floor after previously exhausting all hearts.",
    iconName: "RotateCcw",
    category: "remediation",
  },
  {
    id: "seven-day-streak",
    title: "Lantern Keeper",
    description: "Maintain a 7-day streak on the Daily Climb.",
    iconName: "Flame",
    category: "streak",
  },
  {
    id: "attic-cleared",
    title: "Attic Scholar",
    description: "Re-solve and master 5 missed questions from the Review Attic.",
    iconName: "CheckCircle2",
    category: "remediation",
  },
];
