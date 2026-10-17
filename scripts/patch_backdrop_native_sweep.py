#!/usr/bin/env python3
"""BG-NATIVE sweep (docs/PLAN_BACKDROP_REMAINING.md, owner: "make the background literally everywhere").

Walks every Kotlin file under app/src/main/java and turns dark navy / blue-black solid fills into see-through ones so the
chosen background (AtmosphereBackground) shows through drawer, bottom navigation, dialogs, drop-down menus, tool panels,
top pills, input pills, competition screens, etc. It edits only hex literals, never code structure, so it cannot break the
build by itself. Rules (navy = blue is the strongest channel, nothing above 0x70, not pure black):
  A  .background(Color(0xFF<navy>))            -> alpha 0x4D (30 percent)
  B  containerColor = Color(0xFF<navy>)        -> alpha 0xB3 (70 percent, dialogs / menus stay readable)
  C  any Color(0xC0..0xF8 <navy>)              -> alpha 0x66 (40 percent)  (old "almost solid" panels such as 0xF2152238)
Skipped: AppBackground.kt, AppBackdrop.kt, Theme.kt, Color.kt (they DEFINE the backdrop and the palette), lines with
"splash" (the cold-start splash stays solid) and lines with "keep-solid".
Also writes docs/BACKDROP_SWEEP_REPORT.md (changes per file + places that still use a NAMED navy colour, to fix next) and
docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt (the current bottom navigation code, so the next slice can edit it exactly).
Only the standard library. Safe to run twice.
"""
import re
import sys
from pathlib import Path

ROOT = Path("app/src/main/java")
SKIP_FILES = {"AppBackground.kt", "AppBackdrop.kt", "Theme.kt", "Color.kt"}
HEX = re.compile(r"Color\(0x([0-9A-Fa-f]{2})([0-9A-Fa-f]{6})\)")
RULE_A = re.compile(r"(\.background\(\s*(?:color\s*=\s*)?)Color\(0xFF([0-9A-Fa-f]{6})\)")
RULE_B = re.compile(r"(containerColor\s*=\s*)Color\(0xFF([0-9A-Fa-f]{6})\)")
VAL_DEF = re.compile(r"val\s+(\w+)\s*(?::\s*Color\s*)?=\s*Color\(0xFF([0-9A-Fa-f]{6})\)")


def navy(rgb: str) -> bool:
    r, g, b = int(rgb[0:2], 16), int(rgb[2:4], 16), int(rgb[4:6], 16)
    if r == g == b == 0:
        return False
    return b >= g and b >= r and max(r, g, b) <= 0x70


def sweep_line(line: str):
    """Returns (new_line, [rules that fired])."""
    low = line.lower()
    if "splash" in low or "keep-solid" in low:
        return line, []
    fired = []

    def a(m):
        if navy(m.group(2)):
            fired.append("A")
            return f"{m.group(1)}Color(0x4D{m.group(2).upper()})"
        return m.group(0)

    def b(m):
        if navy(m.group(2)):
            fired.append("B")
            return f"{m.group(1)}Color(0xB3{m.group(2).upper()})"
        return m.group(0)

    def c(m):
        al = int(m.group(1), 16)
        if 0xC0 <= al <= 0xF8 and navy(m.group(2)):
            fired.append("C")
            return f"Color(0x66{m.group(2).upper()})"
        return m.group(0)

    line = RULE_A.sub(a, line)
    line = RULE_B.sub(b, line)
    line = HEX.sub(c, line)
    return line, fired


def main():
    files = sorted(p for p in ROOT.rglob("*.kt") if p.name not in SKIP_FILES)
    if not files:
        print("ERROR: no Kotlin files found, run from the repo root")
        sys.exit(1)

    navy_names = set()
    texts = {}
    for p in files:
        t = p.read_text(encoding="utf-8")
        texts[p] = t
        for m in VAL_DEF.finditer(t):
            if navy(m.group(2)):
                navy_names.add(m.group(1))

    changed = {}
    leftovers = []
    total = 0
    for p, t in texts.items():
        out, n = [], 0
        for i, line in enumerate(t.split("\n"), 1):
            new, fired = sweep_line(line)
            if fired:
                n += len(fired)
            out.append(new)
            if navy_names and re.search(
                r"(\.background\(\s*(?:color\s*=\s*)?|containerColor\s*=\s*)(" + "|".join(sorted(navy_names)) + r")\b", new
            ):
                leftovers.append(f"{p.relative_to(ROOT)}:{i}: {new.strip()[:140]}")
        if n:
            p.write_text("\n".join(out), encoding="utf-8")
            changed[str(p.relative_to(ROOT))] = n
            total += n

    # snapshot of the bottom navigation for the next slice
    snap = ""
    main_kt = next((p for p in files if p.name == "MainActivity.kt"), None)
    if main_kt:
        t = main_kt.read_text(encoding="utf-8")
        s = t.find("private fun AliveBottomNav(")
        if s != -1:
            s = t.rfind("@Composable", 0, s)
            e = t.find("\n}\n", s)
            snap = t[s : e + 3] if e != -1 else t[s : s + 9000]

    Path("docs").mkdir(exist_ok=True)
    rep = ["# Backdrop native sweep report", "", f"Literal changes: {total} in {len(changed)} files.", ""]
    for f, n in sorted(changed.items(), key=lambda kv: -kv[1]):
        rep.append(f"- {f}: {n}")
    rep += ["", "## Navy colour NAMES (private vals) still used as a fill - fix next, one file at a time", ""]
    rep += [f"- {x}" for x in leftovers[:200]] or ["- none found"]
    rep += ["", f"Navy names found: {', '.join(sorted(navy_names)) or 'none'}", ""]
    Path("docs/BACKDROP_SWEEP_REPORT.md").write_text("\n".join(rep), encoding="utf-8")
    if snap:
        Path("docs/ALIVE_BOTTOM_NAV_SNAPSHOT.txt").write_text(snap, encoding="utf-8")
    print(f"patched: {total} literal(s) in {len(changed)} file(s); {len(leftovers)} named-colour fill(s) left; see docs/BACKDROP_SWEEP_REPORT.md")


main()
