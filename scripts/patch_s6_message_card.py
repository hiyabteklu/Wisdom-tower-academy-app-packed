#!/usr/bin/env python3
"""S6 part 1 (docs/PLAY_STORE_UI_PLAN.md): use the shared WisdomMessageCard (ui/theme/WisdomMessageCard.kt).

  - ui/study/HubItemListScreen.kt : the private MessageCard becomes a thin wrapper around WisdomMessageCard (same look,
                                    Retry now has a 48 dp target and a button role); the "Sign in to open" block is now
                                    ONE card with the Sign in pill inside it (before: card, then the pill under it).
  - ui/notifications/NotificationsScreen.kt : the red "last refresh failed" box + "Try again" link become
                                    WisdomMessageCard(isError = true, retryLabel = "Try again") (same words).
Texts are unchanged. Safe to run twice (marker S6-msgcard). If any anchor is not found exactly once, NOTHING is written.
"""
import sys
from pathlib import Path

BASE = Path("app/src/main/java/com/wisdomtower/academy")
MARK = "S6-msgcard"
IMP = "import com.wisdomtower.academy.ui.theme.WisdomMessageCard\n"
errors = []


def swap(src, name, old, new):
    n = src.count(old)
    if n != 1:
        errors.append(f"{name}: anchor found {n} times (need exactly 1)")
        return src
    return src.replace(old, new)


hub_p = BASE / "ui/study/HubItemListScreen.kt"
not_p = BASE / "ui/notifications/NotificationsScreen.kt"
hub, notif = hub_p.read_text(encoding="utf-8"), not_p.read_text(encoding="utf-8")

if MARK in hub and MARK in notif:
    print("already patched, nothing to do")
    sys.exit(0)

if MARK not in hub:
    old_signin = (
        "                    Column(horizontalAlignment = Alignment.CenterHorizontally) { // UX-CONSISTENCY-2026-10-17\n"
        "                        MessageCard(\n"
        "                            title = \"Sign in to open\",\n"
        "                            message = \"Create a free account to unlock books, notes, questions, and exams. \" +\n"
        "                                \"No payment required for registered students.\",\n"
        "                            onRetry = null\n"
        "                        )\n"
        "                        com.wisdomtower.academy.ui.auth.SignInPill(modifier = Modifier.padding(top = 14.dp))\n"
        "                    }\n"
    )
    new_signin = (
        "                    WisdomMessageCard( // S6-msgcard: card and Sign in pill in one\n"
        "                        title = \"Sign in to open\",\n"
        "                        message = \"Create a free account to unlock books, notes, questions, and exams. \" +\n"
        "                            \"No payment required for registered students.\",\n"
        "                        showSignIn = true\n"
        "                    )\n"
    )
    hub = swap(hub, "hub sign in block", old_signin, new_signin)

    start = hub.find("@Composable\nprivate fun MessageCard(title: String?, message: String, onRetry: (() -> Unit)?) {\n")
    end_marker = "/** The round back button used at the top of the study screens"
    end = hub.find(end_marker)
    if start < 0 or end < 0 or hub.count("private fun MessageCard(") != 1 or start > end:
        errors.append("hub MessageCard definition: not found as expected")
    else:
        wrapper = (
            "@Composable\n"
            "private fun MessageCard(title: String?, message: String, onRetry: (() -> Unit)?) {\n"
            "    WisdomMessageCard(message = message, title = title, onRetry = onRetry) // S6-msgcard\n"
            "}\n\n"
        )
        hub = hub[:start] + wrapper + hub[end:]
    if IMP in hub:
        errors.append("hub: WisdomMessageCard import already present (script needs an update)")
    hub = swap(hub, "hub import", "import com.wisdomtower.academy.ui.theme.wisdomReveal\n",
               IMP + "import com.wisdomtower.academy.ui.theme.wisdomReveal\n")

if MARK not in notif:
    old_err = (
        "                    Column(\n"
        "                        modifier = Modifier\n"
        "                            .fillMaxWidth()\n"
        "                            .clip(RoundedCornerShape(14.dp))\n"
        "                            .background(Color(0x22F43F5E))\n"
        "                            .padding(14.dp)\n"
        "                    ) {\n"
        "                        Text(lastError.orEmpty(), color = Color(0xFFFDA4AF), fontSize = 12.sp)\n"
        "                        Text(\n"
        "                            \"Try again\",\n"
        "                            color = WisdomAccentSky,\n"
        "                            fontSize = 12.sp,\n"
        "                            fontWeight = FontWeight.Bold,\n"
        "                            modifier = Modifier\n"
        "                                .padding(top = 8.dp)\n"
        "                                .clickable {\n"
        "                                    NotificationRepository.refreshNotifications(currentUser?.id, currentUser?.email)\n"
        "                                }\n"
        "                        )\n"
        "                    }\n"
    )
    new_err = (
        "                    WisdomMessageCard( // S6-msgcard\n"
        "                        message = lastError.orEmpty(),\n"
        "                        isError = true,\n"
        "                        retryLabel = \"Try again\",\n"
        "                        onRetry = {\n"
        "                            NotificationRepository.refreshNotifications(currentUser?.id, currentUser?.email)\n"
        "                        }\n"
        "                    )\n"
    )
    notif = swap(notif, "notifications error box", old_err, new_err)
    if IMP in notif:
        errors.append("notifications: WisdomMessageCard import already present (script needs an update)")
    notif = swap(notif, "notifications import", "import com.wisdomtower.academy.ui.theme.WisdomTextPrimary\n",
                 IMP + "import com.wisdomtower.academy.ui.theme.WisdomTextPrimary\n")

if errors:
    print("ERROR, nothing written:")
    for e in errors:
        print(" -", e)
    sys.exit(1)

hub_p.write_text(hub, encoding="utf-8")
not_p.write_text(notif, encoding="utf-8")
print("patched: HubItemListScreen.kt, NotificationsScreen.kt")
