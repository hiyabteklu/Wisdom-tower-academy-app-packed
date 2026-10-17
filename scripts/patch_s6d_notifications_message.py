#!/usr/bin/env python3
"""S6 part 2c (docs/PLAY_STORE_UI_PLAN.md): Notifications guest notice and empty state use the shared WisdomMessageCard.

ui/notifications/NotificationsScreen.kt:
  - guest notice ("Scholar Notifications" + sentence + Sign In to Account pill) -> WisdomMessageCard(title, message,
    showSignIn = true, signInLabel "Sign In to Account", onSignIn = onSignIn). The old sky-blue edge becomes the normal glass edge.
  - empty state ("No notifications" + the all-caught-up / category sentence) -> WisdomMessageCard(title, message).
    The small bell icon above the title is dropped (the shared card has no icon slot).
Same words as before. The loading skeleton, the error card and the notice rows are NOT touched.
Safe to run twice (marker S6-msgcard-notif). If an anchor is not found exactly once, NOTHING is written.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/ui/notifications/NotificationsScreen.kt")
MARK = "S6-msgcard-notif"
src = FILE.read_text(encoding="utf-8")
if MARK in src:
    print("already patched, nothing to do")
    sys.exit(0)

errors = []


def swap(s, name, old, new):
    n = s.count(old)
    if n != 1:
        errors.append(f"{name}: anchor found {n} times (need exactly 1)")
        return s
    return s.replace(old, new)


old_guest = r'''                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(WisdomGlassFill)
                            .border(BorderStroke(1.dp, WisdomAccentSky.copy(alpha = 0.30f)), RoundedCornerShape(16.dp))
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Scholar Notifications", color = WisdomTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(
                            "Sign in to receive targeted study reminders and see your enrollment updates.",
                            color = WisdomMuted,
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                        )
                        SignInPill(label = "Sign In to Account", onClick = onSignIn) // S5-signin
                    }
                    Spacer(Modifier.height(20.dp))
                }
'''
new_guest = r'''                item {
                    WisdomMessageCard( // S6-msgcard-notif
                        title = "Scholar Notifications",
                        message = "Sign in to receive targeted study reminders and see your enrollment updates.",
                        showSignIn = true,
                        signInLabel = "Sign In to Account",
                        onSignIn = onSignIn
                    )
                    Spacer(Modifier.height(20.dp))
                }
'''
src = swap(src, "guest notice", old_guest, new_guest)

old_empty = r'''                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(WisdomGlassFill)
                            .border(BorderStroke(1.dp, WisdomGlassBorder), RoundedCornerShape(16.dp))
                            .padding(vertical = 56.dp, horizontal = 16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Notifications,
                            contentDescription = null,
                            tint = Color.White.copy(alpha = 0.20f),
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(Modifier.height(12.dp))
                        Text("No notifications", color = WisdomTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Text(
                            text = if (filter == NoticeFilter.All) {
                                "You're all caught up! New content alerts will appear here."
                            } else {
                                val name = when (filter) {
                                    NoticeFilter.Material -> "material"
                                    NoticeFilter.Contest -> "contest"
                                    else -> "admin"
                                }
                                "No alerts found for category \"$name\"."
                            },
                            color = WisdomMuted,
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
'''
new_empty = r'''                item {
                    WisdomMessageCard( // S6-msgcard-notif
                        title = "No notifications",
                        message = if (filter == NoticeFilter.All) {
                            "You're all caught up! New content alerts will appear here."
                        } else {
                            val name = when (filter) {
                                NoticeFilter.Material -> "material"
                                NoticeFilter.Contest -> "contest"
                                else -> "admin"
                            }
                            "No alerts found for category \"$name\"."
                        }
                    )
                }
'''
src = swap(src, "empty state", old_empty, new_empty)

if errors:
    print("ERROR, nothing written:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
FILE.write_text(src, encoding="utf-8")
print("patched: NotificationsScreen.kt")
