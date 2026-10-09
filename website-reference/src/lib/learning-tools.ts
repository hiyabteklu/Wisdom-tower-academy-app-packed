export type FeatureKey =
  | "timer"
  | "planner"
  | "goals"
  | "notes"
  | "calculator"
  | "tutor"
  | "analytics"
  | "courses";

// ── Tool Deep-Link Param Normalizer ─────────────────────────────
export function normalizeToolParam(raw: string | null | undefined): FeatureKey | null {
  if (!raw) return null;
  const clean = raw.trim().toLowerCase().replace(/[-_ ]/g, "");
  switch (clean) {
    case "timer":
    case "pomodoro":
    case "focus":
    case "clock":
      return "timer";
    case "planner":
    case "studyplanner":
    case "schedule":
    case "plan":
    case "calendar":
      return "planner";
    case "goals":
    case "targets":
    case "target":
    case "goal":
      return "goals";
    case "notes":
    case "notebook":
    case "note":
    case "scholarnotes":
      return "notes";
    case "calc":
    case "calculator":
    case "scientific":
    case "scientificcalculator":
      return "calculator";
    case "tutor":
    case "aitutor":
    case "ai":
    case "chat":
    case "ask":
      return "tutor";
    case "status":
    case "analytics":
    case "stats":
    case "progress":
    case "yourstatus":
      return "analytics";
    case "courses":
    case "curriculum":
    case "syllabus":
    case "mycourses":
    case "course":
      return "courses";
    default:
      return null;
  }
}
