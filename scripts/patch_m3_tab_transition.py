#!/usr/bin/env python3
"""M3 (docs/UI_MOTION_PLAN.md): fade-through transition between the five bottom tabs.

What it does (MainActivity.kt only; the composable itself is the NEW file ui/theme/WisdomTabLayer.kt):
  * Each of the five `if (selectedIndex == n) { ...Screen(...) }` blocks becomes `WisdomTabLayer(tab = n, selectedIndex = selectedIndex) { ...Screen(...) }`.
    Only the opening line of each block changes; the closing brace now closes the lambda, so the screens inside are untouched.
  * One import is added.
Behaviour that stays the same: `selectedIndex` ownership, back handling, the call site of the bottom nav, what each tab shows,
and the fact that a tab's state is dropped when you leave it (no state is kept; only the swap is no longer a cut).
Tab 1 (Learning) keeps its extra rule: its native screen is hidden while `activeStudyUrl` is set, and it then disappears at once (no fade),
so the hub WebView is never covered.
Every anchor must match exactly once or NOTHING is written. Safe to run twice."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
LAYER = Path("app/src/main/java/com/wisdomtower/academy/ui/theme/WisdomTabLayer.kt")
src = FILE.read_text(encoding="utf-8")

if "WisdomTabLayer(" in src:
    print("already patched, nothing to do")
    sys.exit(0)
if not LAYER.exists():
    print("ERROR: ui/theme/WisdomTabLayer.kt is missing; nothing written")
    sys.exit(1)

IMPORT_ANCHOR = "import com.wisdomtower.academy.ui.theme.WisdomNavy\n"
REPLACEMENTS = [
    ("if (selectedIndex == 0) {",
     "WisdomTabLayer(tab = 0, selectedIndex = selectedIndex) {"),
    ("if (selectedIndex == 1 && activeStudyUrl == null) {",
     "WisdomTabLayer(tab = 1, selectedIndex = selectedIndex, active = activeStudyUrl == null) {"),
    ("if (selectedIndex == 2) {",
     "WisdomTabLayer(tab = 2, selectedIndex = selectedIndex) {"),
    ("if (selectedIndex == 3) {",
     "WisdomTabLayer(tab = 3, selectedIndex = selectedIndex) {"),
    ("if (selectedIndex == 4) {",
     "WisdomTabLayer(tab = 4, selectedIndex = selectedIndex) {"),
]
for label, a in [("import", IMPORT_ANCHOR)] + [(f"tab {i}", r[0]) for i, r in enumerate(REPLACEMENTS)]:
    n = src.count(a)
    if n != 1:
        print(f"ERROR: anchor '{label}' found {n} times (need 1); nothing written")
        sys.exit(1)

# each block must still be followed by the expected screen call (guards against a file that changed since this was written)
EXPECT = [
    ("if (selectedIndex == 0) {", "HomeScreen("),
    ("if (selectedIndex == 1 && activeStudyUrl == null) {", "LearningScreen("),
    ("if (selectedIndex == 2) {", "val currentPkg = selectedPackage"),
    ("if (selectedIndex == 3) {", "AccountScreen("),
    ("if (selectedIndex == 4) {", "SettingsScreen("),
]
for anchor, nxt in EXPECT:
    i = src.index(anchor) + len(anchor)
    if not src[i:i + 80].lstrip().startswith(nxt):
        print(f"ERROR: '{anchor}' is not followed by '{nxt}'; nothing written")
        sys.exit(1)

out = src
for old, new in REPLACEMENTS:
    out = out.replace(old, new, 1)
out = out.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + "import com.wisdomtower.academy.ui.theme.WisdomTabLayer\n", 1)

if out.count("{") - out.count("}") != src.count("{") - src.count("}"):
    print("ERROR: brace balance changed; nothing written")
    sys.exit(1)
FILE.write_text(out, encoding="utf-8")
print("patched: M3 tab fade-through (5 blocks + 1 import)")
