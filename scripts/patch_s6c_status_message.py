#!/usr/bin/env python3
"""S6 part 2b (docs/PLAY_STORE_UI_PLAN.md): the Your status screen uses the shared WisdomMessageCard.

ui/study/NativeStatusScreen.kt: the two message panels (signed out; load failed) become WisdomMessageCard.
  - signed out: glass card with the same sentence and the shared Sign in pill inside it (showSignIn = true).
  - load failed: red card with the same text; Retry is now the shared cyan Retry button (48 dp, announced as a button).
Same words as before. The loading spinner and the data panels are NOT touched. Needs ui/theme/WisdomMessageCard.kt (on main).
Safe to run twice (marker S6-msgcard-status). If an anchor is not found exactly once, NOTHING is written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/study/NativeStatusScreen.kt")
MARK = "S6-msgcard-status"
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


old_out = (
    "                StPanel(borderColor = Color.White.copy(alpha = 0.10f)) {\n"
    "                    Text(\n"
    "                        \"Sign in or create an account to sync your study notes, targets, and course progress.\",\n"
    "                        fontSize = 13.sp,\n"
    "                        color = StSlate300,\n"
    "                        lineHeight = 19.sp\n"
    "                    )\n"
    "                    com.wisdomtower.academy.ui.auth.SignInPill() // UX-CONSISTENCY-2026-10-17\n"
    "                }\n"
)
new_out = (
    "                WisdomMessageCard( // S6-msgcard-status\n"
    "                    message = \"Sign in or create an account to sync your study notes, targets, and course progress.\",\n"
    "                    showSignIn = true\n"
    "                )\n"
)
src = swap(src, "signed-out panel", old_out, new_out)

old_fail = (
    "                StPanel(borderColor = StRose.copy(alpha = 0.30f)) {\n"
    "                    Text(\n"
    "                        errorText ?: \"Could not load your study records. Check your internet connection and try again.\",\n"
    "                        fontSize = 13.sp,\n"
    "                        color = StSlate300,\n"
    "                        lineHeight = 19.sp\n"
    "                    )\n"
    "                    Box(\n"
    "                        modifier = Modifier\n"
    "                            .clip(RoundedCornerShape(50))\n"
    "                            .background(Color.White)\n"
    "                            .clickable { reloadKey += 1 }\n"
    "                            .padding(horizontal = 20.dp, vertical = 8.dp)\n"
    "                    ) {\n"
    "                        Text(\"Retry\", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF020617))\n"
    "                    }\n"
    "                }\n"
)
new_fail = (
    "                WisdomMessageCard( // S6-msgcard-status\n"
    "                    message = errorText ?: \"Could not load your study records. Check your internet connection and try again.\",\n"
    "                    isError = true,\n"
    "                    onRetry = { reloadKey += 1 }\n"
    "                )\n"
)
src = swap(src, "load-failed panel", old_fail, new_fail)

imp = "import com.wisdomtower.academy.ui.theme.AtmosphereBackground\n"
if "import com.wisdomtower.academy.ui.theme.WisdomMessageCard\n" in src:
    errors.append("WisdomMessageCard import already present (script needs an update)")
src = swap(src, "import", imp, imp + "import com.wisdomtower.academy.ui.theme.WisdomMessageCard\n")

if errors:
    print("ERROR, nothing written:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
FILE.write_text(src, encoding="utf-8")
print("patched: NativeStatusScreen.kt")
