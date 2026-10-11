#!/usr/bin/env python3
"""Apply the three navigation fixes (S12 P1-P3, see docs/PENDING_PATCHES.md) to MainActivity.kt.

Safe by design:
- every edit needs its anchor text to appear EXACTLY once, otherwise nothing is written;
- already-applied edits are skipped (marker comments), so running twice changes nothing;
- the file is written only if all edits succeed.
"""
import pathlib
import sys

target = pathlib.Path(__file__).resolve().parents[1] / "app/src/main/java/com/wisdomtower/academy/MainActivity.kt"
text = target.read_text(encoding="utf-8")
orig = text

EDITS = []

# P1: hub opened from the study workspace must close the workspace and package page
EDITS.append((
    "S12-P1",
    """onOpenHub = { _, hubUrl ->
                            activeStudyUrl = hubUrl
                            navigateTo(hubUrl, 1)
                        },""",
    """onOpenHub = { _, hubUrl ->
                            // S12-P1: close the overlays, otherwise the hub loads UNDER the workspace
                            activeWorkspace = null
                            selectedPackage = null
                            activeStudyUrl = hubUrl
                            navigateTo(hubUrl, 1)
                        },""",
))

# P2: bell must show the notifications page (it was loaded in the hidden WebView)
EDITS.append((
    "S12-P2",
    """NotificationRepository.markAllRead()
                                    navigateTo("https://www.wisdom-tower-academy.live/notifications", null)""",
    """NotificationRepository.markAllRead()
                                    // S12-P2: show the page (tab 1 + activeStudyUrl makes the WebView visible)
                                    val notifUrl = "https://www.wisdom-tower-academy.live/notifications"
                                    resetOverlays()
                                    activeStudyUrl = notifUrl
                                    navigateTo(notifUrl, 1)""",
))

# P3: refresh button must refresh native data when a native screen is showing
EDITS.append((
    "S12-P3",
    """view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                    val wv = webView
                                    val currentUrl = wv?.url.orEmpty()""",
    """view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                    // S12-P3: a native screen covers the WebView, so refresh the native data
                                    if (!(selectedIndex == 1 && activeStudyUrl != null)) {
                                        NotificationRepository.refreshNotifications(currentUser?.id, currentUser?.email)
                                        AcademyRepository.refreshCatalog()
                                        Toast.makeText(context, "Refreshing…", Toast.LENGTH_SHORT).show()
                                        return@IconButton
                                    }
                                    val wv = webView
                                    val currentUrl = wv?.url.orEmpty()""",
))

problems = []
for marker, old, new in EDITS:
    if marker in text:
        print(f"{marker}: already applied, skipped")
        continue
    n = text.count(old)
    if n != 1:
        problems.append(f"{marker}: anchor found {n} times (need exactly 1)")
        continue
    text = text.replace(old, new, 1)
    print(f"{marker}: applied")

if problems:
    print("NOTHING WRITTEN. Problems:", *problems, sep="\n  ")
    sys.exit(1)

# sanity: braces/parentheses must stay balanced (rough check, strings/comments ignored)
if (text.count("{") - text.count("}")) != (orig.count("{") - orig.count("}")):
    print("NOTHING WRITTEN. Brace balance changed.")
    sys.exit(1)

if text != orig:
    target.write_text(text, encoding="utf-8")
    print("MainActivity.kt updated.")
else:
    print("No changes needed.")
