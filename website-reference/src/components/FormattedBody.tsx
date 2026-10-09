"use client";

import { simpleMarkdownToHtml } from "@/lib/format-content";
import "@/app/formatted-body.css";

type Props = {
  text: string;
  className?: string;
  /** When true, limit visible height (e.g. card preview). */
  clamped?: boolean;
};

/** Renders admin Markdown / plain text with headers, bold, lists, quotes, highlights. */
export default function FormattedBody({ text, className = "", clamped = false }: Props) {
  const html = simpleMarkdownToHtml(text);
  if (!html) return null;
  return (
    <div
      className={`formatted-body text-[15px] leading-relaxed text-wisdom-muted ${clamped ? "line-clamp-4" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
