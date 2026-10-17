"""BG-POPUP-2: make the hard-coded pop-up fills (AlertDialog containerColor) almost solid so text is readable.

Three dialogs write their own containerColor at 70 percent (0xB3). This raises them to 95 percent (0xF2) with the same
RGB. It edits only those hex literals. Safe to run twice. Run from the repo root (the GitHub Action does).
"""
import pathlib
import sys

ROOT = pathlib.Path("app/src/main/java/com/wisdomtower/academy")
CHANGES = {
    "ui/settings/AccountDeletionSection.kt": [("Color(0xB30F1829)", "Color(0xF20F1829)")],
    "ui/competition/CompetitionExamScreen.kt": [("Color(0xB30F1829)", "Color(0xF20F1829)")],
    "ui/study/HubItemListScreen.kt": [("Color(0xB3111B2E)", "Color(0xF2111B2E)")],
    "ui/study/NativeTutorScreen.kt": [("Color(0xB30E172A)", "Color(0xF20E172A)")],
}

failed = False
for rel, pairs in CHANGES.items():
    p = ROOT / rel
    if not p.exists():
        print("MISSING", rel)
        failed = True
        continue
    t = p.read_text(encoding="utf-8")
    n = 0
    for old, new in pairs:
        n += t.count(old)
        t = t.replace(old, new)
    p.write_text(t, encoding="utf-8")
    print(rel, "replaced", n)
sys.exit(1 if failed else 0)
