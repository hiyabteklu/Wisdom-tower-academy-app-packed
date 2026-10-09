/** Track which learning items a user has already opened (client-side). */

const STORAGE_KEY = "wt-seen-resources";

function readSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeSeen(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* quota / private mode */
  }
}

export function getSeenResourceIds(): Set<string> {
  return readSeen();
}

export function isResourceSeen(id: string): boolean {
  return readSeen().has(id);
}

/** Mark a resource as seen. Returns true if it was newly marked. */
export function markResourceSeen(id: string): boolean {
  const set = readSeen();
  if (set.has(id)) return false;
  set.add(id);
  writeSeen(set);
  return true;
}
