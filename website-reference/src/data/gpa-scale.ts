/**
 * University-style grade scale (percent → letter → fixed number points).
 * Intervals match the official table provided for Wisdom Tower Freshman.
 */

export type GradeBand = {
  /** Inclusive lower bound on percent */
  minInclusive: number;
  /** Exclusive upper bound, except top band includes 100 */
  maxExclusive: number;
  includeMax: boolean;
  letter: string;
  points: number;
  status: string;
};

export const GRADE_BANDS: GradeBand[] = [
  { minInclusive: 90, maxExclusive: 100, includeMax: true, letter: "A+", points: 4.0, status: "Excellent" },
  { minInclusive: 85, maxExclusive: 90, includeMax: false, letter: "A", points: 4.0, status: "Excellent" },
  { minInclusive: 80, maxExclusive: 85, includeMax: false, letter: "A-", points: 3.75, status: "Excellent" },
  { minInclusive: 75, maxExclusive: 80, includeMax: false, letter: "B+", points: 3.5, status: "Very Good" },
  { minInclusive: 70, maxExclusive: 75, includeMax: false, letter: "B", points: 3.0, status: "Very Good" },
  { minInclusive: 65, maxExclusive: 70, includeMax: false, letter: "B-", points: 2.75, status: "Good" },
  { minInclusive: 60, maxExclusive: 65, includeMax: false, letter: "C+", points: 2.5, status: "Good" },
  { minInclusive: 50, maxExclusive: 60, includeMax: false, letter: "C", points: 2.0, status: "Satisfactory" },
  { minInclusive: 45, maxExclusive: 50, includeMax: false, letter: "C-", points: 1.75, status: "Unsatisfactory" },
  { minInclusive: 40, maxExclusive: 45, includeMax: false, letter: "D", points: 1.0, status: "Very Poor" },
  { minInclusive: 30, maxExclusive: 40, includeMax: false, letter: "Fx", points: 0, status: "Fail (Re-exam)" },
  { minInclusive: 0, maxExclusive: 30, includeMax: false, letter: "F", points: 0, status: "Fail (Repeat course)" },
];

export const LETTER_OPTIONS = GRADE_BANDS.map((b) => b.letter);

/** Distinct fixed-point values for dropdown (highest letter wins for same points) */
export const POINT_OPTIONS = [4.0, 3.75, 3.5, 3.0, 2.75, 2.5, 2.0, 1.75, 1.0, 0];

export function bandFromPercent(percent: number): GradeBand {
  const p = Math.min(100, Math.max(0, percent));
  for (const b of GRADE_BANDS) {
    if (b.includeMax) {
      if (p >= b.minInclusive && p <= b.maxExclusive) return b;
    } else if (p >= b.minInclusive && p < b.maxExclusive) {
      return b;
    }
  }
  return GRADE_BANDS[GRADE_BANDS.length - 1];
}

export function bandFromLetter(letter: string): GradeBand | undefined {
  return GRADE_BANDS.find((b) => b.letter.toLowerCase() === letter.trim().toLowerCase());
}

/** Prefer the highest band that carries this point value */
export function bandFromPoints(points: number): GradeBand {
  const match = GRADE_BANDS.find((b) => Math.abs(b.points - points) < 0.001);
  return match ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}

export function intervalLabel(b: GradeBand): string {
  if (b.includeMax) return `[${b.minInclusive}, ${b.maxExclusive}]`;
  return `[${b.minInclusive}, ${b.maxExclusive})`;
}
