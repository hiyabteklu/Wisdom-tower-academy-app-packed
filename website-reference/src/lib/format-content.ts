/** Normalize pasted admin text and lightly format for display. */

/** Turn literal \\n / \\t from JSON paste into real characters. */
export function unescapeText(input: string): string {
  if (!input) return "";
  let s = String(input);
  // Repeatedly flatten escaped sequences (paste sometimes double-escapes)
  for (let i = 0; i < 3; i++) {
    const next = s
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "")
      .replace(/\r\n/g, "\n");
    if (next === s) break;
    s = next;
  }
  return s;
}

/** Split multi-line field into clean list items. */
export function toLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v) => toLines(v)).map((s) => s.trim()).filter(Boolean);
  }
  if (value == null) return [];
  const raw = unescapeText(String(value));
  return raw
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function asStringList(value: unknown): string[] {
  return toLines(value);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Inline markdown inside already-escaped or plain text. */
function inlineMarkdown(s: string): string {
  let t = s;
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__(.+?)__/g, "<strong>$1</strong>");
  t = t.replace(/(?<![\w*])\*(.+?)\*(?![\w*])/g, "<em>$1</em>");
  t = t.replace(/==(.+?)==/g, '<mark class="md-mark">$1</mark>');
  t = t.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');
  return t;
}

/** Light markdown → HTML for CMS body/intro. Supports # ## ###, **bold**, *italic*, ==highlight==, lists, blockquotes. */
export function simpleMarkdownToHtml(src: string): string {
  let t = unescapeText(src).trim();
  if (!t) return "";

  const lines = t.split("\n");
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Headings
    const h3 = trimmed.match(/^###\s+(.+)$/);
    const h2 = trimmed.match(/^##\s+(.+)$/);
    const h1 = trimmed.match(/^#\s+(.+)$/);
    if (h3) {
      blocks.push(`<h3 class="md-h3">${inlineMarkdown(escapeHtml(h3[1]))}</h3>`);
      i++;
      continue;
    }
    if (h2) {
      blocks.push(`<h2 class="md-h2">${inlineMarkdown(escapeHtml(h2[1]))}</h2>`);
      i++;
      continue;
    }
    if (h1) {
      blocks.push(`<h2 class="md-h2">${inlineMarkdown(escapeHtml(h1[1]))}</h2>`);
      i++;
      continue;
    }

    // Blockquote (one or more consecutive > lines)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const inner = inlineMarkdown(escapeHtml(quoteLines.join(" ")));
      blocks.push(`<blockquote class="md-quote">${inner}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^[-•*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-•*]\s+/, ""));
        i++;
      }
      const lis = items
        .map((item) => `<li class="md-li">${inlineMarkdown(escapeHtml(item))}</li>`)
        .join("");
      blocks.push(`<ul class="md-ul">${lis}</ul>`);
      continue;
    }

    // Paragraph: collect until blank or special line
    const para: string[] = [];
    while (i < lines.length) {
      const L = lines[i];
      const T = L.trim();
      if (!T) break;
      if (/^#{1,3}\s+/.test(T) || T.startsWith(">") || /^[-•*]\s+/.test(T)) break;
      para.push(T);
      i++;
    }
    if (para.length) {
      blocks.push(
        `<p class="md-p">${inlineMarkdown(escapeHtml(para.join(" ")))}</p>`
      );
    }
  }

  return blocks.join("\n");
}
