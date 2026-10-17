#!/usr/bin/env python3
"""L2 of docs/DAY_NIGHT_PLAN.md: moves the screens that are built on glass / token colours from Color.White / Color.Black
to the day/night tokens WisdomInk / WisdomOnInk, and writes a report of every colour literal that is still left.

Only the files in SWEEP are changed: they are the screens that have NO literal dark surface (checked with a search for
Color(0x on 2026-10-17), so after the change their text follows the day/night switch and keeps its contrast. Files with
literal dark cards are NOT touched here (white text on a dark card is still right); they get their own slices.
Night mode is unchanged: WisdomInk is white and WisdomOnInk is black at night.

Rules (single-line, in this order):
  1. Color.White.copy(            -> WisdomInk.copy(          (white tints, borders, overlays)
  2. wisdomAnimatedColor(x, Color.White,    -> (x, WisdomInk,       selected chip fill
     wisdomAnimatedColor(x, Color.Black,    -> (x, WisdomOnInk,     selected chip text
     wisdomAnimatedColor(x, Color.DarkGray, -> (x, WisdomOnInk.copy(alpha = 0.75f),
  3. ", Color.White)"             -> ", WisdomInk)"           (last argument, e.g. unselected text)
  4. name = Color.White           -> name = WisdomInk         for names with color / tint / thumb / track, but NOT
                                                              container or background (those stay as they are)
     xxxThumbxxx = Color.Black    -> WisdomOnInk
  5. BorderStroke(w, Color.White) -> BorderStroke(w, WisdomInk)
  6. Settings only: Color(0xFF0F1829) -> WisdomFieldSurface (text field surface, new file ui/theme/WisdomFieldTokens.kt)
Adds the import for WisdomInk / WisdomOnInk / WisdomFieldSurface when a file needs it. Safe to run twice (a second run
changes nothing). The balance of ( and ) in a file must stay the same or the file is left unchanged.
Also (re)writes docs/DAY_NIGHT_LITERALS.md: every remaining Color.White, Color.Black and Color(0x...) in app code, by file
and line, for the next sweep slices.
Tested on a fixture copy (first run patched, second run unchanged).
"""
import re
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy")
SWEEP = [
    "ui/home/HomeScreen.kt",
    "ui/learning/LearningScreen.kt",
    "ui/packages/PackagesScreen.kt",
    "ui/packages/PackageDetailScreen.kt",
    "ui/packages/GpaCalculatorCard.kt",
    "ui/study/StudyWorkspaceScreen.kt",
    "ui/competition/CompetitionPointsCard.kt",
    "ui/settings/SettingsScreen.kt",
    "ui/settings/MySubjectsSection.kt",
]
LITERAL_MAP = {"ui/settings/SettingsScreen.kt": [("Color(0xFF0F1829)", "WisdomFieldSurface")]}
THEME_PKG = "package com.wisdomtower.academy.ui.theme"
IMPORT_PREFIX = "import com.wisdomtower.academy.ui.theme."

NAMED = re.compile(r"\b(\w*(?:[cC]olor|tint|Thumb|Track)\w*)(\s*=\s*)Color\.White\b(?![.\w])")


def named_white(m):
    name = m.group(1)
    if "ontainer" in name or "ackground" in name:
        return m.group(0)
    return f"{name}{m.group(2)}WisdomInk"


RULES = [
    (re.compile(r"Color\.White\.copy\("), lambda m: "WisdomInk.copy("),
    (re.compile(r"wisdomAnimatedColor\((\w+),\s*Color\.White,"), lambda m: f"wisdomAnimatedColor({m.group(1)}, WisdomInk,"),
    (re.compile(r"wisdomAnimatedColor\((\w+),\s*Color\.Black,"), lambda m: f"wisdomAnimatedColor({m.group(1)}, WisdomOnInk,"),
    (re.compile(r"wisdomAnimatedColor\((\w+),\s*Color\.DarkGray,"), lambda m: f"wisdomAnimatedColor({m.group(1)}, WisdomOnInk.copy(alpha = 0.75f),"),
    (re.compile(r",\s*Color\.White\)"), lambda m: ", WisdomInk)"),
    (NAMED, named_white),
    (re.compile(r"\b(\w*Thumb\w*)(\s*=\s*)Color\.Black\b(?![.\w])"), lambda m: f"{m.group(1)}{m.group(2)}WisdomOnInk"),
    (re.compile(r"BorderStroke\(([^,()]+),\s*Color\.White\)"), lambda m: f"BorderStroke({m.group(1)}, WisdomInk)"),
]


def add_imports(src, names):
    if src.startswith(THEME_PKG):
        return src
    need = [n for n in names if re.search(r"\b" + n + r"\b", src) and (IMPORT_PREFIX + n) not in src]
    if not need:
        return src
    lines = src.split("\n")
    for i, line in enumerate(lines):
        if line.startswith("import "):
            for n in reversed(need):
                lines.insert(i, IMPORT_PREFIX + n)
            return "\n".join(lines)
    return src


def sweep(rel):
    f = BASE / rel
    if not f.exists():
        print(f"skip (not found): {rel}")
        return
    src = f.read_text(encoding="utf-8")
    out = src
    for pat, rep in RULES:
        out = pat.sub(rep, out)
    for old, new in LITERAL_MAP.get(rel, []):
        out = out.replace(old, new)
    out = add_imports(out, ["WisdomInk", "WisdomOnInk", "WisdomFieldSurface"])
    if out == src:
        print(f"unchanged: {rel}")
        return
    if src.count("(") - src.count(")") != out.count("(") - out.count(")"):
        print(f"ERROR: bracket balance changed in {rel}; file not written")
        return
    f.write_text(out, encoding="utf-8")
    print(f"patched: {rel}")


def report():
    lit = re.compile(r"Color\(0x[0-9A-Fa-f]+\)|Color\.White|Color\.Black")
    rows = []
    total = 0
    for f in sorted(BASE.rglob("*.kt")):
        rel = f.relative_to(BASE).as_posix()
        if rel.startswith("ui/theme/"):
            continue
        hits = []
        for no, line in enumerate(f.read_text(encoding="utf-8").split("\n"), 1):
            if lit.search(line):
                hits.append(f"{no}: {line.strip()[:110]}")
        if hits:
            total += len(hits)
            rows.append(f"\n## {rel} ({len(hits)})\n" + "\n".join("- " + h for h in hits))
    head = (
        "# DAY_NIGHT_LITERALS.md (generated by scripts/patch_l2_color_sweep.py, do not edit by hand)\n\n"
        "Every Color.White, Color.Black and Color(0x...) left in app code outside ui/theme, by file and line: "
        f"{total} places. Used by the sweep slices of docs/DAY_NIGHT_PLAN.md. A place is done when it uses a token from "
        "ui/theme/Color.kt (or is a scrim / photo overlay that may stay black).\n"
    )
    out = Path("docs/DAY_NIGHT_LITERALS.md")
    out.parent.mkdir(exist_ok=True)
    out.write_text(head + "\n".join(rows) + "\n", encoding="utf-8")
    print(f"report written: {total} places in {len(rows)} files")


if not BASE.exists():
    print(f"ERROR: {BASE} not found")
    sys.exit(1)
for rel in SWEEP:
    sweep(rel)
report()
