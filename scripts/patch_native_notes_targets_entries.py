#!/usr/bin/env python3
"""P11: website links and drawer rows for Notebook and Targets open the NATIVE screens (F7 part 4, 2026-10-12).

The Learning tiles "Notebook" and "Targets" already open the native screens (LearningScreen.kt, resent whole, no patch
needed). This patch covers the other entry points in MainActivity.kt, same as P7 to P10: (1) navigateTo(...) and (2) the
WebView link handler for URLs with `/learning` and `tool=note...` (notes, note, notebook) or `tool=goal...` / `tool=target...`
(goals, goal, targets, target), and (3) any drawer row that opens `learning?tool=notes|goals|... &overlay=1` through
openToolOverlay: it is turned into navigateTo(...) without the overlay flag (zero or more rows may exist; none is fine).

REQUIRES P7 to P10 (checks for requestPlanner) and ui/study/NativeNotebookScreen.kt, NativeTargetsScreen.kt and the updated
NativeToolRequests.kt (already in `main`). Safe to run twice; all-or-nothing."""
import re
import sys
from pathlib import Path

MAIN = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
REQ_N = "com.wisdomtower.academy.ui.study.NativeToolRequests.requestNotebook()"
REQ_T = "com.wisdomtower.academy.ui.study.NativeToolRequests.requestTargets()"

A1 = '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n'
A2 = '                                    if (u.contains("/learning") && u.contains("tool=")) {\n'

NEW1 = (
    '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=note")) {\n'
    f'            {REQ_N}\n'
    '            menuExpanded = false\n'
    '            activeStudyUrl = null\n'
    '            selectedIndex = 1\n'
    '            return\n'
    '        }\n'
    '        if (targetUrl.contains("/learning") && (targetUrl.contains("tool=goal") || targetUrl.contains("tool=target"))) {\n'
    f'            {REQ_T}\n'
    '            menuExpanded = false\n'
    '            activeStudyUrl = null\n'
    '            selectedIndex = 1\n'
    '            return\n'
    '        }\n'
)
NEW2 = (
    '                                    if (u.contains("/learning") && u.contains("tool=note")) {\n'
    f'                                        {REQ_N}\n'
    '                                        menuExpanded = false\n'
    '                                        activeStudyUrl = null\n'
    '                                        selectedIndex = 1\n'
    '                                        return true\n'
    '                                    }\n'
    '                                    if (u.contains("/learning") && (u.contains("tool=goal") || u.contains("tool=target"))) {\n'
    f'                                        {REQ_T}\n'
    '                                        menuExpanded = false\n'
    '                                        activeStudyUrl = null\n'
    '                                        selectedIndex = 1\n'
    '                                        return true\n'
    '                                    }\n'
)

DRAWER = re.compile(
    r'openToolOverlay\("https://www\.wisdom-tower-academy\.live/learning\?tool=(notes|note|notebook|goals|goal|targets|target)&overlay=1",\s*"[^"]*"\)'
)

src = MAIN.read_text(encoding="utf-8")
if "requestNotebook" in src:
    print("already patched, nothing to do")
    sys.exit(0)
if "requestPlanner" not in src:
    print("ERROR: apply P7 to P10 first (marker 'requestPlanner' missing); file not changed")
    sys.exit(1)
for anchor in (A1, A2):
    n = src.count(anchor)
    if n != 1:
        print(f"ERROR: anchor found {n} times (need exactly 1): {anchor.strip()[:70]!r}; file not changed")
        sys.exit(1)
src = src.replace(A1, NEW1 + A1).replace(A2, NEW2 + A2)
src, rows = DRAWER.subn(lambda m: f'navigateTo("https://www.wisdom-tower-academy.live/learning?tool={m.group(1)}")', src)
MAIN.write_text(src, encoding="utf-8")
print(f"patched (drawer rows changed: {rows})")
