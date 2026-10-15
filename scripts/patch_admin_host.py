#!/usr/bin/env python3
"""ADMIN-host (admin slice A3, part 2): the Admin Console opens in the new AdminConsoleScreen (its own WebView,
no shared chrome scripts) mounted between the app's top bar and bottom navigation, instead of the shared tool
overlay (docs/ADMIN_MOBILE_PLAN.md section 5, docs/SESSION_2026-10-15_ADMIN_A0.md).

What it does to MainActivity.kt (exact anchors, each must match exactly once, safe to run twice, writes nothing
if ANY anchor fails):
 1. adds state `adminConsoleUrl` next to `showNotifications`
 2. clears it in resetOverlays (so a bottom-tab tap or the drawer leaves the admin)
 3. the ADMIN-entry branch of navigateTo sets `adminConsoleUrl` instead of calling openToolOverlay(...)
 4. mounts AdminConsoleScreen as a plain overlay in the Scaffold content (same place and style as the
    notifications overlay, zIndex 18) so the top bar and bottom navigation stay visible
The screen has its own BackHandler (composed later, so it wins over the main one): Back goes back inside the
admin page, then closes it.
NOT tested on a copy of the real MainActivity.kt (the chat tools could not hold the 250 KB file). The anchors were
taken from the code search of main on 2026-10-15 and from scripts/patch_c4_trophy_refresh.py; the script refuses to
write when an anchor is missing or not unique, and the CI build is the real test.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "ADMIN-host"

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

errors = []


def once(text, anchor, label):
    n = text.count(anchor)
    if n != 1:
        errors.append(f"{label}: anchor found {n} times (need exactly 1)")


A_STATE = "    var showNotifications by remember { mutableStateOf(false) } // P15-native-notifications\n"
A_RESET = "        showCompetitions = false // C4-competitions-trophy\n        closeToolOverlay()\n"
A_OPEN = '            openToolOverlay(targetUrl, "Admin Console")\n'
A_OVERLAY = "                // P15-native-notifications: native notifications screen (bell)\n                if (showNotifications) {\n"

for a, l in [(A_STATE, "state"), (A_RESET, "resetOverlays"), (A_OPEN, "admin open call"), (A_OVERLAY, "overlay")]:
    once(src, a, l)
if errors:
    print("ERROR, file not changed:")
    for e in errors:
        print(" -", e)
    sys.exit(1)

new_state = A_STATE + "    var adminConsoleUrl by remember { mutableStateOf<String?>(null) } // " + MARK + "\n"
new_reset = ("        showCompetitions = false // C4-competitions-trophy\n"
             "        adminConsoleUrl = null // " + MARK + "\n"
             "        closeToolOverlay()\n")
new_open = ("            // " + MARK + ": the admin page is hosted by AdminConsoleScreen between the bars, not by the tool overlay\n"
            "            adminConsoleUrl = if (targetUrl.startsWith(\"http\")) targetUrl else "
            "\"https://www.wisdom-tower-academy.live\" + (if (targetUrl.startsWith(\"/\")) \"\" else \"/\") + targetUrl\n")
mount = ("                // " + MARK + ": Admin Console in its own WebView, between the top bar and the bottom navigation\n"
         "                val adminUrlNow = adminConsoleUrl\n"
         "                if (adminUrlNow != null) {\n"
         "                    com.wisdomtower.academy.ui.admin.AdminConsoleScreen(\n"
         "                        url = adminUrlNow,\n"
         "                        onClose = { adminConsoleUrl = null },\n"
         "                        onLeaveToApp = { link ->\n"
         "                            adminConsoleUrl = null\n"
         "                            navigateTo(link)\n"
         "                        },\n"
         "                        modifier = Modifier\n"
         "                            .fillMaxSize()\n"
         "                            .background(WisdomNavy)\n"
         "                            .zIndex(18f)\n"
         "                    )\n"
         "                }\n\n")

out = src
out = out.replace(A_STATE, new_state)
out = out.replace(A_RESET, new_reset)
out = out.replace(A_OPEN, new_open)
out = out.replace(A_OVERLAY, mount + A_OVERLAY)

for k in ("adminConsoleUrl = null // " + MARK, "AdminConsoleScreen(", "var adminConsoleUrl"):
    if out.count(k) != 1:
        print(f"ERROR: sanity check failed for {k}; file not changed")
        sys.exit(1)
FILE.write_text(out, encoding="utf-8")
print("patched")
