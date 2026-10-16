#!/usr/bin/env python3
"""M11 slice 9 (docs/UI_MOTION_PLAN.md): push / pop motion for the drawer screens (About, Contact, FAQ, Privacy, Terms) in MainActivity.kt.

The block `if (activeDrawerScreen != null) { BackHandler(...); when (activeDrawerScreen) { ... } }` is split in two:
the BackHandler stays in its own `if` (so Back is only intercepted while a drawer screen is really open, exactly as before), and the `when`
moves inside `WisdomPushLayer(item = activeDrawerScreen, zIndexValue = 25f) { drawerScreenNow -> ... }`, which slides the screen in from the right
and keeps its content while it slides out. State, who sets it, the Back order (T1) and the five screens are untouched. The composable
`WisdomPushLayer` and its import already exist (M5 / M7). One anchor, must match exactly once or NOTHING is written. Safe to run twice."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "WisdomPushLayer(item = activeDrawerScreen"
OLD = (
    " " * 16 + "if (activeDrawerScreen != null) {\n"
    + " " * 20 + "BackHandler(enabled = true) { activeDrawerScreen = null }\n"
    + " " * 20 + "when (activeDrawerScreen) {\n"
)
NEW = (
    " " * 16 + "if (activeDrawerScreen != null) {\n"
    + " " * 20 + "BackHandler(enabled = true) { activeDrawerScreen = null }\n"
    + " " * 16 + "}\n"
    + " " * 16 + "// M11-drawer-push: shared push / pop layer; the item is the open drawer screen so it keeps its content while it slides out\n"
    + " " * 16 + "WisdomPushLayer(item = activeDrawerScreen, zIndexValue = 25f) { drawerScreenNow ->\n"
    + " " * 20 + "when (drawerScreenNow) {\n"
)

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)
if "import com.wisdomtower.academy.ui.theme.WisdomPushLayer\n" not in src:
    print("ERROR: WisdomPushLayer import is missing; nothing written")
    sys.exit(1)
n = src.count(OLD)
if n != 1:
    print(f"ERROR: drawer block anchor found {n} times (need 1); nothing written")
    sys.exit(1)
out = src.replace(OLD, NEW, 1)
if out.count("{") - out.count("}") != src.count("{") - src.count("}"):
    print("ERROR: brace balance changed; nothing written")
    sys.exit(1)
FILE.write_text(out, encoding="utf-8")
print("patched: M11 drawer screens push / pop")
