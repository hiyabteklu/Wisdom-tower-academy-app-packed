"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type Props = {
  text: string;
  className?: string;
  /** Block display for pure equation strings */
  display?: boolean;
};

/**
 * Clean outer math delimiters ($$, \[, $, \() only when safe (no internal delimiters).
 */
function cleanTexDelimiters(src: string): string {
  let s = src.trim();
  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) {
    const inner = s.slice(2, -2);
    if (!inner.includes("$$")) s = inner.trim();
  } else if (s.startsWith("\\[") && s.endsWith("\\]") && s.length >= 4) {
    const inner = s.slice(2, -2);
    if (!inner.includes("\\[")) s = inner.trim();
  } else if (s.startsWith("$") && s.endsWith("$") && s.length >= 2) {
    const inner = s.slice(1, -1);
    if (!inner.includes("$")) s = inner.trim();
  } else if (s.startsWith("\\(") && s.endsWith("\\)") && s.length >= 4) {
    const inner = s.slice(2, -2);
    if (!inner.includes("\\(")) s = inner.trim();
  }
  return s;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTex(src: string, displayMode: boolean): string {
  const clean = cleanTexDelimiters(src);
  try {
    return katex.renderToString(clean, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
      trust: false,
    });
  } catch {
    return `<code class="math-fallback">${escapeHtml(src)}</code>`;
  }
}

/**
 * Split text into plain / math segments and render each segment individually.
 * Supports multiple consecutive $$...$$ blocks without merging them.
 *
 * Math Delimiter & Currency Handling:
 * A paired $...$ (with no internal newlines or unescaped $) is treated as inline math,
 * even when the content starts with digits (e.g. $1$, $1.98\text{ mA}$, $25.3\,\Omega$, $870$).
 * Lone $ (e.g. "costs $7.48" or "price $100") without a closing $ delimiter is left as plain text.
 */
function renderMixedMath(input: string, forceDisplay: boolean): string {
  if (!input) return "";

  const trimmed = input.trim();

  // If entire string is forced display and contains no math delimiters at all, render directly
  if (
    forceDisplay &&
    !trimmed.includes("$") &&
    !trimmed.includes("\\(") &&
    !trimmed.includes("\\[")
  ) {
    return renderTex(trimmed, true);
  }

  const pattern =
    /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|(?<!\\)\$(?!\s)([^$\n]+?)(?<!\s)\$|\\\(([\s\S]+?)\\\)/g;

  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(input)) !== null) {
    if (m.index > last) {
      out += escapeHtml(input.slice(last, m.index)).replace(/\n/g, "<br/>");
    }

    if (m[1] != null) {
      out += renderTex(m[1].trim(), true);
    } else if (m[2] != null) {
      out += renderTex(m[2].trim(), true);
    } else if (m[3] != null) {
      out += renderTex(m[3].trim(), false);
    } else if (m[4] != null) {
      out += renderTex(m[4].trim(), false);
    }

    last = m.index + m[0].length;
  }

  if (last < input.length) {
    out += escapeHtml(input.slice(last)).replace(/\n/g, "<br/>");
  }

  return out || escapeHtml(input).replace(/\n/g, "<br/>");
}

export default function MathText({ text, className = "", display = false }: Props) {
  const html = useMemo(() => renderMixedMath(text || "", display), [text, display]);

  if (display) {
    return (
      <div
        className={`math-text math-text-display ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`math-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
