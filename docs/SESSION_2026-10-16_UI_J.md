# SESSION 2026-10-16 UI_J (Claude chat): admin scroll "quick swipe is lost" fix, app side

Owner report (after the website builds `8b6420e` and `822edd6` were Ready): the admin scroll freeze is the same as the notes reader one from `docs/SESSION_2026-10-12_AR.md`: if the finger does not stay down a moment before moving, a fast swipe does not start the scroll at all.

## Done (app repo, commit `c42feb1`, one file: `ui/admin/AdminConsoleScreen.kt`, no `MainActivity.kt` change, no patch script)
- F1c copy: the admin WebView gets a touch listener that on ACTION_DOWN calls `parent.requestDisallowInterceptTouchEvent(true)` and never consumes the touch (same as `fixLocalPageTouch` in `ui/study/ShellPause.kt`).
- F1b copy: while the admin screen is composed, every other VISIBLE WebView that already has a page (the big website WebView underneath) is set INVISIBLE and `onPause()`d, then shown and resumed on dispose; a 1.5 s loop pauses them again (MainActivity resumes its WebView after a background trip). The admin WebView is skipped by a tag (`wta-admin-webview`). `pauseTimers()` not used.
- Why a copy and not a call: `PauseShellWhileShown` hides every visible WebView without a local asset page, which would hide the admin WebView itself.

## Evidence
`[~]` written, NOT compiled (CI not seen), not on a device. The cause is a hypothesis; the notes reader fix is reported by the owner as working, and this uses the same two measures. Website side earlier today: removed `touch-action: pan-y` (`8b6420e`).

## If it is still lost
Next candidates (from `SESSION_2026-10-12_AR.md`): a software layer test on the admin WebView (`setLayerType(LAYER_TYPE_SOFTWARE)`, test only); ask for the phone's Android System WebView version; check whether the Compose overlay (zIndex 18) sits under another touch-handling layer in `MainActivity.kt`.

## Owner test
After the app build is green and installed: open Admin Console, swipe up and down FAST many times in Overview, Users, Payments, Push Broadcasts. Report better / same / worse. Also check nothing flashes blank when opening or closing the admin.
