#!/usr/bin/env python3
"""Glass look, area 4 (docs/GLASS_PLAN.md): Settings, drawer pages (About, Contact, FAQ, Privacy, Terms) and Account.

WisdomModernCard and WisdomGlassCard have the same parameters (modifier, cornerRadius, borderColor, borderWidth,
onClick, content), so the change is a plain rename of the token in these three files (import and every call).
Explicit borderColor arguments stay as they are. In DrawerScreens.kt the round back button also gets the glass fill
and edge (same values as the hub back button). Safe to run twice: a file without the old token is left alone.
Only the standard library. Does not touch any forbidden file.
"""
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy/ui")
FILES = [BASE / "settings/SettingsScreen.kt", BASE / "drawer/DrawerScreens.kt", BASE / "account/AccountScreen.kt"]
OLD, NEW = "WisdomModernCard", "WisdomGlassCard"

BACK_OLD_BG = "                .background(Color(0xFF111B2E).copy(alpha = 0.8f))\n"
BACK_NEW_BG = "                .background(WisdomGlassFillStrong)\n"
BACK_OLD_BORDER = "                .border(BorderStroke(1.dp, WisdomBorderWhite), CircleShape)\n"
BACK_NEW_BORDER = "                .border(BorderStroke(1.dp, WisdomGlassBorder), CircleShape)\n"
IMPORT_ANCHOR = "import com.wisdomtower.academy.ui.theme.WisdomGlassCard\n"
IMPORT_ADD = ("import com.wisdomtower.academy.ui.theme.WisdomGlassBorder\n"
              "import com.wisdomtower.academy.ui.theme.WisdomGlassFillStrong\n")

new_texts = {}
for f in FILES:
    if not f.exists():
        print(f"ERROR: {f} not found; nothing changed"); sys.exit(1)
    src = f.read_text(encoding="utf-8")
    if OLD not in src:
        print(f"{f.name}: already patched")
        continue
    out = src.replace(OLD, NEW)
    if f.name == "DrawerScreens.kt":
        for a in (BACK_OLD_BG, BACK_OLD_BORDER, IMPORT_ANCHOR):
            if out.count(a) != 1:
                print(f"ERROR: anchor not found exactly once in {f.name}: {a.strip()}; nothing changed"); sys.exit(1)
        out = out.replace(BACK_OLD_BG, BACK_NEW_BG).replace(BACK_OLD_BORDER, BACK_NEW_BORDER)
        out = out.replace(IMPORT_ANCHOR, IMPORT_ADD + IMPORT_ANCHOR)
    new_texts[f] = out

for f, text in new_texts.items():
    f.write_text(text, encoding="utf-8")
    print(f"{f.name}: patched")
