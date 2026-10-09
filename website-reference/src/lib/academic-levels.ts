/**
 * Academic Level Options and Default My Learning Packages
 *
 * Configured according to Wisdom Tower Academy requirements:
 * - Grade 9 -> ["grade-9"]
 * - Grade 10 -> ["grade-10"]
 * - Grade 11 -> ["grade-11"]
 * - Grade 12 -> ["grade-12"]
 * - Remedial -> ["remedial"]
 * - Freshman -> ["freshman", "coc"]
 * - 3rd Year (ECE) -> ["ece"]
 * - Other -> [] (Keep empty until specified in Settings)
 */

export const ACADEMIC_LEVEL_OPTIONS = [
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Remedial",
  "Freshman",
  "3rd Year (ECE)",
  "Other",
] as const;

export type AcademicLevelOption = (typeof ACADEMIC_LEVEL_OPTIONS)[number];

export const STORAGE_ENROLLED_COURSES = "wt_enrolled_courses_v2";

export function getDefaultPackagesForAcademicLevel(
  level?: string | null
): string[] {
  if (!level) return ["freshman", "coc"];
  const trimmed = level.trim().toLowerCase();

  if (trimmed === "grade 9" || trimmed === "grade-9" || trimmed === "g9") {
    return ["grade-9"];
  }
  if (trimmed === "grade 10" || trimmed === "grade-10" || trimmed === "g10") {
    return ["grade-10"];
  }
  if (trimmed === "grade 11" || trimmed === "grade-11" || trimmed === "g11") {
    return ["grade-11"];
  }
  if (trimmed === "grade 12" || trimmed === "grade-12" || trimmed === "g12") {
    return ["grade-12"];
  }
  if (trimmed === "remedial" || trimmed.includes("remedial")) {
    return ["remedial"];
  }
  if (trimmed === "freshman" || trimmed.includes("freshman")) {
    return ["freshman", "coc"];
  }
  if (
    trimmed === "3rd year (ece)" ||
    trimmed === "3rd year ece" ||
    trimmed.includes("ece") ||
    trimmed.includes("electrical")
  ) {
    return ["ece"];
  }
  if (trimmed === "other" || trimmed.startsWith("other")) {
    return [];
  }

  // If user typed a custom level under "Other", check if it matches any pattern, else empty
  return [];
}

/**
 * Persists the default enrolled courses for a given academic level into localStorage.
 */
export function applyDefaultPackagesForLevel(level: string): string[] {
  const pkgs = getDefaultPackagesForAcademicLevel(level);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_ENROLLED_COURSES, JSON.stringify(pkgs));
      window.dispatchEvent(new Event("storage"));
    } catch {
      /* ignore */
    }
  }
  return pkgs;
}
