"use client";

import React, { useMemo } from "react";
import MathText from "@/components/MathText";
import SafeScrollBox from "@/components/learning/SafeScrollBox";

/**
 * Advanced study-content renderer.
 *
 *  # / ## / ###  topics & subtopics
 *  > callouts
 *  - / * lists
 *  **bold**, *italic*, `code`
 *  ==highlight== or [[key term]] (unpaired == stripped)
 *  Markdown tables (only outside math)
 *  LaTeX via MathText ($...$, $$...$$, \(...\), \[...\])
 *
 * Critical: math spans are masked with placeholders before any table / markdown
 * pipe logic runs, so absolute-value bars |x-3| never become table cells.
 */

export type TocItem = { id: string; level: number; text: string };

type Props = {
  body: string;
  className?: string;
  onToc?: (items: TocItem[]) => void;
  inline?: boolean;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

/** Tokens must not contain | * _ ` $ so no markdown rule can split them. */
const MATH_PLACEHOLDER = (i: number) => `@@WTMATH${i}@@`;
const MATH_PLACEHOLDER_RE = /@@WTMATH(\d+)@@/g;

/**
 * Extract every math span, replace with placeholder, return map for restore.
 * Order: $$ $$ → \[ \] → $ $ → \( \)
 * Currency Protection: lone $ without a closing $ pair (like "costs $7.48") is preserved as plain text.
 */
function protectMath(text: string): { text: string; math: string[] } {
  const math: string[] = [];
  const pattern =
    /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|(?<!\\)\$(?!\s)([^$\n]+?)(?<!\s)\$|\\\(([\s\S]+?)\\\)/g;

  const out = text.replace(pattern, (full) => {
    const idx = math.length;
    math.push(full);
    return MATH_PLACEHOLDER(idx);
  });

  return { text: out, math };
}

function restoreMath(text: string, math: string[]): string {
  return text.replace(MATH_PLACEHOLDER_RE, (_, n) => {
    const i = Number(n);
    return math[i] != null ? math[i] : "";
  });
}

/** Remove stray == that are not closed pairs (prevents "correct.==" artifacts). */
function sanitizeHighlightMarkers(text: string): string {
  const parts: string[] = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("==", i);
    if (open === -1) {
      parts.push(text.slice(i));
      break;
    }
    parts.push(text.slice(i, open));
    const close = text.indexOf("==", open + 2);
    if (close === -1) {
      i = open + 2;
      continue;
    }
    const inner = text.slice(open + 2, close);
    if (inner.includes("\n") || !inner.trim()) {
      parts.push(text.slice(open, close + 2).replace(/==/g, ""));
      i = close + 2;
      continue;
    }
    parts.push(`==${inner}==`);
    i = close + 2;
  }
  return parts.join("");
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Protect math BEFORE == / ** / * so equals signs and $ inside $...$ cannot
  // split highlights or other inline syntax. Restore only into MathText leaves.
  const { text: protectedText, math } = protectMath(text || "");
  const cleaned = sanitizeHighlightMarkers(protectedText);

  const pattern =
    /\[\[([^\]]+)\]\]|==([^\n]+?)==|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  const leaf = (chunk: string, k: string) => {
    const restored = restoreMath(chunk, math);
    return <MathText key={k} text={restored} />;
  };

  while ((m = pattern.exec(cleaned)) !== null) {
    if (m.index > last) {
      nodes.push(leaf(cleaned.slice(last, m.index), `${keyPrefix}-t-${i++}`));
    }
    if (m[1] != null) {
      nodes.push(
        <mark key={`${keyPrefix}-k-${i++}`} className="key-term" title="Key term">
          {leaf(m[1], `${keyPrefix}-kmath-${i}`)}
        </mark>
      );
    } else if (m[2] != null) {
      nodes.push(
        <mark key={`${keyPrefix}-h-${i++}`} className="hl-term">
          {leaf(m[2], `${keyPrefix}-hmath-${i}`)}
        </mark>
      );
    } else if (m[3] != null) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-semibold text-white">
          {leaf(m[3], `${keyPrefix}-bmath-${i}`)}
        </strong>
      );
    } else if (m[4] != null) {
      nodes.push(
        <em key={`${keyPrefix}-i-${i++}`} className="text-cyan-100/90 italic">
          {leaf(m[4], `${keyPrefix}-imath-${i}`)}
        </em>
      );
    } else if (m[5] != null) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.85em] font-mono text-amber-100"
        >
          {restoreMath(m[5], math)}
        </code>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < cleaned.length) {
    nodes.push(leaf(cleaned.slice(last), `${keyPrefix}-t-${i++}`));
  }
  return nodes.length ? nodes : [leaf(cleaned, `${keyPrefix}-empty`)];
}

export default function RichContent({
  body,
  className = "",
  onToc,
  inline = false,
}: Props) {
  const { blocks, toc } = useMemo(() => parseBlocks(body || ""), [body]);

  useMemo(() => {
    onToc?.(toc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toc]);

  if (inline) {
    return <span className={className}>{renderInline(body || "", "inl")}</span>;
  }

  return (
    <article className={`study-prose w-full max-w-none ${className}`}>
      {blocks.map((b, idx) => {
        if (b.type === "h1") {
          return (
            <h1 key={idx} id={b.id} className="study-h1">
              {renderInline(b.text, `h1-${idx}`)}
            </h1>
          );
        }
        if (b.type === "h2") {
          return (
            <h2 key={idx} id={b.id} className="study-h2">
              <span className="study-h2-bar" aria-hidden />
              {renderInline(b.text, `h2-${idx}`)}
            </h2>
          );
        }
        if (b.type === "h3") {
          return (
            <h3 key={idx} id={b.id} className="study-h3">
              {renderInline(b.text, `h3-${idx}`)}
            </h3>
          );
        }
        if (b.type === "callout") {
          return (
            <aside key={idx} className="study-callout">
              {renderInline(b.text, `co-${idx}`)}
            </aside>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={idx} className="study-list">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it, `li-${idx}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "table") {
          return (
            <SafeScrollBox key={idx} type="table" className="my-3">
              <div className="study-table-wrap">
                <table className="study-table">
                  <thead>
                    <tr>
                      {b.headers.map((h, j) => (
                        <th key={j}>{renderInline(h, `th-${idx}-${j}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c}>{renderInline(cell, `td-${idx}-${r}-${c}`)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SafeScrollBox>
          );
        }
        if (b.type === "code") {
          return (
            <div key={idx} className="my-3 overflow-x-auto">
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-100 overflow-x-auto leading-relaxed">
                <code>{b.code}</code>
              </pre>
            </div>
          );
        }
        if (b.type === "hr") {
          return <hr key={idx} className="study-hr" />;
        }
        return (
          <p key={idx} className="study-p">
            {renderInline(b.text, `p-${idx}`)}
          </p>
        );
      })}
    </article>
  );
}

type Block =
  | { type: "h1" | "h2" | "h3"; text: string; id: string }
  | { type: "p" | "callout"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; code: string; lang?: string }
  | { type: "hr" };

function splitTableRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function isSeparatorRow(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c) || c === "");
}

function looksLikeTableHeader(line: string): boolean {
  if (!line.includes("|")) return false;
  const cells = splitTableRow(line);
  return cells.length >= 2;
}

function parseBlocks(raw: string): { blocks: Block[]; toc: TocItem[] } {
  // 1) Mask all math so | inside $...$ never becomes table cells
  const { text: protectedRaw, math } = protectMath(raw);
  const lines = protectedRaw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const toc: TocItem[] = [];
  let i = 0;
  let para: string[] = [];

  const restore = (s: string) => restoreMath(s, math);

  const flushPara = () => {
    const t = para.join(" ").trim();
    if (t) blocks.push({ type: "p", text: restore(t) });
    para = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushPara();
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushPara();
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Code block fences (```)
    if (trimmed.startsWith("```")) {
      flushPara();
      const lang = trimmed.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: "code", code: restore(codeLines.join("\n")), lang });
      continue;
    }

    // Markdown table — only after math is masked; requires real separator row
    if (
      looksLikeTableHeader(trimmed) &&
      i + 1 < lines.length &&
      isSeparatorRow(lines[i + 1].trim())
    ) {
      flushPara();
      const headers = splitTableRow(trimmed).map(restore);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes("|")) {
        rows.push(splitTableRow(lines[i].trim()).map(restore));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const h1 = trimmed.match(/^#\s+(.+)/);
    const h2 = trimmed.match(/^##\s+(.+)/);
    const h3 = trimmed.match(/^###\s+(.+)/);
    if (h1 || h2 || h3) {
      flushPara();
      const text = restore((h1?.[1] || h2?.[1] || h3?.[1] || "").trim());
      const level = h1 ? 1 : h2 ? 2 : 3;
      const id = slugify(text) || `sec-${toc.length}`;
      const type = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      blocks.push({ type, text, id });
      toc.push({ id, level, text });
      i++;
      continue;
    }

    if (trimmed.startsWith("> ") || trimmed === ">") {
      flushPara();
      const parts: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith(">") || lines[i].trim() === ">")) {
        parts.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "callout", text: restore(parts.join(" ").trim()) });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(restore(lines[i].trim().replace(/^[-*]\s+/, "")));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    para.push(trimmed);
    i++;
  }
  flushPara();
  return { blocks, toc };
}
