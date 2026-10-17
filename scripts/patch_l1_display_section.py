#!/usr/bin/env python3
"""L1 of docs/DAY_NIGHT_PLAN.md: merges Display, Theme and Background into ONE Settings card with the day/night icon switch.

SettingsScreen.kt is too big to resend. This replaces the two lazy-list items "Reading & Display" (section_4_display) and
"Background" (section_background), which sit next to each other, with ONE item that calls DisplayThemeSection() (new file
ui/settings/DisplaySection.kt). The new card keeps every text of the old Reading & Display card (font size, typography
style, live sample preview), keeps the same saved font-size setting, and adds the sun/moon switch and the day/night
backgrounds.
Safe to run twice: if the call is already there it does nothing. If the anchors are not found exactly once, or the text
between them is not exactly those two items, nothing is written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/settings/SettingsScreen.kt")
START = "            // SECTION 4: Reading & Display\n            item(key = \"section_4_display\") {\n"
END = "            // SECTION 5: Offline Data & Cloud Sync\n"
MARK = "DisplayThemeSection()"
ADD = (
    "            // L1 (docs/DAY_NIGHT_PLAN.md): Display, Theme and Background in ONE card, with the day/night icon switch\n"
    "            item(key = \"section_display_theme\") {\n"
    "                DisplayThemeSection()\n"
    "            }\n"
    "\n"
)

if not FILE.exists():
    print(f"ERROR: {FILE} not found; nothing changed"); sys.exit(1)
src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do"); sys.exit(0)
if src.count(START) != 1 or src.count(END) != 1:
    print(f"ERROR: anchors found {src.count(START)} and {src.count(END)} times (need exactly 1 each); file not changed"); sys.exit(1)
s = src.index(START)
e = src.index(END)
if s >= e:
    print("ERROR: anchors are in the wrong order; file not changed"); sys.exit(1)
region = src[s:e]
if 'item(key = "section_background")' not in region or region.count("item(key =") != 2:
    print("ERROR: the text between the anchors is not exactly the Display item and the Background item; file not changed"); sys.exit(1)
FILE.write_text(src[:s] + ADD + src[e:], encoding="utf-8")
print("patched")
