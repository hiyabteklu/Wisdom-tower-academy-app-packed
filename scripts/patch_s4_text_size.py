#!/usr/bin/env python3
"""S4 (docs/PLAY_STORE_UI_PLAN.md): raise text that is too small to read.

Rule (from the plan): anything the student has to read becomes 12 sp; short labels / badges may be 11 sp.
Only sizes BELOW 11 sp are touched (8, 8.5, 9, 9.5, 10, 10.5). 11 sp and above stay as they are.

How a size is classified (looked at in a window of 5 lines around the fontSize):
  LABEL    -> 11 sp : the text is made uppercase, or has letterSpacing, or is FontWeight.Black / ExtraBold,
                      or is a short literal (14 characters or fewer, e.g. "VERIFIED", "New", "Sem 1").
  READABLE -> 12 sp : everything else.
(The window is the single Text(...) call that holds the fontSize, never a neighbouring Text.)
A lineHeight that belongs to a changed fontSize (nearest fontSize, at most 3 lines away) is raised only if it
would be tighter than 1.25 x the new size; it is never lowered.

What it does NOT touch: ui/theme/Type.kt (design tokens), comments, letterSpacing, any value of 11 sp or more,
HTML/CSS pages in assets (those belong to the website/notes pages, not this slice), any non-Kotlin file.

Output: edits the .kt files in place and writes docs/S4_TEXT_SIZE_REPORT.md (every change, file:line, old -> new, and a
CHECK flag where a fixed height / size / one-line limit sits next to the text and could clip at big font sizes).
Safe to run twice (a second run finds nothing below 11 sp and changes nothing). If anything unexpected happens,
NOTHING is written. Set S4_DRY=1 to only print the report.
"""
import math
import os
import re
import sys
from pathlib import Path

BASE = Path(os.environ.get("S4_BASE", "app/src/main/java/com/wisdomtower/academy"))
REPORT = Path(os.environ.get("S4_REPORT", "docs/S4_TEXT_SIZE_REPORT.md"))
DRY = os.environ.get("S4_DRY") == "1"

SKIP_FILES = {"Type.kt"}  # theme tokens: never touched
THRESHOLD = 11.0          # sizes below this are raised
LABEL_SIZE = 11.0
READABLE_SIZE = 12.0
WINDOW = 5                # lines looked at around a fontSize for the label test
LH_REACH = 3              # a lineHeight belongs to a fontSize at most this many lines away
MIN_LH_RATIO = 1.25

NUM = r"(?<![\w.])(\d+(?:\.\d+)?)\.sp\b"
FONT_LINE = re.compile(r"\bfontSize\s*=")
FONT_NUM = re.compile(NUM)
LH_LINE = re.compile(r"\blineHeight\s*=\s*" + NUM[0:0] + r"(\d+(?:\.\d+)?)\.sp\b")
LABEL_HINT = re.compile(r"\.uppercase\(\)|letterSpacing|FontWeight\.(Black|ExtraBold)")
SHORT_LITERAL = re.compile(r'(?:\btext\s*=\s*|\bText\(\s*)"([^"\n$]{1,14})"')
RISK_HINT = re.compile(r"\.(height|size|width)\(\s*\d+(\.\d+)?\.dp\s*\)|maxLines\s*=\s*1\b|softWrap\s*=\s*false")


def fmt(v):
    return str(int(v)) if float(v).is_integer() else str(v)


def is_comment(line):
    s = line.lstrip()
    return s.startswith("//") or s.startswith("*") or s.startswith("/*")


def call_span(lines, idx):
    """Lines of the Text(...) call that holds the fontSize at idx: back to the nearest line that opens a Text(
    (or TextStyle/copy on that line), forward until the next line that opens another Text( ."""
    opener = re.compile(r"\bText\(|\bBasicText\(|TextStyle\(|\.copy\(")
    lo = idx
    while lo > max(0, idx - WINDOW) and not opener.search(lines[lo]):
        lo -= 1
    hi = idx + 1
    while hi < min(len(lines), idx + WINDOW + 1) and not re.search(r"\bText\(|\bBasicText\(", lines[hi]):
        hi += 1
    return lo, hi


def classify(lines, idx):
    lo, hi = call_span(lines, idx)
    window = "\n".join(l for l in lines[lo:hi] if not is_comment(l))
    if LABEL_HINT.search(window):
        return "label"
    if SHORT_LITERAL.search(window):
        return "label"
    return "readable"


def process(path):
    """Return (new_text, changes) or (None, []) when nothing changes."""
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    changes = []
    font_changed_at = {}  # line index -> new size

    for i, line in enumerate(lines):
        if is_comment(line) or not FONT_LINE.search(line):
            continue
        kind = None
        # only look at the part of the line after "fontSize ="
        m = FONT_LINE.search(line)
        head, tail = line[:m.end()], line[m.end():]
        # stop at the first top-level comma so "fontSize = 10.sp, lineHeight = 14.sp" leaves lineHeight alone
        stop = len(tail)
        depth = 0
        for pos, ch in enumerate(tail):
            if ch in "([{":
                depth += 1
            elif ch in ")]}":
                if depth == 0:
                    stop = pos
                    break
                depth -= 1
            elif ch == "," and depth == 0:
                stop = pos
                break
        expr, rest = tail[:stop], tail[stop:]

        def repl(mo):
            nonlocal kind
            old = float(mo.group(1))
            if old >= THRESHOLD:
                return mo.group(0)
            if kind is None:
                kind = classify(lines, i)
            new = LABEL_SIZE if kind == "label" else READABLE_SIZE
            font_changed_at[i] = new
            risky = bool(RISK_HINT.search("\n".join(lines[max(0, i - 4):i + 5])))
            changes.append({"line": i + 1, "old": old, "new": new, "kind": kind, "what": "fontSize", "risk": risky})
            return f"{fmt(new)}.sp"

        new_expr = FONT_NUM.sub(repl, expr)
        if new_expr != expr:
            lines[i] = head + new_expr + rest

    # lineHeight that belongs to a changed fontSize
    for j, line in enumerate(lines):
        if is_comment(line):
            continue
        mo = re.search(r"\blineHeight\s*=\s*(\d+(?:\.\d+)?)\.sp\b", line)
        if not mo or not font_changed_at:
            continue
        near = min(font_changed_at, key=lambda k: abs(k - j))
        if abs(near - j) > LH_REACH:
            continue
        # make sure no OTHER (unchanged or changed) fontSize is closer
        others = [k for k, l in enumerate(lines) if FONT_LINE.search(l) and not is_comment(l) and abs(k - j) < abs(near - j)]
        if others:
            continue
        lh = float(mo.group(1))
        want = math.ceil(font_changed_at[near] * MIN_LH_RATIO)
        if lh < want:
            lines[j] = line[:mo.start(1)] + f"{want}" + line[mo.end(1):]
            changes.append({"line": j + 1, "old": lh, "new": float(want), "kind": "lineHeight", "what": "lineHeight", "risk": False})

    if not changes:
        return None, []
    return "\n".join(lines), changes


def main():
    if not BASE.is_dir():
        print(f"ERROR: {BASE} not found (run this from the repo root)")
        return 1
    results = {}
    problems = []
    for path in sorted(BASE.rglob("*.kt")):
        if path.name in SKIP_FILES:
            continue
        try:
            new_text, changes = process(path)
        except Exception as exc:  # nothing is written on any surprise
            problems.append(f"{path}: {exc!r}")
            continue
        if changes:
            results[path] = (new_text, changes)

    if problems:
        print("ERROR, nothing written:")
        for p in problems:
            print(" -", p)
        return 1

    n_font = sum(1 for _, (_, ch) in results.items() for c in ch if c["what"] == "fontSize")
    n_lh = sum(1 for _, (_, ch) in results.items() for c in ch if c["what"] == "lineHeight")
    n_risk = sum(1 for _, (_, ch) in results.items() for c in ch if c["risk"])

    out = [
        "# S4 text size report (generated by scripts/patch_s4_text_size.py)",
        "",
        f"- fontSize values raised: {n_font} in {len(results)} files; lineHeight values raised to keep the lines from touching: {n_lh}.",
        f"- {n_risk} of them are marked CHECK: a fixed height, fixed size, one-line limit or no-wrap sits next to the text, so test them with the phone font size on Large and Largest.",
        "- Rule: below 11 sp becomes 12 sp for text to read, 11 sp for short labels / badges / uppercase text. 11 sp and above were not touched.",
        "",
    ]
    for path, (_, changes) in sorted(results.items()):
        rel = path.relative_to(BASE).as_posix()
        out.append(f"## {rel}")
        for c in changes:
            flag = "  **CHECK**" if c["risk"] else ""
            out.append(f"- line {c['line']}: {c['what']} {fmt(c['old'])} -> {fmt(c['new'])} ({c['kind']}){flag}")
        out.append("")
    report_text = "\n".join(out)

    if DRY or not results:
        print(report_text if results else "nothing below 11 sp, nothing to do")
        return 0

    for path, (new_text, _) in results.items():
        path.write_text(new_text, encoding="utf-8")
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(report_text + "\n", encoding="utf-8")
    print(f"patched {len(results)} files: {n_font} fontSize, {n_lh} lineHeight, {n_risk} CHECK; report: {REPORT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
