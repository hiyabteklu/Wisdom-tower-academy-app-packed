#!/usr/bin/env python3
"""B3 of docs/PLAN_SOLID_BACKGROUND_OPTIONS.md: adds the "Background" picker card to the Settings screen.

SettingsScreen.kt is too big to resend, so this inserts ONE lazy-list item (a call to BackgroundSection(), which lives
in the new file ui/settings/BackgroundSection.kt) right before the "SECTION 5: Offline Data & Cloud Sync" item.
Safe to run twice: if the call is already there it does nothing. If the anchor is not found exactly once, nothing is
written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/settings/SettingsScreen.kt")
ANCHOR = "            // SECTION 5: Offline Data & Cloud Sync\n"
MARK = "BackgroundSection()"
ADD = (
    "            // B3: Background colour picker (docs/PLAN_SOLID_BACKGROUND_OPTIONS.md)\n"
    "            item(key = \"section_background\") {\n"
    "                BackgroundSection()\n"
    "            }\n"
    "\n"
)

if not FILE.exists():
    print(f"ERROR: {FILE} not found; nothing changed"); sys.exit(1)
src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do"); sys.exit(0)
n = src.count(ANCHOR)
if n != 1:
    print(f"ERROR: anchor found {n} times (need exactly 1); file not changed"); sys.exit(1)
FILE.write_text(src.replace(ANCHOR, ADD + ANCHOR), encoding="utf-8")
print("patched")
