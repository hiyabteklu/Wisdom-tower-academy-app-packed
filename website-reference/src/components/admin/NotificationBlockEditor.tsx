"use client";

/**
 * Notifications v2, slice R3-b1 (session R3-B). `[~]` NOT compiled, not opened in a browser.
 *
 * `NotificationBlockEditor`: the admin writes a notice as blocks (title, subtitle, paragraph, callout,
 * bullets, divider) with Bold and Highlight buttons, and `NotificationPreview` shows it in the gold look
 * the Android reading view uses (colours copied from NotificationReaderScreen.kt: gold #FCD34D, subtitle
 * 75% gold, body #E2E8F0, highlight = 90% gold background with dark text, callout = glass card with a
 * gold left bar, divider = thin gold gradient). The two glass colours and the dark text colour are close
 * approximations (the app uses theme tokens), so the preview is a guide, not a pixel match.
 *
 * Not used by any screen yet: the composer (R3-b2) will import it.
 */

import { useRef, type CSSProperties } from "react";
import {
  editorToBlocks,
  newEditorBlock,
  type EditorBlock,
  type EditorBlockType,
} from "@/lib/notification-authoring";
import type { ContentBlock, ContentRun } from "@/lib/notification-v2";

const GOLD = "#FCD34D";
const GOLD_SOFT = "rgba(252, 211, 77, 0.75)";
const BODY = "#E2E8F0";
const DARK_ON_GOLD = "#0B1220";

const ADD_BUTTONS: { t: EditorBlockType; label: string }[] = [
  { t: "title", label: "Title" },
  { t: "subtitle", label: "Subtitle" },
  { t: "p", label: "Paragraph" },
  { t: "callout", label: "Callout" },
  { t: "list", label: "Bullets" },
  { t: "divider", label: "Divider" },
];

const BLOCK_LABEL: Record<EditorBlockType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  p: "Paragraph",
  callout: "Callout",
  list: "Bullets (one per line)",
  divider: "Divider",
};

export function NotificationBlockEditor({
  value,
  onChange,
}: {
  value: EditorBlock[];
  onChange: (next: EditorBlock[]) => void;
}) {
  const activeEl = useRef<HTMLTextAreaElement | null>(null);
  const activeId = useRef<string | null>(null);

  const update = (id: string, text: string) =>
    onChange(value.map((b) => (b.id === id ? { ...b, text } : b)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = value.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const remove = (id: string) => onChange(value.filter((b) => b.id !== id));

  const wrap = (marker: string) => {
    const el = activeEl.current;
    const id = activeId.current;
    if (!el || !id) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return;
    const text = el.value;
    update(id, text.slice(0, start) + marker + text.slice(start, end) + marker + text.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, end + marker.length * 2);
    });
  };

  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Add:</span>
        {ADD_BUTTONS.map((b) => (
          <button
            key={b.t}
            type="button"
            onClick={() => onChange([...value, newEditorBlock(b.t)])}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10"
          >
            + {b.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Select text in a box, then:</span>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => wrap("**")}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/10"
        >
          Bold
        </button>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => wrap("==")}
          className="rounded-md px-3 py-1 text-xs font-bold hover:opacity-90"
          style={{ background: GOLD, color: DARK_ON_GOLD }}
        >
          Highlight
        </button>
        <span className="text-xs text-slate-500">
          (or type **bold** and ==highlight== yourself)
        </span>
      </div>

      {value.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-slate-400">
          Nothing yet. Add a Title, then a Paragraph.
        </p>
      )}

      {value.map((block, index) => (
        <div key={block.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: GOLD_SOFT }}>
              {BLOCK_LABEL[block.t]}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="rounded px-2 py-0.5 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label="Move down"
                className="rounded px-2 py-0.5 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(block.id)}
                aria-label="Delete block"
                className="rounded px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>

          {block.t === "divider" ? (
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              }}
            />
          ) : (
            <textarea
              value={block.text}
              rows={block.t === "title" || block.t === "subtitle" ? 1 : 3}
              onFocus={(e) => {
                activeEl.current = e.currentTarget;
                activeId.current = block.id;
              }}
              onChange={(e) => update(block.id, e.target.value)}
              className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-300/60"
              placeholder={
                block.t === "list" ? "One bullet per line" : "Write here"
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Runs({ runs }: { runs: ContentRun[] }) {
  return (
    <>
      {runs.map((run, i) => {
        const style: CSSProperties = {};
        if (run.hl) {
          style.background = "rgba(252, 211, 77, 0.9)";
          style.color = DARK_ON_GOLD;
          style.fontWeight = run.b ? 800 : 600;
          style.borderRadius = 3;
          style.padding = "0 2px";
        } else if (run.b) {
          style.color = "#FFFFFF";
          style.fontWeight = 800;
        }
        return (
          <span key={i} style={style}>
            {run.text}
          </span>
        );
      })}
    </>
  );
}

function BlockPreview({ block }: { block: ContentBlock }) {
  switch (block.t) {
    case "title":
      return (
        <h3 style={{ color: GOLD, fontSize: 22, lineHeight: 1.25, fontWeight: 800, margin: "10px 0 4px" }}>
          {block.text}
        </h3>
      );
    case "subtitle":
      return (
        <p style={{ color: GOLD_SOFT, fontSize: 15, lineHeight: 1.4, fontWeight: 600, margin: "4px 0 8px" }}>
          {block.text}
        </p>
      );
    case "p":
      return (
        <p style={{ color: BODY, fontSize: 14, lineHeight: 1.6, margin: "6px 0", whiteSpace: "pre-wrap" }}>
          <Runs runs={block.runs} />
        </p>
      );
    case "callout":
      return (
        <div
          style={{
            display: "flex",
            margin: "8px 0",
            borderRadius: 14,
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ width: 4, background: GOLD, flexShrink: 0 }} />
          <p style={{ color: BODY, fontSize: 13, lineHeight: 1.55, margin: 0, padding: 14, whiteSpace: "pre-wrap" }}>
            <Runs runs={block.runs} />
          </p>
        </div>
      );
    case "list":
      return (
        <ul style={{ listStyle: "none", margin: "6px 0", padding: 0 }}>
          {block.items.map((runs, i) => (
            <li key={i} style={{ display: "flex", gap: 10, color: BODY, fontSize: 14, lineHeight: 1.55, padding: "3px 0" }}>
              <span style={{ color: GOLD, fontWeight: 700 }}>•</span>
              <span style={{ flex: 1 }}>
                <Runs runs={runs} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "divider":
      return (
        <div
          style={{
            height: 1,
            margin: "14px 0",
            background: `linear-gradient(90deg, transparent, rgba(252,211,77,0.8), transparent)`,
          }}
        />
      );
  }
}

/** The reading view as the student will see it (blocks as the admin typed them). */
export function NotificationPreview({ blocks }: { blocks: EditorBlock[] }) {
  const list = editorToBlocks(blocks);
  return (
    <div
      className="rounded-2xl border border-white/10 p-4"
      style={{ background: "#0B1220", maxWidth: 380 }}
    >
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">The preview appears as you type.</p>
      ) : (
        list.map((block, i) => <BlockPreview key={i} block={block} />)
      )}
    </div>
  );
}
