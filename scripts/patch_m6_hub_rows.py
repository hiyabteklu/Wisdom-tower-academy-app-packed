#!/usr/bin/env python3
"""M6 (docs/UI_MOTION_PLAN.md): hub item list motion in ui/study/HubItemListScreen.kt.
 1. each row rises in once per app session (`wisdomReveal`, first 8 staggered);
 2. the thin download bar under a row eases to the REAL value (250 ms) instead of jumping.
Nothing else changes (texts, download logic, dialogs, ordering). The gauge and check-mark pop are in DownloadGauge.kt (resent whole).
Every anchor must match exactly once or NOTHING is written. Safe to run twice."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/study/HubItemListScreen.kt")
src = FILE.read_text(encoding="utf-8")
if "wisdomReveal(" in src:
    print("already patched, nothing to do")
    sys.exit(0)

IMP_A = "import android.content.Context\n"
IMP_B = "import com.wisdomtower.academy.ui.theme.WisdomMuted\n"
ROW_OLD = ("                        val isNew = item.id !in seen\n"
           "                        ItemRow(\n")
ROW_NEW = ("                        val isNew = item.id !in seen\n"
           "                        val rowIndex = current.items.indexOf(item)\n"
           "                        Box(modifier = Modifier.wisdomReveal(\"hub_${hubId}_${item.id}\", rowIndex)) {\n"
           "                        ItemRow(\n")
END_OLD = ("                            onOpenItem(item)\n"
           "                        }\n")
END_NEW = ("                            onOpenItem(item)\n"
           "                        }\n"
           "                        }\n")
BAR_OLD = ("                    if (progress >= 0f) {\n"
           "                        Box(\n")
BAR_NEW = ("                    if (progress >= 0f) {\n"
           "                        val barProgress by animateFloatAsState(\n"
           "                            targetValue = progress.coerceIn(0f, 1f),\n"
           "                            animationSpec = tween(250),\n"
           "                            label = \"hubRowProgress\"\n"
           "                        )\n"
           "                        Box(\n")
FILL_OLD = ".fillMaxWidth(progress.coerceIn(0f, 1f))"
FILL_NEW = ".fillMaxWidth(barProgress)"

for label, a in [("import A", IMP_A), ("import B", IMP_B), ("row start", ROW_OLD), ("row end", END_OLD),
                 ("bar", BAR_OLD), ("fill", FILL_OLD)]:
    n = src.count(a)
    if n != 1:
        print(f"ERROR: anchor '{label}' found {n} times (need 1); nothing written")
        sys.exit(1)
if not src.index(ROW_OLD) < src.index(END_OLD):
    print("ERROR: row anchors in the wrong order; nothing written")
    sys.exit(1)

out = src.replace(ROW_OLD, ROW_NEW, 1).replace(END_OLD, END_NEW, 1).replace(BAR_OLD, BAR_NEW, 1).replace(FILL_OLD, FILL_NEW, 1)
out = out.replace(IMP_A, "import androidx.compose.animation.core.animateFloatAsState\nimport androidx.compose.animation.core.tween\n" + IMP_A, 1)
out = out.replace(IMP_B, IMP_B + "import com.wisdomtower.academy.ui.theme.wisdomReveal\n", 1)
if out.count("{") - out.count("}") != src.count("{") - src.count("}"):
    print("ERROR: brace balance changed; nothing written")
    sys.exit(1)
FILE.write_text(out, encoding="utf-8")
print("patched: M6 hub rows (reveal + eased bar)")
