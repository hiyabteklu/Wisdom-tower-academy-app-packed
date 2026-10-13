#!/usr/bin/env python3
"""One place for notification settings (owner request 2026-10-13, session log docs/SESSION_2026-10-13_K.md).

Before: two screens with notification switches. The drawer dialog "Notification Settings" had 4 REAL switches
(AcademyNotificationManager: timer, planner, goals, announcements). Settings > "Notifications & Study Alerts" had 3
switches stored under notif_daily_study / notif_exams / notif_weekly_digest that nothing in the app read.

After:
 - SettingsScreen.kt: the two switches that were unique to the drawer (Study Timer Rewards, Planner & Deadlines) are
   added to the Settings section; "Daily Study Goal Reminder" is now the real goal-nudge switch and "Exam & Syllabus
   Updates" is now the real announcements switch (same keys the drawer used, so old choices are kept).
   "Weekly Performance Digest" is unchanged (nothing in the app sends a digest yet).
 - MainActivity.kt: the drawer row + heading "NOTIFICATIONS & PREFERENCES", the dialog and its helper are removed; the
   website bridge openNotificationSettings() now opens the Settings tab.
Only the standard library. Every anchor must match exactly once, otherwise NOTHING is written. Safe to run twice.
"""
import subprocess
import sys
from pathlib import Path

MAIN = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
SETTINGS = Path("app/src/main/java/com/wisdomtower/academy/ui/settings/SettingsScreen.kt")


def die(msg):
    print("ERROR: " + msg + "; nothing was changed")
    sys.exit(1)


for f in (MAIN, SETTINGS):
    if not f.exists():
        die(f"{f} not found")

main = MAIN.read_text(encoding="utf-8")
sett = SETTINGS.read_text(encoding="utf-8")

main_done = "showNotificationSettingsDialog" not in main
sett_done = "AcademyNotificationManager.KEY_GOALS_ENABLED" in sett
if main_done and sett_done:
    print("already patched, nothing to do")
    sys.exit(0)


def once(src, old, label):
    n = src.count(old)
    if n != 1:
        die(f"anchor '{label}' found {n} times (need exactly 1)")
    return src.index(old)


def replace_once(src, old, new, label):
    once(src, old, label)
    return src.replace(old, new)


def cut_between(src, start, end, label):
    """Remove src[start_index:end_index] (start inclusive, end exclusive)."""
    i = once(src, start, label + " start")
    j = once(src, end, label + " end")
    if j <= i:
        die(f"anchors of '{label}' are out of order")
    return src[:i] + src[j:], src[i:j]


# ---------------------------------------------------------------- MainActivity.kt
if not main_done:
    # 1. state variable
    main = replace_once(
        main,
        "    var showNotificationSettingsDialog by remember { mutableStateOf(false) }\n",
        "",
        "dialog state",
    )

    # 2. website bridge: open the Settings tab instead of the dialog
    main = replace_once(
        main,
        "                                fun openNotificationSettings() {\n"
        "                                    mainHandler.post {\n"
        "                                        showNotificationSettingsDialog = true\n"
        "                                    }\n"
        "                                }\n",
        "                                fun openNotificationSettings() {\n"
        "                                    mainHandler.post {\n"
        "                                        selectedIndex = 4 // Settings tab: notification switches live there now\n"
        "                                    }\n"
        "                                }\n",
        "bridge",
    )

    # 3. drawer heading + row (and the divider that followed them, so no double line is left)
    main, removed = cut_between(
        main,
        '                            Text(\n                                text = "NOTIFICATIONS & PREFERENCES",',
        '                            Text(\n                                text = "SUPPORT & ABOUT",',
        "drawer section",
    )
    if removed.count("DrawerCompactRow(") != 1 or 'label = "Notification Settings"' not in removed:
        die("drawer section contains more than the notification row")

    # 4. dialog call
    main = replace_once(
        main,
        "        if (showNotificationSettingsDialog) {\n"
        "            NotificationSettingsDialog(\n"
        "                onDismiss = { showNotificationSettingsDialog = false }\n"
        "            )\n"
        "        }\n\n",
        "",
        "dialog call",
    )

    # 5. dialog composable + NotificationToggleItem (only the dialog used it)
    main, removed = cut_between(
        main,
        "@Composable\nprivate fun NotificationSettingsDialog(",
        "@Composable\nprivate fun TimerControlDialog(",
        "dialog composables",
    )
    if removed.count("private fun ") != 2:
        die("dialog section contains an unexpected number of functions")
    if "NotificationToggleItem(" in main or "NotificationSettingsDialog" in main or "showNotificationSettingsDialog" in main:
        die("a reference to the removed dialog is still left")

# ---------------------------------------------------------------- SettingsScreen.kt
if not sett_done:
    # imports
    sett = replace_once(
        sett,
        "import com.wisdomtower.academy.data.auth.AccountCallResult\n",
        "import com.wisdomtower.academy.AcademyNotificationManager\nimport com.wisdomtower.academy.data.auth.AccountCallResult\n",
        "import",
    )

    # state: the same switches the app really obeys
    sett = replace_once(
        sett,
        '    var notifDailyStudy by remember { mutableStateOf(prefsStorage.getBoolean("notif_daily_study", true)) }\n'
        '    var notifExams by remember { mutableStateOf(prefsStorage.getBoolean("notif_exams", true)) }\n',
        "    // These four are the switches the app really obeys (AcademyNotificationManager): the study timer alert,\n"
        "    // planner reminders, daily goal nudge and academy announcements (pushes).\n"
        "    var notifTimer by remember { mutableStateOf(AcademyNotificationManager.isTimerEnabled(context)) }\n"
        "    var notifPlanner by remember { mutableStateOf(AcademyNotificationManager.isPlannerEnabled(context)) }\n"
        "    var notifDailyStudy by remember { mutableStateOf(AcademyNotificationManager.isGoalsEnabled(context)) }\n"
        "    var notifExams by remember { mutableStateOf(AcademyNotificationManager.isUpdatesEnabled(context)) }\n",
        "state",
    )

    # daily study goal reminder -> real goals switch
    sett = replace_once(
        sett,
        '                                prefsStorage.edit().putBoolean("notif_daily_study", it).apply()\n',
        "                                AcademyNotificationManager.setSetting(context, AcademyNotificationManager.KEY_GOALS_ENABLED, it)\n",
        "daily save",
    )

    # exam & syllabus updates -> real announcements switch
    sett = replace_once(
        sett,
        '                                prefsStorage.edit().putBoolean("notif_exams", it).apply()\n',
        "                                AcademyNotificationManager.setSetting(context, AcademyNotificationManager.KEY_UPDATES_ENABLED, it)\n",
        "exams save",
    )

    # the two switches that were unique to the drawer, added after the weekly digest row
    digest_end = (
        '                                prefsStorage.edit().putBoolean("notif_weekly_digest", it).apply()\n'
        "                            }\n"
        "                        )\n"
    )
    sett = replace_once(
        sett,
        digest_end,
        digest_end
        + "\n"
        "                        ToggleRow(\n"
        '                            title = "Study Timer Rewards",\n'
        '                            subtitle = "Warm completion alerts with rewarding messages when sessions end",\n'
        "                            checked = notifTimer,\n"
        "                            onCheckedChange = {\n"
        "                                notifTimer = it\n"
        "                                AcademyNotificationManager.setSetting(context, AcademyNotificationManager.KEY_TIMER_ENABLED, it)\n"
        "                            }\n"
        "                        )\n"
        "\n"
        "                        ToggleRow(\n"
        '                            title = "Planner & Deadlines",\n'
        '                            subtitle = "Personalized due-time reminders for scheduled study tasks",\n'
        "                            checked = notifPlanner,\n"
        "                            onCheckedChange = {\n"
        "                                notifPlanner = it\n"
        "                                AcademyNotificationManager.setSetting(context, AcademyNotificationManager.KEY_PLANNER_ENABLED, it)\n"
        "                            }\n"
        "                        )\n",
        "digest row",
    )

# all anchors matched: write both files
MAIN.write_text(main, encoding="utf-8")
SETTINGS.write_text(sett, encoding="utf-8")

# keep the packed copy of MainActivity.kt in step (HANDOFF rule 10); a failure here does not undo the patch
pack = Path("scripts/pack_mainactivity.py")
if pack.exists():
    r = subprocess.run([sys.executable, str(pack)], capture_output=True, text=True)
    print("pack_mainactivity.py:", "ok" if r.returncode == 0 else "FAILED (patch itself is applied): " + r.stderr[-200:])
print("patched")
