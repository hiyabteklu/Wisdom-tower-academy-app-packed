#!/usr/bin/env python3
"""M11 slice 8 (docs/UI_MOTION_PLAN.md): dialog enter motion in two big files, without resending them.
 1. ui/study/HubItemListScreen.kt: the "remove downloads" AlertDialog (confirmRemove) gets `Modifier.wisdomDialogEnter()`;
 2. ui/study/NativeTutorScreen.kt: the "clear chat" AlertDialog (showClearConfirm) gets `Modifier.wisdomDialogEnter()`.
Scale 0.94 to 1 + fade, 200 ms (ui/theme/WisdomOverlayMotion.kt). Closing stays the platform's instant dismiss.
Nothing else changes (texts, buttons, callbacks). Every anchor must match exactly once in its file, or NOTHING is written
in either file. Safe to run twice (a file that already contains `wisdomDialogEnter` is skipped)."""
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy/ui/study")
IMPORT_ANCHOR = "import androidx.compose.material3.AlertDialog\n"
IMPORT_NEW = "import com.wisdomtower.academy.ui.theme.wisdomDialogEnter\n"

JOBS = [
    (
        "HubItemListScreen.kt",
        "AlertDialog(\n                onDismissRequest = { confirmRemove = null },",
        "AlertDialog(\n                modifier = Modifier.wisdomDialogEnter(),\n                onDismissRequest = { confirmRemove = null },",
    ),
    (
        "NativeTutorScreen.kt",
        "AlertDialog(\n                onDismissRequest = { showClearConfirm = false },",
        "AlertDialog(\n                modifier = Modifier.wisdomDialogEnter(),\n                onDismissRequest = { showClearConfirm = false },",
    ),
]

planned = []
for name, old, new in JOBS:
    path = BASE / name
    src = path.read_text(encoding="utf-8")
    if "wisdomDialogEnter" in src:
        print(f"{name}: already patched, skipped")
        continue
    for label, anchor in (("import", IMPORT_ANCHOR), ("dialog", old)):
        n = src.count(anchor)
        if n != 1:
            print(f"ERROR: {name}: anchor '{label}' found {n} times (need 1); nothing written")
            sys.exit(1)
    out = src.replace(old, new, 1).replace(IMPORT_ANCHOR, IMPORT_NEW + IMPORT_ANCHOR, 1)
    if out.count("{") - out.count("}") != src.count("{") - src.count("}"):
        print(f"ERROR: {name}: brace balance changed; nothing written")
        sys.exit(1)
    planned.append((path, out, name))

for path, out, name in planned:
    path.write_text(out, encoding="utf-8")
    print(f"patched: {name}")
print("done")
