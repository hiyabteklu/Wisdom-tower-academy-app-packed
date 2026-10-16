#!/usr/bin/env python3
"""M5 (docs/UI_MOTION_PLAN.md): push / pop motion for three full-screen overlays of MainActivity.kt:
the study workspace, the guides (Other resources) and the competitions (trophy) screen.

Each `if (...) { Screen(...) }` block becomes `WisdomPushLayer(item = ..., zIndexValue = ...) { x -> Screen(...) }`; only the opening line
changes (plus `initialSlug` of the guides, which must keep the LAST slug while the screen slides out). The closing brace now closes the
lambda. The composable is the NEW file ui/theme/WisdomPushLayer.kt. State, back handling and who sets the state are untouched.
Not covered (on purpose): notifications (its content depends on state that is cleared on close), drawer screens, admin, tool overlays.
Every anchor must match exactly once or NOTHING is written. Safe to run twice."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
LAYER = Path("app/src/main/java/com/wisdomtower/academy/ui/theme/WisdomPushLayer.kt")
src = FILE.read_text(encoding="utf-8")
if "WisdomPushLayer(" in src:
    print("already patched, nothing to do")
    sys.exit(0)
if not LAYER.exists():
    print("ERROR: ui/theme/WisdomPushLayer.kt is missing; nothing written")
    sys.exit(1)

I = " " * 16
IMPORT_ANCHOR = "import com.wisdomtower.academy.ui.theme.MyApplicationTheme\n"
REPL = [
    (I + "val currentWs = activeWorkspace\n" + I + "if (currentWs != null) {\n" + I + "    StudyWorkspaceScreen(\n",
     I + "WisdomPushLayer(item = activeWorkspace, zIndexValue = 18f) { currentWs ->\n" + I + "    StudyWorkspaceScreen(\n"),
    (I + "if (activeGuideSlug != null) {\n" + I + "    GuidesScreen(\n" + I + "        initialSlug = activeGuideSlug ?: \"study-techniques\",\n",
     I + "WisdomPushLayer(item = activeGuideSlug, zIndexValue = 15f) { guideSlugNow ->\n" + I + "    GuidesScreen(\n" + I + "        initialSlug = guideSlugNow,\n"),
    (I + "// C4-competitions-trophy: native competitions screen (trophy)\n" + I + "if (showCompetitions) {\n",
     I + "// C4-competitions-trophy: native competitions screen (trophy)\n" + I + "WisdomPushLayer(item = if (showCompetitions) true else null, zIndexValue = 17f) { _ ->\n"),
]
for label, a in [("import", IMPORT_ANCHOR)] + [(f"block {i}", r[0]) for i, r in enumerate(REPL)]:
    n = src.count(a)
    if n != 1:
        print(f"ERROR: anchor '{label}' found {n} times (need 1); nothing written")
        sys.exit(1)
out = src
for old, new in REPL:
    out = out.replace(old, new, 1)
out = out.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + "import com.wisdomtower.academy.ui.theme.WisdomPushLayer\n", 1)
if out.count("{") - out.count("}") != src.count("{") - src.count("}"):
    print("ERROR: brace balance changed; nothing written")
    sys.exit(1)
FILE.write_text(out, encoding="utf-8")
print("patched: M5 screen push (3 overlays + 1 import)")
