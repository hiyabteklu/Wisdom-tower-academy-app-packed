/**
 * Notifications v2 helpers (plan: docs/NOTIFICATIONS_V2_PLAN.md in the app repo
 * hiyabteklu/Wisdom-tower-academy-app-packed, slice R2).
 *
 * Rich content is stored as structured blocks in `notifications.metadata.content`; no markdown is
 * parsed anywhere. Shape (v1):
 *   { v: 1, blocks: [
 *     { t: "title", text }, { t: "subtitle", text },
 *     { t: "p", runs: [{ text, b?, hl? }] }, { t: "callout", runs: [...] },
 *     { t: "list", items: [[runs], ...] }, { t: "divider" } ] }
 * The Android app reads exactly this shape (NotificationRepository.parseContent).
 */

export const NOTIFICATION_CATEGORIES = ["admin", "material", "contest"] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export function isNotificationCategory(value: unknown): value is NotificationCategory {
  return typeof value === "string" && (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);
}

export type ContentRun = { text: string; b?: boolean; hl?: boolean };
export type ContentBlock =
  | { t: "title"; text: string }
  | { t: "subtitle"; text: string }
  | { t: "p"; runs: ContentRun[] }
  | { t: "callout"; runs: ContentRun[] }
  | { t: "list"; items: ContentRun[][] }
  | { t: "divider" };
export type NotificationContent = { v: 1; blocks: ContentBlock[] };

export type ContentResult =
  | { ok: true; content: NotificationContent }
  | { ok: false; error: string };

const MAX_BLOCKS = 60;
const MAX_RUNS = 60;
const MAX_ITEMS = 30;
const MAX_TEXT = 2000;
const MAX_JSON = 20000;

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\r\n/g, "\n").trim();
  if (!text || text.length > MAX_TEXT) return null;
  return text;
}

/** Runs keep their spaces (" word" is valid), only the flags are normalised. */
function cleanRuns(value: unknown): ContentRun[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_RUNS) return null;
  const out: ContentRun[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const rec = item as Record<string, unknown>;
    if (typeof rec.text !== "string" || rec.text.length === 0 || rec.text.length > MAX_TEXT) return null;
    const run: ContentRun = { text: rec.text };
    if (rec.b === true) run.b = true;
    if (rec.hl === true) run.hl = true;
    out.push(run);
  }
  return out;
}

export function sanitizeContent(input: unknown): ContentResult {
  const bad = (error: string): ContentResult => ({ ok: false, error });
  if (!input || typeof input !== "object") return bad("Content must be an object.");
  const raw = input as Record<string, unknown>;
  if (raw.v !== 1 || !Array.isArray(raw.blocks)) {
    return bad("Content must look like { v: 1, blocks: [...] }.");
  }
  if (raw.blocks.length === 0 || raw.blocks.length > MAX_BLOCKS) {
    return bad(`Content needs between 1 and ${MAX_BLOCKS} blocks.`);
  }

  const blocks: ContentBlock[] = [];
  for (const entry of raw.blocks) {
    if (!entry || typeof entry !== "object") return bad("A content block is not valid.");
    const rec = entry as Record<string, unknown>;
    switch (rec.t) {
      case "title": {
        const text = cleanText(rec.text);
        if (!text) return bad("A title block has no text (or the text is too long).");
        blocks.push({ t: "title", text });
        break;
      }
      case "subtitle": {
        const text = cleanText(rec.text);
        if (!text) return bad("A subtitle block has no text (or the text is too long).");
        blocks.push({ t: "subtitle", text });
        break;
      }
      case "p": {
        const runs = cleanRuns(rec.runs);
        if (!runs) return bad("A paragraph block has no valid text.");
        blocks.push({ t: "p", runs });
        break;
      }
      case "callout": {
        const runs = cleanRuns(rec.runs);
        if (!runs) return bad("A callout block has no valid text.");
        blocks.push({ t: "callout", runs });
        break;
      }
      case "list": {
        if (!Array.isArray(rec.items) || rec.items.length === 0 || rec.items.length > MAX_ITEMS) {
          return bad("A list block needs between 1 and 30 items.");
        }
        const items: ContentRun[][] = [];
        for (const item of rec.items) {
          const runs = cleanRuns(item);
          if (!runs) return bad("A list item has no valid text.");
          items.push(runs);
        }
        blocks.push({ t: "list", items });
        break;
      }
      case "divider":
        blocks.push({ t: "divider" });
        break;
      default:
        return bad("Unknown content block type.");
    }
  }

  const content: NotificationContent = { v: 1, blocks };
  if (JSON.stringify(content).length > MAX_JSON) return bad("The content is too long.");
  return { ok: true, content };
}

function runsText(runs: ContentRun[]): string {
  return runs.map((r) => r.text).join("");
}

/** Short plain preview (lock screen, push, old app versions). Skips title blocks: the title is shown on its own. */
export function previewFromContent(content: NotificationContent, max = 160): string {
  const parts: string[] = [];
  for (const block of content.blocks) {
    if (block.t === "subtitle") parts.push(block.text);
    else if (block.t === "p" || block.t === "callout") parts.push(runsText(block.runs));
    else if (block.t === "list") for (const item of block.items) parts.push(runsText(item));
  }
  const flat = parts.join(" ").replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : flat.slice(0, max - 1).trimEnd() + "…";
}
