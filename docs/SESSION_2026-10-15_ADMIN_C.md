# SESSION 2026-10-15 ADMIN C: slice A3, part 1 (new file only, not wired)

> Repo is PUBLIC: no secrets, no student data. Owner order: read the handoff and status, continue, push quickly because the free quota can end without warning. Read: `HANDOFF.md`, `docs/COMPETITION_STATUS.md`, `docs/ADMIN_MOBILE_PLAN.md`, `docs/SESSION_2026-10-15_ADMIN_A0.md`, `docs/BUILD_PITFALLS.md`, `CompetitionReviewView.kt` (WebView host pattern). The owner did not name a task, so I took the next open slice of the second live task: A3 (host the admin page between the bars). One small slice, one commit.

## What was pushed (one commit)
1. NEW `app/src/main/java/com/wisdomtower/academy/ui/admin/AdminConsoleScreen.kt`: `AdminConsoleScreen(url, onClose, onLeaveToApp, modifier)`. A single WebView (no Compose scroller around it) that:
   - injects the signed-in session with `AuthStateManager.injectSessionIntoWebView` at page start and page finish, like the main WebView;
   - does NOT run any of the shared chrome scripts (`EARLY_HIDE_CHROME_JS`, `NATIVE_CHROME_JS`, `AI_TUTOR_CHROME_JS`, `PRECACHE_AND_UNBLOCK_JS`, `AUTH_BRIDGE_JS`), which removes findings F2, F3, F4 and F5 of the A0 audit for the admin page only; every student WebView is untouched;
   - pinch zoom OFF, over-scroll glow OFF, sideways scroll bar OFF, `loadWithOverviewMode` OFF (F6); user agent gets the same suffix as the overlay (`WisdomTowerApp wta-native`) appended to the default one;
   - lets only website pages whose path starts with `/admin` load inside it; any other page of the website goes to `onLeaveToApp(url)`; any outside link opens in the system browser;
   - `BackHandler`: `goBack()` while the page has history (sections use pushState since slice A1), otherwise `onClose()`.

## Evidence and limits (be honest)
- `[~]` WRITTEN, NOT COMPILED, CI NOT SEEN, NOT CALLED BY ANYTHING, not seen on a device. Nothing in the app changes until the call site exists, so this commit cannot change behaviour.
- Imports were checked by hand against `docs/BUILD_PITFALLS.md` (every Modifier extension used has its import: only `fillMaxSize`; no deprecated ripple; no Material icons; no `java.*` in Gradle). `AuthStateManager.injectSessionIntoWebView(wv)` call shape copied from `MainActivity.kt` (a WebView argument); I did not open `AuthStateManager.kt`, so the parameter type is a hypothesis (it takes a `WebView`).
- Hypothesis: the website host is `wisdom-tower-academy.live` (HANDOFF section 3 says `www.wisdom-tower-academy.live`); the check accepts it and any subdomain.
- Known gap: no WebView in this app has a file chooser (`onShowFileChooser` search found nothing), so uploading from an admin panel does not work in any WebView today. Not a regression of this file.
- The plan's status table in `docs/ADMIN_MOBILE_PLAN.md` was NOT edited this time (quota; append-only log is this file). Add the line when the next slice touches that file.

## Next slice (A3 part 2)
Write `scripts/patch_admin_host.py` (marker `ADMIN-host`, safe to run twice, tested on a copy of the real `MainActivity.kt`): make the call that opens `/admin` (marker `ADMIN-entry`, `navigateTo` for a link ending in `/admin`) show `AdminConsoleScreen` as a plain Box between the top bar and bottom navigation (copy how `CompetitionFullScreen` is mounted), with `onClose` returning to the previous screen and `onLeaveToApp` calling the existing navigation. Then the owner runs Actions > Apply pending patches (script name WITHOUT `scripts/`). After that: A2 (website CSS guard), A4, panels A5 to A16.

## Owner test (after the call site exists, not now)
Open Admin Console: top bar and bottom navigation visible, one title bar, scrolling smooth, sideways drag does nothing, copy works, Back returns from a section to the grid.

## Status
- 2026-10-15 | Claude (chat) | A3 part 1 written (new file, not wired) | LEFT: call-site patch, A2, A4, A5 to A16 | NOTES: not compiled; CI result of the commit not seen.
