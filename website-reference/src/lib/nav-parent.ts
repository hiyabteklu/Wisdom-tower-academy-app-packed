/**
 * Bulletproof structural navigation parent mapping.
 * Every step moves exactly one level up the application hierarchy.
 * NEVER full chronological history rewind.
 * Home ("/") is reached ONLY at the true root.
 */

export const ROOT = "/";

/**
 * Explicit immediate one-level parents for known hub and section roots.
 * No entry skips levels to / or top hub when a closer list parent exists.
 */
export const PARENT_OF: Record<string, string> = {
  // Top-level sections (parent is Home)
  "/academy": ROOT,
  "/account": ROOT,
  "/about": ROOT,
  "/contact": ROOT,
  "/privacy": ROOT,
  "/terms": ROOT,
  "/login": ROOT,
  "/signup": ROOT,

  // Learning root -> parent is top Academy hub
  "/learning": "/academy",

  // Packages & Commerce
  "/packages": "/learning",
  "/cart": "/packages",
  "/checkout": "/cart",

  // Admin & user account sub-sections -> parent is Account
  "/admin": "/account",
  "/settings": "/account",
  "/notifications": "/account",
  "/orders": "/account",

  // Academic track roots -> parent is Learning root (/learning), never / or /academy directly
  "/academy/grades": "/learning",
  "/academy/freshman": "/learning",
  "/academy/remedial": "/learning",
  "/academy/special-packages": "/learning",
  "/academy/special-packages/electrical-computer-engineering": "/learning",
  "/academy/uat": "/learning",
  "/academy/gat": "/learning",
  "/academy/coc": "/learning",
  "/academy/exit-exam": "/learning",

  // Academy guidance and resources
  "/academy/universities": "/academy",
  "/academy/departments": "/academy",
  "/academy/campus-life": "/academy",
  "/academy/study-techniques": "/academy",
  "/academy/scholarships": "/academy",
  "/academy/success-stories": "/academy",
  "/academy/quiz-demo": "/academy",
  "/academy/faq": "/academy",
  "/academy/leaderboard": "/academy",
  "/academy/tower-climb": "/academy",

  // Games
  "/games/tower-climb": "/academy",
  "/games/tower-defense": "/academy/exit-exam",

  // Auth sub-flows
  "/forgot-password": "/login",
  "/reset-password": "/login",
  "/signin": "/login",
  "/register": "/signup",
};

export function normalizePath(pathname: string): string {
  if (!pathname) return ROOT;
  let p = pathname.split("?")[0].split("#")[0];
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || ROOT;
}

/**
 * Computes the structural parent path for any route in the application.
 * Hierarchy:
 * - Opened note / material / flashcard -> list of notes / flashcards for that subject
 * - Resource list -> subject page
 * - Subject page -> track page
 * - Track page -> learning root (/learning)
 * - Learning root -> top hub (/academy)
 * - Top hub -> Home (/)
 * - Nested admin page -> parent admin section -> /admin -> /account -> /
 */
export function structuralParent(pathname: string, explicitFallback?: string): string {
  if (!pathname) return ROOT;

  // Check if pathname has an active item query param (e.g. ?item=... or ?note=... or ?id=...)
  if (pathname.includes("?")) {
    const [base, query] = pathname.split("?");
    const params = new URLSearchParams(query);
    if (
      params.has("item") ||
      params.has("note") ||
      params.has("deck") ||
      params.has("id") ||
      params.has("tool")
    ) {
      // Opened note / material / flashcards / tool -> list or tools base level
      return normalizePath(base);
    }
  }

  const path = normalizePath(pathname);
  if (path === ROOT) return ROOT;

  // 1. Direct match in PARENT_OF table (takes priority over fallbacks that skip levels)
  if (PARENT_OF[path]) {
    return PARENT_OF[path];
  }

  // 2. If fallback provided and is a valid closer parent that doesn't skip levels:
  if (explicitFallback) {
    const normFallback = normalizePath(explicitFallback);
    if (normFallback !== path) {
      return normFallback;
    }
  }

  // 3. Admin subroutes: strip last segment, always ending at /admin, never skipping
  if (path === "/admin") {
    return "/account";
  }
  if (path.startsWith("/admin/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    const parent = "/" + parts.join("/");
    return parent || "/admin";
  }

  // 4. Learning subroutes: strip last segment, always ending at /learning, never skipping
  if (path === "/learning") {
    return "/academy";
  }
  if (path.startsWith("/learning/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    const parent = "/" + parts.join("/");
    return parent || "/learning";
  }

  // 5. Checkout subroutes (e.g. /checkout/[id], /checkout/multi) -> /cart
  if (path.startsWith("/checkout/")) {
    return "/cart";
  }

  // 6. Account subroutes: strip last segment, ending at /account
  if (path.startsWith("/settings/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? "/" + parts.join("/") : "/account";
  }
  if (path.startsWith("/notifications/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? "/" + parts.join("/") : "/account";
  }
  if (path.startsWith("/orders/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? "/" + parts.join("/") : "/account";
  }

  // 7. Generic deep path: strip last segment to go exactly one level up
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) {
    return ROOT;
  }

  parts.pop();
  const parent = "/" + parts.join("/");
  return parent;
}

export function parentLabel(parentPath: string): string {
  const labels: Record<string, string> = {
    "/": "Home",
    "/academy": "Academy",
    "/packages": "Packages",
    "/learning": "My Learning",
    "/account": "Account",
    "/admin": "Admin Hub",
    "/settings": "Settings",
    "/notifications": "Notifications",
    "/orders": "Orders",
    "/cart": "Cart",
    "/academy/grades": "Grades",
    "/academy/freshman": "Freshman",
    "/academy/uat": "UAT",
    "/academy/gat": "GAT",
    "/academy/coc": "COC",
    "/academy/exit-exam": "Exit Exam",
    "/academy/remedial": "Remedial",
    "/academy/special-packages": "Special Packages",
    "/academy/universities": "Universities",
    "/academy/departments": "Departments",
    "/academy/campus-life": "Campus Life",
    "/academy/study-techniques": "Study Techniques",
    "/academy/scholarships": "Scholarships",
    "/academy/success-stories": "Success Stories",
  };
  if (labels[parentPath]) return labels[parentPath];
  if (parentPath.startsWith("/academy/grades/")) return "Grade";
  if (parentPath.startsWith("/academy/freshman/")) return "Subject";
  if (parentPath.startsWith("/academy/remedial/")) return "Subject";
  if (parentPath.startsWith("/academy/special-packages/")) return "Course";
  if (parentPath.startsWith("/admin/")) return "Admin";
  if (parentPath.startsWith("/learning/")) return "Learning";
  return "Back";
}
