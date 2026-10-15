/**
 * Notifications v2, slice R3-b1 (session R3-B). `[~]` NOT compiled.
 *
 * The admin types text with two tiny authoring marks and the composer turns them into the structured
 * runs the app reads (see src/lib/notification-v2.ts). The marks are NOT stored and nothing in the
 * app parses them: only runs with `b` / `hl` flags are saved.
 *   **bold**   ==highlight==   (they can be nested: **==both==**)
 * A list block is one item per line.
 */

import type { ContentBlock, ContentRun, NotificationContent } from "@/lib/notification-v2";

export type EditorBlockType = "title" | "subtitle" | "p" | "callout" | "list" | "divider";

/** One block as the admin edits it: `text` holds the authoring marks (list: one item per line). */
export type EditorBlock = { id: string; t: EditorBlockType; text: string };

let blockCounter = 0;

export function newEditorBlock(t: EditorBlockType, text = ""): EditorBlock {
  blockCounter += 1;
  return { id: `b${Date.now().toString(36)}${blockCounter}`, t, text };
}

export function parseRuns(text: string): ContentRun[] {
  const out: ContentRun[] = [];

  const push = (piece: string, b: boolean, hl: boolean) => {
    if (!piece) return;
    const run: ContentRun = { text: piece };
    if (b) run.b = true;
    if (hl) run.hl = true;
    out.push(run);
  };

  const walk = (s: string, b: boolean, hl: boolean) => {
    const re = /\*\*([\s\S]+?)\*\*|==([\s\S]+?)==/g;
    let last = 0;
    let m: RegExpExecArray | null = re.exec(s);
    while (m !== null) {
      if (m.index > last) push(s.slice(last, m.index), b, hl);
      if (m[1] !== undefined) walk(m[1], true, hl);
      else walk(m[2], b, true);
      last = m.index + m[0].length;
      m = re.exec(s);
    }
    if (last < s.length) push(s.slice(last), b, hl);
  };

  walk(text, false, false);
  return out;
}

/** Back to authoring marks (used when an existing notice is opened for editing). */
export function runsToText(runs: ContentRun[]): string {
  return runs
    .map((r) => {
      let s = r.text;
      if (r.hl) s = `==${s}==`;
      if (r.b) s = `**${s}**`;
      return s;
    })
    .join("");
}

/** Editor blocks -> content blocks. Empty blocks are dropped (the server refuses empty ones). */
export function editorToBlocks(blocks: EditorBlock[]): ContentBlock[] {
  const out: ContentBlock[] = [];
  for (const block of blocks) {
    const text = block.text.replace(/\r\n/g, "\n");
    if (block.t === "divider") {
      out.push({ t: "divider" });
    } else if (block.t === "title") {
      const s = text.replace(/\s+/g, " ").trim();
      if (s) out.push({ t: "title", text: s });
    } else if (block.t === "subtitle") {
      const s = text.replace(/\s+/g, " ").trim();
      if (s) out.push({ t: "subtitle", text: s });
    } else if (block.t === "p") {
      const runs = parseRuns(text.trim());
      if (runs.length > 0) out.push({ t: "p", runs });
    } else if (block.t === "callout") {
      const runs = parseRuns(text.trim());
      if (runs.length > 0) out.push({ t: "callout", runs });
    } else {
      const items = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => parseRuns(line))
        .filter((runs) => runs.length > 0);
      if (items.length > 0) out.push({ t: "list", items });
    }
  }
  return out;
}

/** The value to send as `content`, or null when there is nothing to send. */
export function editorToContent(blocks: EditorBlock[]): NotificationContent | null {
  const list = editorToBlocks(blocks);
  const hasText = list.some((b) => b.t !== "divider");
  return hasText ? { v: 1, blocks: list } : null;
}

/** Existing content -> editor blocks (to edit a scheduled notice). */
export function contentToEditor(content: NotificationContent): EditorBlock[] {
  return content.blocks.map((block) => {
    if (block.t === "divider") return newEditorBlock("divider");
    if (block.t === "title" || block.t === "subtitle") return newEditorBlock(block.t, block.text);
    if (block.t === "list") return newEditorBlock("list", block.items.map(runsToText).join("\n"));
    return newEditorBlock(block.t, runsToText(block.runs));
  });
}
