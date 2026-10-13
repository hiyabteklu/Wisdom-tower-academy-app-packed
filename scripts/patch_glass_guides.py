#!/usr/bin/env python3
"""Glass look, area 8 (docs/GLASS_PLAN.md): the two hand-drawn dark surfaces in GuidesScreen.kt.

 - round back button:  Color(0xFF111B2E).copy(alpha = 0.8f)  ->  WisdomGlassFillStrong
 - tab pills (not selected): Color(0xFF111B2E).copy(alpha = 0.6f)  ->  WisdomGlassFill
Adds the two imports before the first import line. Safe to run twice (nothing to replace = already patched).
Only the standard library. Does not touch any forbidden file.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/guides/GuidesScreen.kt")
SWAPS = [
    ("Color(0xFF111B2E).copy(alpha = 0.8f)", "WisdomGlassFillStrong"),
    ("Color(0xFF111B2E).copy(alpha = 0.6f)", "WisdomGlassFill"),
]
IMPORTS = ("import com.wisdomtower.academy.ui.theme.WisdomGlassFill\n"
           "import com.wisdomtower.academy.ui.theme.WisdomGlassFillStrong\n")

if not FILE.exists():
    print(f"ERROR: {FILE} not found; nothing changed"); sys.exit(1)
src = FILE.read_text(encoding="utf-8")
out = src
changed = 0
for old, new in SWAPS:
    n = out.count(old)
    changed += n
    out = out.replace(old, new)
if changed == 0:
    print("already patched, nothing to do"); sys.exit(0)
if "ui.theme.WisdomGlassFillStrong\n" not in out:
    i = out.find("\nimport ")
    if i < 0:
        print("ERROR: no import line found; nothing changed"); sys.exit(1)
    out = out[:i + 1] + IMPORTS + out[i + 1:]
FILE.write_text(out, encoding="utf-8")
print(f"patched {changed} place(s)")
