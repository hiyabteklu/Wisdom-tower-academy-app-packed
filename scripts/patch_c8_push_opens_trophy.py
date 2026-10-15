#!/usr/bin/env python3
"""C8 slice 5: a push or a notification row whose link is /competitions opens the native trophy screen.

Two edits in MainActivity.kt, nothing else:
 1. navigateTo(): the push path (extractNotificationUrl -> initialNotificationUrl -> navigateTo). A link whose
    path ends in /competitions closes the overlays and sets showCompetitions = true, then returns. Every other
    link behaves exactly as before.
 2. handleGlobalNav(): the notification list rows (NotificationsScreen onOpenUrl). Same rule as a new first
    branch of the existing if-chain (it already calls resetOverlays() first).
Safe to run twice (marker C8-push-trophy). Changes nothing if an anchor is missing or not unique.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "C8-push-trophy"

A1 = "        val targetUrl = url.trim()\n"
ADD1 = (
    "        // C8-push-trophy: a push or notification link ending in /competitions opens the native trophy screen\n"
    "        val competitionsPath = try {\n"
    "            Uri.parse(targetUrl).path.orEmpty().trimEnd('/').lowercase()\n"
    "        } catch (_: Exception) {\n"
    "            \"\"\n"
    "        }\n"
    "        if (competitionsPath.endsWith(\"/competitions\")) {\n"
    "            resetOverlays()\n"
    "            showCompetitions = true\n"
    "            menuExpanded = false\n"
    "            return\n"
    "        }\n"
)

A2 = (
    "        if (pathPart == \"/about\" || pathPart.endsWith(\"/about\")) {\n"
    "            activeDrawerScreen = \"about\"\n"
)
NEW2 = (
    "        if (pathPart.trimEnd('/').lowercase().endsWith(\"/competitions\")) { // C8-push-trophy\n"
    "            showCompetitions = true\n"
    "        } else if (pathPart == \"/about\" || pathPart.endsWith(\"/about\")) {\n"
    "            activeDrawerScreen = \"about\"\n"
)

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)
for name, anchor in (("navigateTo", A1), ("handleGlobalNav", A2)):
    n = src.count(anchor)
    if n != 1:
        print(f"ERROR: anchor for {name} found {n} times (need exactly 1); file not changed")
        sys.exit(1)
src = src.replace(A1, A1 + ADD1)
src = src.replace(A2, NEW2)
FILE.write_text(src, encoding="utf-8")
print("patched")
