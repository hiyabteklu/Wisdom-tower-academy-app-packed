#!/usr/bin/env python3
"""P7: every AI Tutor entry point opens the NATIVE tutor, not the website overlay (owner problem 2, 2026-10-12).

Before: the navigation function `navigateTo`, the WebView link handler (`shouldOverrideUrlLoading`) and the drawer row
"AI Tutor" in MainActivity.kt called openToolOverlay(".../learning?tool=tutor"), the awkward website pop-up. Only the
Learning tab tile opened the native tutor (NativeTutorScreen).
After: those three entry points call NativeToolRequests.requestTutor(), switch to the Learning tab (selectedIndex = 1)
and LearningScreen opens NativeTutorScreen by itself (it watches NativeToolRequests.pendingTutor).
Needs the new file ui/study/NativeToolRequests.kt (already in main). Safe to run twice; all-or-nothing."""
import sys
from pathlib import Path

MAIN = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
LEARN = Path("app/src/main/java/com/wisdomtower/academy/ui/learning/LearningScreen.kt")
MARK = "NativeToolRequests"

REQ = "com.wisdomtower.academy.ui.study.NativeToolRequests.requestTutor()"

main_edits = [
    # 1. navigateTo
    ('        val targetUrl = url.trim()\n        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n',
     '        val targetUrl = url.trim()\n'
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=tutor")) {\n'
     f'            {REQ}\n'
     '            menuExpanded = false\n'
     '            activeStudyUrl = null\n'
     '            selectedIndex = 1\n'
     '            return\n'
     '        }\n'
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n'),
    # 2. WebView link handler
    ('                                    if (u.contains("/learning") && u.contains("tool=")) {\n',
     '                                    if (u.contains("/learning") && u.contains("tool=tutor")) {\n'
     f'                                        {REQ}\n'
     '                                        menuExpanded = false\n'
     '                                        activeStudyUrl = null\n'
     '                                        selectedIndex = 1\n'
     '                                        return true\n'
     '                                    }\n'
     '                                    if (u.contains("/learning") && u.contains("tool=")) {\n'),
    # 3. drawer row
    ('openToolOverlay("https://www.wisdom-tower-academy.live/learning?tool=tutor&overlay=1", "AI Tutor")',
     'navigateTo("https://www.wisdom-tower-academy.live/learning?tool=tutor")'),
]

learn_edits = [
    ('import androidx.compose.runtime.Composable\n',
     'import androidx.compose.runtime.Composable\nimport androidx.compose.runtime.LaunchedEffect\n'),
    ('import com.wisdomtower.academy.ui.study.NativeTutorScreen\n',
     'import com.wisdomtower.academy.ui.study.NativeToolRequests\nimport com.wisdomtower.academy.ui.study.NativeTutorScreen\n'),
    ('    BackHandler(enabled = tutorOpen) { tutorOpen = false }\n',
     '    BackHandler(enabled = tutorOpen) { tutorOpen = false }\n'
     '    // Requests from outside this screen (drawer, website links): open the native tutor as well (P7)\n'
     '    LaunchedEffect(NativeToolRequests.pendingTutor) {\n'
     '        if (NativeToolRequests.pendingTutor) {\n'
     '            NativeToolRequests.pendingTutor = false\n'
     '            tutorOpen = true\n'
     '        }\n'
     '    }\n'),
]

def apply(path, edits):
    src = path.read_text(encoding="utf-8")
    if MARK in src:
        return None, "already patched"
    for old, _ in edits:
        n = src.count(old)
        if n != 1:
            return None, f"ERROR in {path}: anchor found {n} times (need 1): {old[:70]!r}"
    for old, new in edits:
        src = src.replace(old, new)
    return src, "ok"

m, mm = apply(MAIN, main_edits)
l, lm = apply(LEARN, learn_edits)
print(MAIN.name, mm, "|", LEARN.name, lm)
if (m is None and mm.startswith("ERROR")) or (l is None and lm.startswith("ERROR")):
    sys.exit(1)
if m is not None:
    MAIN.write_text(m, encoding="utf-8")
if l is not None:
    LEARN.write_text(l, encoding="utf-8")
print("patched")
