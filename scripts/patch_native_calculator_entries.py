#!/usr/bin/env python3
"""P8: the Calculator opens the NATIVE calculator (ui/study/NativeCalculatorScreen.kt), not the website pop-up
(owner problem 1, 2026-10-12, F7 part 1).

Entry points changed (same three as P7): the Study Tools tile "Calculator" in LearningScreen, `navigateTo(...)` and the
WebView link handler in MainActivity.kt for URLs with `/learning` and `tool=calc`, and the drawer row "Calculator".
REQUIRES P7 first (scripts/patch_native_tutor_entries.py): it uses NativeToolRequests and its imports.
Safe to run twice; all-or-nothing."""
import sys
from pathlib import Path

MAIN = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
LEARN = Path("app/src/main/java/com/wisdomtower/academy/ui/learning/LearningScreen.kt")

REQ = "com.wisdomtower.academy.ui.study.NativeToolRequests.requestCalculator()"

main_edits = [
    ('        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n',
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=calc")) {\n'
     f'            {REQ}\n'
     '            menuExpanded = false\n'
     '            activeStudyUrl = null\n'
     '            selectedIndex = 1\n'
     '            return\n'
     '        }\n'
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n'),
    ('                                    if (u.contains("/learning") && u.contains("tool=")) {\n',
     '                                    if (u.contains("/learning") && u.contains("tool=calc")) {\n'
     f'                                        {REQ}\n'
     '                                        menuExpanded = false\n'
     '                                        activeStudyUrl = null\n'
     '                                        selectedIndex = 1\n'
     '                                        return true\n'
     '                                    }\n'
     '                                    if (u.contains("/learning") && u.contains("tool=")) {\n'),
    ('openToolOverlay("https://www.wisdom-tower-academy.live/learning?tool=calculator&overlay=1", "Scientific Calculator")',
     'navigateTo("https://www.wisdom-tower-academy.live/learning?tool=calculator")'),
]

learn_edits = [
    ('import com.wisdomtower.academy.ui.study.NativeToolRequests\n',
     'import com.wisdomtower.academy.ui.study.NativeCalculatorScreen\nimport com.wisdomtower.academy.ui.study.NativeToolRequests\n'),
    ('    var tutorOpen by remember { mutableStateOf(false) }\n',
     '    var tutorOpen by remember { mutableStateOf(false) }\n'
     '    // Native calculator (P8): the "Calculator" tile and requests from outside show it in place of this screen\n'
     '    var calculatorOpen by remember { mutableStateOf(false) }\n'
     '    BackHandler(enabled = calculatorOpen) { calculatorOpen = false }\n'
     '    LaunchedEffect(NativeToolRequests.pendingCalculator) {\n'
     '        if (NativeToolRequests.pendingCalculator) {\n'
     '            NativeToolRequests.pendingCalculator = false\n'
     '            calculatorOpen = true\n'
     '        }\n'
     '    }\n'
     '    if (calculatorOpen) {\n'
     '        NativeCalculatorScreen(onBack = { calculatorOpen = false }, modifier = modifier)\n'
     '        return\n'
     '    }\n'),
    ('} else if (tile.key == "tutor") {',
     '} else if (tile.key == "calculator") {\n'
     '                                                    calculatorOpen = true\n'
     '                                                } else if (tile.key == "tutor") {'),
]

def apply(path, edits, mark, need):
    src = path.read_text(encoding="utf-8")
    if mark in src:
        return None, "already patched"
    if need not in src:
        return None, f"ERROR in {path}: apply P7 first (marker {need!r} missing)"
    for old, _ in edits:
        n = src.count(old)
        if n != 1:
            return None, f"ERROR in {path}: anchor found {n} times (need 1): {old[:70]!r}"
    for old, new in edits:
        src = src.replace(old, new)
    return src, "ok"

m, mm = apply(MAIN, main_edits, "requestCalculator", "NativeToolRequests")
l, lm = apply(LEARN, learn_edits, "calculatorOpen", "NativeToolRequests")
print(MAIN.name, mm, "|", LEARN.name, lm)
if mm.startswith("ERROR") or lm.startswith("ERROR"):
    sys.exit(1)
if m is not None:
    MAIN.write_text(m, encoding="utf-8")
if l is not None:
    LEARN.write_text(l, encoding="utf-8")
print("patched")
