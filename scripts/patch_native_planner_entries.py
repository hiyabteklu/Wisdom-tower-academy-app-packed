#!/usr/bin/env python3
"""P10: the Planner opens the NATIVE planner (ui/study/NativePlannerScreen.kt), not the website pop-up
(owner problem 1, 2026-10-12, F7 part 3).

Entry points changed (same as P7, P8 and P9): the Study Tools tile "Planner" in LearningScreen, `navigateTo(...)` and the
WebView link handler in MainActivity.kt for URLs with `/learning` and `tool=plan` (matches `tool=plan` and `tool=planner`),
and the drawer row "Planner". Unlike the timer there is no shell state: the planner only needs the screen, because the
planner reminders (`notifyPlannerTask`) still come from the website page.

REQUIRES P7, P8 and P9 first (the Learning tile edit builds on the line P9 changed; it refuses with an error if one is
missing). Also needs ui/study/NativePlannerState.kt, NativePlannerScreen.kt and the updated NativeToolRequests.kt
(already in `main`). Safe to run twice; all-or-nothing."""
import sys
from pathlib import Path

MAIN = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
LEARN = Path("app/src/main/java/com/wisdomtower/academy/ui/learning/LearningScreen.kt")

REQ = "com.wisdomtower.academy.ui.study.NativeToolRequests.requestPlanner()"

main_edits = [
    # 1. navigateTo(...)
    ('        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n',
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=plan")) {\n'
     f'            {REQ}\n'
     '            menuExpanded = false\n'
     '            activeStudyUrl = null\n'
     '            selectedIndex = 1\n'
     '            return\n'
     '        }\n'
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n'),
    # 2. WebView link handler
    ('                                    if (u.contains("/learning") && u.contains("tool=")) {\n',
     '                                    if (u.contains("/learning") && u.contains("tool=plan")) {\n'
     f'                                        {REQ}\n'
     '                                        menuExpanded = false\n'
     '                                        activeStudyUrl = null\n'
     '                                        selectedIndex = 1\n'
     '                                        return true\n'
     '                                    }\n'
     '                                    if (u.contains("/learning") && u.contains("tool=")) {\n'),
    # 3. drawer row "Planner"
    ('openToolOverlay("https://www.wisdom-tower-academy.live/learning?tool=planner&overlay=1", "Study Planner")',
     'navigateTo("https://www.wisdom-tower-academy.live/learning?tool=planner")'),
]

learn_edits = [
    ('import com.wisdomtower.academy.ui.study.NativeToolRequests\n',
     'import com.wisdomtower.academy.ui.study.NativePlannerScreen\nimport com.wisdomtower.academy.ui.study.NativeToolRequests\n'),
    ('    BackHandler(enabled = tutorOpen) { tutorOpen = false }\n',
     '    // Native study planner (P10): the "Planner" tile and requests from outside show it in place of this screen\n'
     '    var plannerOpen by remember { mutableStateOf(false) }\n'
     '    BackHandler(enabled = plannerOpen) { plannerOpen = false }\n'
     '    LaunchedEffect(NativeToolRequests.pendingPlanner) {\n'
     '        if (NativeToolRequests.pendingPlanner) {\n'
     '            NativeToolRequests.pendingPlanner = false\n'
     '            plannerOpen = true\n'
     '        }\n'
     '    }\n'
     '    if (plannerOpen) {\n'
     '        NativePlannerScreen(onBack = { plannerOpen = false }, modifier = modifier)\n'
     '        return\n'
     '    }\n'
     '    BackHandler(enabled = tutorOpen) { tutorOpen = false }\n'),
    # Row 1 tile click: the line P9 produced
    ('onClick = { if (tile.key == "timer") { timerOpen = true } else { onOpenTool(tile.url) } }',
     'onClick = { if (tile.key == "timer") { timerOpen = true } else if (tile.key == "planner") { plannerOpen = true } else { onOpenTool(tile.url) } }'),
]


def apply(path, edits, mark, needs, hint):
    src = path.read_text(encoding="utf-8")
    if mark in src:
        return None, "already patched"
    for need in needs:
        if need not in src:
            return None, f"ERROR in {path}: {hint} (marker {need!r} missing)"
    for old, _ in edits:
        n = src.count(old)
        if n != 1:
            return None, f"ERROR in {path}: anchor found {n} times (need 1): {old[:70]!r}"
    for old, new in edits:
        src = src.replace(old, new)
    return src, "ok"


m, mm = apply(MAIN, main_edits, "requestPlanner", ["requestCalculator", "requestTutor", "requestTimer"],
              "apply P7, P8 and P9 first")
l, lm = apply(LEARN, learn_edits, "plannerOpen", ["calculatorOpen", "NativeToolRequests", "timerOpen"],
              "apply P7, P8 and P9 first")
print(MAIN.name, mm, "|", LEARN.name, lm)
if mm.startswith("ERROR") or lm.startswith("ERROR"):
    sys.exit(1)
if m is not None:
    MAIN.write_text(m, encoding="utf-8")
if l is not None:
    LEARN.write_text(l, encoding="utf-8")
print("patched")
