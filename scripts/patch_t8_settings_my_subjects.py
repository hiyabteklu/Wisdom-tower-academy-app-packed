#!/usr/bin/env python3
"""T8 "My Subjects": show the new MySubjectsSection card in SettingsScreen.kt, just before the
"Notifications & Study Alerts" accordion (one small LazyColumn item; MySubjectsSection lives in the same package,
so no import is needed). Safe to run twice."""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/settings/SettingsScreen.kt")
ANCHOR = '            // SECTION 2: Notifications & Study Alerts\n            item(key = "section_2_notifs") {\n'
MARK = "MySubjectsSection()"
ADD = (
    '            // T8: My Subjects (which subjects "Your status" counts)\n'
    '            item(key = "section_my_subjects") {\n'
    '                MySubjectsSection()\n'
    '            }\n\n'
)

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)
n = src.count(ANCHOR)
if n != 1:
    print(f"ERROR: anchor found {n} times (need exactly 1); file not changed")
    sys.exit(1)
FILE.write_text(src.replace(ANCHOR, ADD + ANCHOR), encoding="utf-8")
print("patched")
