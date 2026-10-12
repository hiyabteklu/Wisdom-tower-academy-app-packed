#!/usr/bin/env python3
"""P15 (N12): the top-bar bell opens the NATIVE notifications screen instead of the website page /notifications.

Edits MainActivity.kt (7 anchors, each must appear EXACTLY once, otherwise nothing is written; safe to run twice):
 1. import NotificationsScreen
 2. state `showNotifications`
 3. NotificationRepository.init(this) in onCreate (loads the ids the student already read)
 4. resetOverlays() also closes the notifications screen
 5. back button closes the notifications screen first
 6. bell onClick: reset overlays + showNotifications = true (no longer marks everything read on tap, no website page)
 7. the overlay itself (zIndex 17, between the study workspace and the drawer screens)
Needs the new files ui/notifications/NotificationsScreen.kt and the updated data/repository/NotificationRepository.kt.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK = "P15-native-notifications"

EDITS = [
    (
        "import",
        "import com.wisdomtower.academy.data.auth.AuthStateManager\n",
        "import com.wisdomtower.academy.data.auth.AuthStateManager\n"
        "import com.wisdomtower.academy.ui.notifications.NotificationsScreen\n",
    ),
    (
        "state",
        "    var activeDrawerScreen by remember { mutableStateOf<String?>(null) }\n",
        "    var activeDrawerScreen by remember { mutableStateOf<String?>(null) }\n"
        "    var showNotifications by remember { mutableStateOf(false) } // P15-native-notifications\n",
    ),
    (
        "onCreate init",
        "        AuthStateManager.init(this)\n        NotificationRepository.refreshNotifications()\n",
        "        AuthStateManager.init(this)\n        NotificationRepository.init(this) // P15-native-notifications\n"
        "        NotificationRepository.refreshNotifications()\n",
    ),
    (
        "resetOverlays",
        "        activeDrawerScreen = null\n        closeToolOverlay()\n        menuExpanded = false\n    }\n",
        "        activeDrawerScreen = null\n        showNotifications = false // P15-native-notifications\n"
        "        closeToolOverlay()\n        menuExpanded = false\n    }\n",
    ),
    (
        "back handler",
        "        if (activeDrawerScreen != null) {\n            activeDrawerScreen = null\n            return@BackHandler\n        }\n",
        "        if (showNotifications) { // P15-native-notifications\n            showNotifications = false\n            return@BackHandler\n        }\n"
        "        if (activeDrawerScreen != null) {\n            activeDrawerScreen = null\n            return@BackHandler\n        }\n",
    ),
    (
        "bell onClick",
        '''                                    requestNotificationPermission()
                                    NotificationRepository.markAllRead()
                                    // S12-P2: show the page (tab 1 + activeStudyUrl makes the WebView visible)
                                    val notifUrl = "https://www.wisdom-tower-academy.live/notifications"
                                    resetOverlays()
                                    activeStudyUrl = notifUrl
                                    navigateTo(notifUrl, 1)
''',
        '''                                    requestNotificationPermission()
                                    // P15-native-notifications: native screen; items are marked read when tapped
                                    resetOverlays()
                                    showNotifications = true
''',
    ),
    (
        "overlay",
        "                // Native Drawer Screens (About, Contact, FAQ, Privacy, Terms)\n",
        '''                // P15-native-notifications: native notifications screen (bell)
                if (showNotifications) {
                    NotificationsScreen(
                        onBack = { showNotifications = false },
                        onOpenUrl = handleGlobalNav,
                        onSignIn = {
                            resetOverlays()
                            selectedIndex = 3
                        },
                        modifier = Modifier
                            .fillMaxSize()
                            .background(WisdomNavy)
                            .zIndex(17f)
                    )
                }

                // Native Drawer Screens (About, Contact, FAQ, Privacy, Terms)
''',
    ),
]

src = FILE.read_text(encoding="utf-8")
if MARK in src:
    # all-or-nothing: if the marker exists, check that every edit is there
    missing = [n for n, _, new in EDITS if new not in src]
    if missing:
        print("ERROR: partly patched, missing:", missing, "- fix by hand, nothing changed"); sys.exit(1)
    print("already patched, nothing to do"); sys.exit(0)

for name, old, _ in EDITS:
    n = src.count(old)
    if n != 1:
        print(f"ERROR: anchor '{name}' found {n} times (need exactly 1); nothing changed"); sys.exit(1)

before = src.count("{") - src.count("}")
for _, old, new in EDITS:
    src = src.replace(old, new, 1)
after = src.count("{") - src.count("}")
if before != after:
    print("ERROR: brace balance changed; nothing written"); sys.exit(1)
FILE.write_text(src, encoding="utf-8")
print("patched (7 edits)")
