#!/usr/bin/env python3
"""P9: the Timer opens the NATIVE timer (ui/study/NativeTimerScreen.kt), not the website pop-up
(owner problem 1, 2026-10-12, F7 part 2), and the app shell follows the native timer.

Entry points changed (same as P7 and P8): the Study Tools tile "Timer" in LearningScreen, `navigateTo(...)` and the WebView
link handler in MainActivity.kt for URLs with `/learning` and `tool=time` (also matches `tool=timer`), the drawer row
"Timer", and the "Open" button of the small timer dialog (TimerControlDialog).

Shell changes in MainActivity.kt (MainScreen), all about the native timer state `NativeFocusTimer`:
  1. a ticker (every 250 ms while the timer runs) so the timer keeps counting on every screen, plus loading the saved state;
  2. a mirror of the native timer into the shell variables, so the small top-bar timer indicator shows it;
  3. the "session finished" notification + toast, once, when the native timer reaches zero;
  4. the shell's own 1-second countdown does not run while the native timer runs (no double notification);
  5. the website's JS bridge `syncStudyTimer` is ignored while the native timer is active (the bridge reports "no timer"
     every second and would switch the indicator off);
  6. the dialog's Pause / Resume and the Stop flow also act on the native timer.

REQUIRES P7 and P8 first (it uses NativeToolRequests and the `calculatorOpen` block of LearningScreen). Also needs the files
ui/study/NativeFocusTimer.kt, NativeTimerScreen.kt and the updated NativeToolRequests.kt (already in `main`).
Safe to run twice; all-or-nothing."""
import sys
from pathlib import Path

MAIN = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
LEARN = Path("app/src/main/java/com/wisdomtower/academy/ui/learning/LearningScreen.kt")

NT = "com.wisdomtower.academy.ui.study.NativeFocusTimer"
REQ = "com.wisdomtower.academy.ui.study.NativeToolRequests.requestTimer()"

SHELL_BLOCK = (
    "    // Native Focus Timer (P9): ticked here so it keeps counting on every screen, the top-bar indicator follows it,\n"
    "    // and the \"session finished\" notification is sent once when it reaches zero (NativeFocusTimer = ui/study).\n"
    f"    val nativeTimer = {NT}\n"
    "    val completionsAtEnter = remember { nativeTimer.completions }\n"
    "    var nativeMirrorOn by remember { mutableStateOf(false) }\n"
    "    LaunchedEffect(Unit) { nativeTimer.init(context) }\n"
    "    LaunchedEffect(nativeTimer.running) {\n"
    "        while (nativeTimer.running) {\n"
    "            nativeTimer.tick()\n"
    "            delay(250L)\n"
    "        }\n"
    "    }\n"
    "    LaunchedEffect(nativeTimer.running, nativeTimer.seconds, nativeTimer.totalSec) {\n"
    "        val secs = nativeTimer.seconds\n"
    "        val total = nativeTimer.totalSec\n"
    "        if (nativeTimer.running) {\n"
    "            nativeMirrorOn = true\n"
    "            isTimerRunning = true\n"
    "            isTimerPaused = false\n"
    "            timerRemainingSeconds = secs\n"
    "            timerTotalSeconds = total\n"
    "            isTimerDismissed = false\n"
    "        } else if (secs in 1 until total) {\n"
    "            nativeMirrorOn = true\n"
    "            isTimerRunning = false\n"
    "            isTimerPaused = true\n"
    "            timerRemainingSeconds = secs\n"
    "            timerTotalSeconds = total\n"
    "            isTimerDismissed = false\n"
    "        } else if (nativeMirrorOn) {\n"
    "            nativeMirrorOn = false\n"
    "            isTimerRunning = false\n"
    "            isTimerPaused = false\n"
    "            timerRemainingSeconds = 0\n"
    "        }\n"
    "    }\n"
    "    LaunchedEffect(nativeTimer.completions) {\n"
    "        if (nativeTimer.completions > completionsAtEnter) {\n"
    "            AcademyNotificationManager.notifyStudyTimerCompleted(context)\n"
    "            Toast.makeText(context, AcademyNotificationManager.TIMER_REWARDING_MESSAGES.random(), Toast.LENGTH_LONG).show()\n"
    "        }\n"
    "    }\n"
    "\n"
)

main_edits = [
    # 1. navigateTo(...)
    ('        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n',
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=time")) {\n'
     f'            {REQ}\n'
     '            menuExpanded = false\n'
     '            activeStudyUrl = null\n'
     '            selectedIndex = 1\n'
     '            return\n'
     '        }\n'
     '        if (targetUrl.contains("/learning") && targetUrl.contains("tool=")) {\n'),
    # 2. WebView link handler
    ('                                    if (u.contains("/learning") && u.contains("tool=")) {\n',
     '                                    if (u.contains("/learning") && u.contains("tool=time")) {\n'
     f'                                        {REQ}\n'
     '                                        menuExpanded = false\n'
     '                                        activeStudyUrl = null\n'
     '                                        selectedIndex = 1\n'
     '                                        return true\n'
     '                                    }\n'
     '                                    if (u.contains("/learning") && u.contains("tool=")) {\n'),
    # 3. drawer row "Timer"
    ('openToolOverlay("https://www.wisdom-tower-academy.live/learning?tool=timer&overlay=1", "Study Timer")',
     'navigateTo("https://www.wisdom-tower-academy.live/learning?tool=timer")'),
    # 4. "Open" button of the small timer dialog
    ('openToolOverlay("https://www.wisdom-tower-academy.live/learning?tool=timer", "Study Timer")',
     'navigateTo("https://www.wisdom-tower-academy.live/learning?tool=timer")'),
    # 5. ticker + mirror + notification (before the next shell variable declaration)
    ('    var lastResumeRefreshAt by remember { mutableLongStateOf(0L) }\n',
     SHELL_BLOCK + '    var lastResumeRefreshAt by remember { mutableLongStateOf(0L) }\n'),
    # 6. the shell's own countdown stays off while the native timer runs
    ('    LaunchedEffect(isTimerRunning, timerRemainingSeconds) {\n'
     '        if (isTimerRunning && timerRemainingSeconds > 0) {\n',
     '    LaunchedEffect(isTimerRunning, timerRemainingSeconds) {\n'
     f'        if (isTimerRunning && timerRemainingSeconds > 0 && !{NT}.running) {{\n'),
    # 7. Stop flow also resets the native timer
    ('        val wasActive = isTimerRunning || isTimerPaused || timerRemainingSeconds > 0\n',
     '        val wasActive = isTimerRunning || isTimerPaused || timerRemainingSeconds > 0\n'
     f'        {NT}.reset()\n'),
    # 8. website JS bridge is ignored while the native timer is active
    ('                                    mainHandler.post {\n'
     '                                        val wasRunning = isTimerRunning\n',
     '                                    mainHandler.post {\n'
     f'                                        if ({NT}.isActive()) return@post\n'
     '                                        val wasRunning = isTimerRunning\n'),
    # 9. dialog Pause / Resume acts on the native timer first
    ('                    if (isTimerRunning) {\n'
     '                        isTimerRunning = false\n'
     '                        isTimerPaused = true\n',
     f'                    if ({NT}.isActive()) {{\n'
     f'                        {NT}.togglePlayPause()\n'
     '                    } else if (isTimerRunning) {\n'
     '                        isTimerRunning = false\n'
     '                        isTimerPaused = true\n'),
]

learn_edits = [
    ('import com.wisdomtower.academy.ui.study.NativeToolRequests\n',
     'import com.wisdomtower.academy.ui.study.NativeTimerScreen\nimport com.wisdomtower.academy.ui.study.NativeToolRequests\n'),
    ('    BackHandler(enabled = tutorOpen) { tutorOpen = false }\n',
     '    // Native focus timer (P9): the "Timer" tile and requests from outside show it in place of this screen\n'
     '    var timerOpen by remember { mutableStateOf(false) }\n'
     '    BackHandler(enabled = timerOpen) { timerOpen = false }\n'
     '    LaunchedEffect(NativeToolRequests.pendingTimer) {\n'
     '        if (NativeToolRequests.pendingTimer) {\n'
     '            NativeToolRequests.pendingTimer = false\n'
     '            timerOpen = true\n'
     '        }\n'
     '    }\n'
     '    if (timerOpen) {\n'
     '        NativeTimerScreen(onBack = { timerOpen = false }, modifier = modifier)\n'
     '        return\n'
     '    }\n'
     '    BackHandler(enabled = tutorOpen) { tutorOpen = false }\n'),
    ('onClick = { onOpenTool(tile.url) }',
     'onClick = { if (tile.key == "timer") { timerOpen = true } else { onOpenTool(tile.url) } }'),
]


def apply(path, edits, mark, needs):
    src = path.read_text(encoding="utf-8")
    if mark in src:
        return None, "already patched"
    for need in needs:
        if need not in src:
            return None, f"ERROR in {path}: apply P7 and P8 first (marker {need!r} missing)"
    for old, _ in edits:
        n = src.count(old)
        if n != 1:
            return None, f"ERROR in {path}: anchor found {n} times (need 1): {old[:70]!r}"
    for old, new in edits:
        src = src.replace(old, new)
    return src, "ok"


m, mm = apply(MAIN, main_edits, "NativeFocusTimer", ["requestCalculator", "requestTutor"])
l, lm = apply(LEARN, learn_edits, "timerOpen", ["calculatorOpen", "NativeToolRequests"])
print(MAIN.name, mm, "|", LEARN.name, lm)
if mm.startswith("ERROR") or lm.startswith("ERROR"):
    sys.exit(1)
if m is not None:
    MAIN.write_text(m, encoding="utf-8")
if l is not None:
    LEARN.write_text(l, encoding="utf-8")
print("patched")
