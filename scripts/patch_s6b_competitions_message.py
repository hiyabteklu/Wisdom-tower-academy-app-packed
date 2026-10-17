#!/usr/bin/env python3
"""S6 part 2a (docs/PLAY_STORE_UI_PLAN.md): the Competitions screen uses the shared WisdomMessageCard.

ui/competition/CompetitionsHubScreen.kt: the bare grey line "No competitions right now." / the server error (plain Text
in the middle of the screen) becomes a WisdomMessageCard. An error is red and now has a Retry button that reloads the
list (the list also still reloads by itself every 30 seconds). The Sign in pill for signed-out students stays under it.
Same words as before. Needs ui/theme/WisdomMessageCard.kt (already on main from S6 part 1).
Safe to run twice (marker S6-msgcard-comp). If an anchor is not found exactly once, NOTHING is written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/competition/CompetitionsHubScreen.kt")
MARK = "S6-msgcard-comp"
src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

errors = []


def swap(s, name, old, new):
    n = s.count(old)
    if n != 1:
        errors.append(f"{name}: anchor found {n} times (need exactly 1)")
        return s
    return s.replace(old, new)


old = (
    "                Column(horizontalAlignment = Alignment.CenterHorizontally) { // UX-CONSISTENCY-2026-10-17\n"
    "                    Text(\n"
    "                        text = errorText ?: \"No competitions right now.\",\n"
    "                        color = MutedText,\n"
    "                        fontSize = 14.sp\n"
    "                    )\n"
    "                    com.wisdomtower.academy.ui.auth.SignedOutSignInPill(topPadding = 14.dp)\n"
    "                }\n"
)
new = (
    "                Column(horizontalAlignment = Alignment.CenterHorizontally) { // UX-CONSISTENCY-2026-10-17\n"
    "                    WisdomMessageCard( // S6-msgcard-comp\n"
    "                        message = errorText ?: \"No competitions right now.\",\n"
    "                        isError = errorText != null,\n"
    "                        onRetry = errorText?.let { { reloadKey += 1 } }\n"
    "                    )\n"
    "                    com.wisdomtower.academy.ui.auth.SignedOutSignInPill(topPadding = 14.dp)\n"
    "                }\n"
)
src = swap(src, "competitions empty/error line", old, new)
imp = "import com.wisdomtower.academy.ui.theme.WisdomGlassCard\n"
if "import com.wisdomtower.academy.ui.theme.WisdomMessageCard\n" in src:
    errors.append("WisdomMessageCard import already present (script needs an update)")
src = swap(src, "import", imp, imp + "import com.wisdomtower.academy.ui.theme.WisdomMessageCard\n")

if errors:
    print("ERROR, nothing written:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
FILE.write_text(src, encoding="utf-8")
print("patched: CompetitionsHubScreen.kt")
