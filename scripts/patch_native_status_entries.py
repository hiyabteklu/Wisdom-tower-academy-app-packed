#!/usr/bin/env python3
"""P12: website links and drawer rows for "Your status" open the NATIVE screen (F7 part 5, 2026-10-12).

The Learning tile "Your status" already opens the native screen (LearningScreen.kt). This patch covers the other entry
points, same as P7 to P11: (1) in MainActivity.kt, navigateTo(...) and the WebView link handler for URLs with `/learning`
and `tool=analytic...` or `tool=status...`; any drawer row that opens `learning?tool=analytics&overlay=1` through
openToolOverlay becomes navigateTo(...) (zero or more rows; none is fine). (2) in LearningScreen.kt, a LaunchedEffect that
watches NativeToolRequests.pendingStatus and opens the screen (also fixes the case where the Learning tab is not shown yet).

REQUIRES P11 (checks for requestTargets in MainActivity.kt) and NativeToolRequests.requestStatus (already in `main`).
Safe to run twice; all-or-nothing (both files are written only if every anchor matches exactly once)."""
import re
import sys
from pathlib import Path

MAIN = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
LEARN = Path("app/src/main/java/com/wisdomtower/academy/ui/learning/LearningScreen.kt")
REQ = "com.wisdomtower.academy.ui.study.NativeToolRequests.requestStatus()"

A1 = '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n'
A2 = '                                    if (u.contains("/learning") && u.contains("tool=")) {\n'
NEW1 = (
    '        if (targetUrl.contains("/learning") && (targetUrl.contains("tool=analytic") || targetUrl.contains("tool=status"))) {\n'
    f'            {REQ}\n'
    '            menuExpanded = false\n'
    '            activeStudyUrl = null\n'
    '            selectedIndex = 1\n'
    '            return\n'
    '        }\n'
)
NEW2 = (
    '                                    if (u.contains("/learning") && (u.contains("tool=analytic") || u.contains("tool=status"))) {\n'
    f'                                        {REQ}\n'
    '                                        menuExpanded = false\n'
    '                                        activeStudyUrl = null\n'
    '                                        selectedIndex = 1\n'
    '                                        return true\n'
    '                                    }\n'
)
DRAWER = re.compile(
    r'openToolOverlay\("https://www\.wisdom-tower-academy\.live/learning\?tool=(analytics|analytic|status)&overlay=1",\s*"[^"]*"\)'
)
L_ANCHOR = '    BackHandler(enabled = statusOpen) { statusOpen = false }\n'
L_NEW = (
    L_ANCHOR
    + '    LaunchedEffect(NativeToolRequests.pendingStatus) {\n'
    + '        if (NativeToolRequests.pendingStatus) {\n'
    + '            NativeToolRequests.pendingStatus = false\n'
    + '            statusOpen = true\n'
    + '        }\n'
    + '    }\n'
)

main_src = MAIN.read_text(encoding="utf-8")
learn_src = LEARN.read_text(encoding="utf-8")
if "requestStatus" in main_src and "pendingStatus" in learn_src:
    print("already patched, nothing to do")
    sys.exit(0)
if "requestTargets" not in main_src:
    print("ERROR: apply P11 first (marker 'requestTargets' missing); files not changed")
    sys.exit(1)
for name, text, anchor in (("MainActivity A1", main_src, A1), ("MainActivity A2", main_src, A2), ("LearningScreen", learn_src, L_ANCHOR)):
    n = text.count(anchor)
    if n != 1:
        print(f"ERROR: anchor {name} found {n} times (need exactly 1); files not changed")
        sys.exit(1)
main_src = main_src.replace(A1, NEW1 + A1).replace(A2, NEW2 + A2)
main_src, rows = DRAWER.subn(lambda m: f'navigateTo("https://www.wisdom-tower-academy.live/learning?tool={m.group(1)}")', main_src)
learn_src = learn_src.replace(L_ANCHOR, L_NEW)
MAIN.write_text(main_src, encoding="utf-8")
LEARN.write_text(learn_src, encoding="utf-8")
print(f"patched (drawer rows changed: {rows})")
