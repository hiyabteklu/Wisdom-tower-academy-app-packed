/**
 * Live vs uploading + purchase gates.
 * Grades 9–12 and Freshman unlock for any signed-in user via FREE_FOR_REGISTERED_PACKAGE_IDS.
 */

export const PURCHASABLE_PACKAGE_IDS = new Set([
  "grade-9",
  "grade-10",
  "grade-11",
  "grade-12",
  "freshman",
  "uat",
  "coc",
  "remedial",
  "ece-y3-sem-1",
  "ece-y3-sem-2",
]);

export const COMING_SOON_PACKAGE_IDS = new Set(["gat", "exit-exam"]);

export type HubLockMode = "open" | "require_purchase" | "coming_soon";

export function isSpecialPackagePath(pathnameOrBase: string): boolean {
  return pathnameOrBase.includes("/special-packages");
}

export function isPackagePurchasable(packageId: string): boolean {
  return PURCHASABLE_PACKAGE_IDS.has(packageId);
}

export function isFreshmanSubjectReady(_subjectId: string): boolean {
  return true;
}

export function unlockPackageIdsForPath(basePath: string): string[] {
  if (basePath.includes("/academy/freshman")) return ["freshman"];
  if (basePath.includes("/academy/grades/9")) return ["grade-9"];
  if (basePath.includes("/academy/grades/10")) return ["grade-10"];
  if (basePath.includes("/academy/grades/11")) return ["grade-11"];
  if (basePath.includes("/academy/grades/12")) return ["grade-12"];
  if (basePath.includes("/academy/uat")) return ["uat"];
  if (basePath.includes("/academy/coc")) return ["coc"];
  if (basePath.includes("/academy/remedial")) return ["remedial"];
  if (
    basePath.includes("/special-packages/electrical-computer-engineering") ||
    basePath.includes("/special-packages/ece")
  ) {
    return ["ece-y3-sem-1", "ece-y3-sem-2"];
  }
  return [];
}

export function getHubLockMode(basePath: string): HubLockMode {
  if (basePath.includes("/academy/gat") || basePath.includes("/academy/exit-exam")) {
    return "coming_soon";
  }
  // Grades 9–12: free for every registered user (ownership grants grade-* automatically)
  if (basePath.includes("/academy/grades/")) return "require_purchase";
  if (basePath.includes("/academy/freshman")) return "require_purchase";
  if (
    basePath.includes("/academy/uat") ||
    basePath.includes("/academy/coc") ||
    basePath.includes("/academy/remedial")
  ) {
    return "require_purchase";
  }
  if (basePath.includes("/special-packages") && (basePath.includes("/sem-1") || basePath.includes("/sem-2"))) {
    return "require_purchase";
  }
  if (isSpecialPackagePath(basePath)) return "require_purchase";
  return "coming_soon";
}

export function areHubsReady(basePath: string): boolean {
  return getHubLockMode(basePath) === "open";
}

export const COMING_SOON_TITLE = "Coming soon";
export const COMING_SOON_BODY =
  "Materials for this section are not available yet. Check back soon.";

export const PURCHASE_TITLE = "Package required";
export const PURCHASE_BODY_FRESHMAN =
  "Unlock this pathway with the matching package to access study materials.";
