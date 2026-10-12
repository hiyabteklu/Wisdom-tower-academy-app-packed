#!/usr/bin/env python3
"""P14: every sign-in / sign-up link opens the NATIVE Account tab (native sign-in form), not the website pop-up.

Before: (1) navigateTo() in MainActivity.kt sent any URL containing /login, /signin, /signup or /register to the
website in a pop-up WebView ("Scholar Sign In" / "Create Scholar Account"); (2) handleGlobalNav() (used by Home,
Learning, Packages, Settings, the menu) did navigateTo(fullUrl) for the same paths, which ended in that pop-up.
After: both close the overlays and select the Account tab (index 3), where AccountScreen shows NativeSignInScreen
when signed out and the student card when signed in. Anchors must match exactly once; safe to run twice.
"""
import sys
from pathlib import Path

FILE = Path("app/src/main/java/com/wisdomtower/academy/MainActivity.kt")
MARK_A = "P14-native-login-nav"
MARK_B = "P14-native-login-router"

OLD_A = '''        if (targetUrl.contains("/login") || targetUrl.contains("/signin")) {
            openToolOverlay(targetUrl, "Scholar Sign In")
            return
        }
        if (targetUrl.contains("/signup") || targetUrl.contains("/register")) {
            openToolOverlay(targetUrl, "Create Scholar Account")
            return
        }
'''
NEW_A = '''        // P14-native-login-nav: sign-in and sign-up are native now (Account tab), not the website pop-up
        if (targetUrl.contains("/login") || targetUrl.contains("/signin") ||
            targetUrl.contains("/signup") || targetUrl.contains("/register")
        ) {
            resetOverlays()
            selectedIndex = 3
            return
        }
'''
OLD_B = '''                val effectivePath = if (pathPart.startsWith("/")) pathPart else "/$pathPart"
                val fullUrl = if (clean.startsWith("http")) clean else "https://www.wisdom-tower-academy.live$effectivePath"
                navigateTo(fullUrl)
'''
NEW_B = '''                // P14-native-login-router: native sign-in lives in the Account tab (overlays were reset above)
                selectedIndex = 3
'''

src = FILE.read_text(encoding="utf-8")
if MARK_A in src and MARK_B in src:
    print("already patched, nothing to do"); sys.exit(0)
if (MARK_A in src) != (MARK_B in src):
    print("ERROR: only one part is patched; fix by hand, nothing changed"); sys.exit(1)
for name, a in (("navigateTo", OLD_A), ("router", OLD_B)):
    n = src.count(a)
    if n != 1:
        print(f"ERROR: {name} anchor found {n} times (need exactly 1); nothing changed"); sys.exit(1)
src = src.replace(OLD_A, NEW_A).replace(OLD_B, NEW_B)
FILE.write_text(src, encoding="utf-8")
print("patched")
