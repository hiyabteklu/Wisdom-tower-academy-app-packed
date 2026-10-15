/**
 * Notifications v2, slice R3-a (path selector data). Written 2026-10-15, session R3-A. `[~]` NOT compiled.
 *
 * The admin composer's "where should the student land?" picker for the category "New material release".
 * It is built FROM `ADMIN_CONTENT_TREE` (src/data/admin-nav.ts), so it can never offer a subject or hub
 * that does not exist, and from `specialPackages` for the public ECE package slug.
 *
 * Public path shapes (read from src/app/academy on 2026-10-15; the Android app's `contentScopePath`
 * in StudyWorkspaceScreen.kt accepts exactly these, read the same day):
 *   grade     /academy/grades/{grade}/{subject}[/{hub}]
 *   freshman  /academy/freshman/{subject}[/{hub}]
 *   ECE       /academy/special-packages/{slug}/{sem-1|sem-2}/{course}[/{hub}]
 *   entrance  /academy/entrance-questions/{stream}/{subject}/{year}   (the year page IS the exams hub,
 *             so no hub is added below it)
 *
 * Nothing imports this file yet: the composer (R3-b) will. No secrets, no student data.
 */

import { ADMIN_CONTENT_TREE, type AdminNavNode } from "@/data/admin-nav";
import { specialPackages } from "@/data/special-packages";

export type NotificationPathNode = {
  id: string;
  label: string;
  /** Public website path this node opens. Missing on pure grouping nodes (for example "Grades 9–12"). */
  path?: string;
  children?: NotificationPathNode[];
};

/** One selectable destination with its breadcrumb, for the "this opens: ..." line. */
export type NotificationPathChoice = {
  path: string;
  crumbs: string[];
};

function eceSlug(semesterId: string, packageId?: string): string | null {
  const pkg = specialPackages.find((p) =>
    p.semesters.some((s) => s.id === semesterId && (!packageId || s.packageId === packageId))
  );
  return pkg ? pkg.slug : null;
}

/**
 * Course or subject page for a `learning_resources.scope_path`
 * (for example `grade/9/physics` -> `/academy/grades/9/physics`), or null for a scope this file does not know.
 */
export function publicPathForScope(scopePath: string, packageId?: string): string | null {
  const p = scopePath.split("/").filter(Boolean);
  if (p[0] === "grade" && p.length === 3) return `/academy/grades/${p[1]}/${p[2]}`;
  if (p[0] === "freshman" && p.length === 2) return `/academy/freshman/${p[1]}`;
  if (p[0] === "remedial" && p.length === 2) return `/academy/remedial/${p[1]}`;
  if (p[0] === "ece" && p.length === 3) {
    const slug = eceSlug(p[1], packageId);
    return slug ? `/academy/special-packages/${slug}/${p[1]}/${p[2]}` : null;
  }
  if (p[0] === "entrance" && p.length === 4) {
    return `/academy/entrance-questions/${p[1]}/${p[2]}/${p[3]}`;
  }
  return null;
}

function convert(
  node: AdminNavNode,
  parentScope: string | undefined,
  parentPath: string | undefined
): NotificationPathNode | null {
  let path: string | undefined;

  if (node.scopePath) {
    if (parentPath && node.scopePath === parentScope) {
      // A hub node sits under its course with the same scope path.
      // Entrance year pages ARE the exams hub: nothing is added below them.
      if (parentScope.startsWith("entrance/")) return null;
      path = `${parentPath}/${node.id}`;
    } else {
      path = publicPathForScope(node.scopePath, node.packageId) ?? undefined;
    }
  }

  const children = (node.children ?? [])
    .map((child) => convert(child, node.scopePath, path))
    .filter((child): child is NotificationPathNode => child !== null);

  if (!path && children.length === 0) return null;

  const result: NotificationPathNode = { id: node.id, label: node.label };
  if (path) result.path = path;
  if (children.length > 0) result.children = children;
  return result;
}

/** The cascading picker data: package group > subject / course > hub. */
export const NOTIFICATION_PATH_TREE: NotificationPathNode[] = ADMIN_CONTENT_TREE.map((node) =>
  convert(node, undefined, undefined)
).filter((node): node is NotificationPathNode => node !== null);

function walk(nodes: NotificationPathNode[], trail: string[], out: NotificationPathChoice[]) {
  for (const node of nodes) {
    const crumbs = [...trail, node.label];
    if (node.path) out.push({ path: node.path, crumbs });
    if (node.children) walk(node.children, crumbs, out);
  }
}

function flatten(): NotificationPathChoice[] {
  const out: NotificationPathChoice[] = [];
  walk(NOTIFICATION_PATH_TREE, [], out);
  return out;
}

/** Every destination the selector can produce, flat, each with its breadcrumb. */
export const NOTIFICATION_PATH_CHOICES: NotificationPathChoice[] = flatten();

export function findNotificationPath(path: string): NotificationPathChoice | undefined {
  return NOTIFICATION_PATH_CHOICES.find((choice) => choice.path === path);
}

/** True when `path` is one the selector can produce (use it to validate a material notice's url). */
export function isKnownNotificationPath(path: string): boolean {
  return findNotificationPath(path) !== undefined;
}
