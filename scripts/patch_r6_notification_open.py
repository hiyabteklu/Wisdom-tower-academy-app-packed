#!/usr/bin/env python3
"""Notifications v2, slice R6: a push link /notifications?open=<id> opens the notifications screen with that reader open.

Four small edits in MainActivity.kt, nothing else:
 1. New state `notificationOpenId` next to `showNotifications`.
 2. resetOverlays(): clears `notificationOpenId` next to `showNotifications = false`.
 3. navigateTo() (the push path): a link whose path ends in /notifications closes the overlays, stores the `open`
    query value and shows the notifications screen, then returns. Inserted before the C8 /competitions block.
 4. The NotificationsScreen call: passes `openId = notificationOpenId` and clears it when the screen is closed.
Every other link behaves exactly as before. Requires the C8 push patch (anchor of edit 3) to be applied first.
Safe to run twice (marker R6-notif-open). Changes nothing if an anchor is missing or not unique.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "R6-notif-open"

EDITS = []

# 1. state
A1 = "    var showNotifications by remember { mutableStateOf(false) } // P15-native-notifications\n"
EDITS.append(("state", A1, A1 +
    "    var notificationOpenId by remember { mutableStateOf<String?>(null) } // R6-notif-open\n"))

# 2. resetOverlays
A2 = "        showNotifications = false // P15-native-notifications\n"
EDITS.append(("resetOverlays", A2, A2 +
    "        notificationOpenId = null // R6-notif-open\n"))

# 3. navigateTo (push path), before the C8 block
A3 = "        // C8-push-trophy: a push or notification link ending in /competitions opens the native trophy screen\n"
ADD3 = (
    "        // R6-notif-open: a link ending in /notifications opens the native notifications screen (reader when ?open=<id>)\n"
    "        val notifUri = try {\n"
    "            Uri.parse(targetUrl)\n"
    "        } catch (_: Exception) {\n"
    "            null\n"
    "        }\n"
    "        if (notifUri != null && notifUri.path.orEmpty().trimEnd('/').lowercase().endsWith(\"/notifications\")) {\n"
    "            resetOverlays()\n"
    "            notificationOpenId = notifUri.getQueryParameter(\"open\")\n"
    "            showNotifications = true\n"
    "            menuExpanded = false\n"
    "            return\n"
    "        }\n"
)
EDITS.append(("navigateTo", A3, ADD3 + A3))

# 4. the screen call
A4 = (
    "                    NotificationsScreen(\n"
    "                        onBack = { showNotifications = false },\n"
)
EDITS.append(("screen call", A4,
    "                    NotificationsScreen(\n"
    "                        onBack = { showNotifications = false; notificationOpenId = null }, // R6-notif-open\n"
    "                        openId = notificationOpenId,\n"))

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)
for name, anchor, _ in EDITS:
    n = src.count(anchor)
    if n != 1:
        print(f"ERROR: anchor for {name} found {n} times (need exactly 1); file not changed")
        sys.exit(1)
for _, anchor, new in EDITS:
    src = src.replace(anchor, new)
FILE.write_text(src, encoding="utf-8")
print("patched")
