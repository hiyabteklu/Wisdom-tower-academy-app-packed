# PENDING_PATCHES.md — exact edits to `MainActivity.kt` that still need to be applied

> Why this file exists: `MainActivity.kt` is 244 KB and the chat tools can only replace whole files, so these small edits could not be pushed. Apply them with a tool that can patch a file (Claude Code, Codex, AI Studio, Android Studio search-and-replace). One commit per patch. None was compiled. Line numbers are from `main` on 2026-10-11 and will drift: search for the quoted text.
> Cause analysis comes from the owner's phone report of 2026-10-11 (see `STATUS.md` section A once logged) and a read of `MainActivity.kt`.

## P1. Opening a course/hub from a package or from Learning does nothing (cross-linking)

Cause (verified in code): `StudyWorkspaceScreen` is drawn at `zIndex(18f)` over everything. Its `onOpenHub` sets `activeStudyUrl` and calls `navigateTo(hubUrl, 1)` but never closes the workspace (`activeWorkspace`) or the package page (`selectedPackage`). `navigateTo` does not clear them either. So the website hub loads in the WebView UNDER the workspace overlay: the tap looks dead, and it only "works" when something else happens to clear the overlay.

Find (about line 3017):
```kotlin
onOpenHub = { _, hubUrl ->
    activeStudyUrl = hubUrl
    navigateTo(hubUrl, 1)
},
```
Replace with:
```kotlin
onOpenHub = { _, hubUrl ->
    activeWorkspace = null
    selectedPackage = null
    activeStudyUrl = hubUrl
    navigateTo(hubUrl, 1)
},
```
Side effect to know: Back from the hub now goes to the Learning tab, not back to the package page (hypothesis: acceptable; if the owner wants back-to-package, keep `selectedPackage` and add a back-handler step).

## P2. Notification bell opens a page nobody sees

Cause (verified in code): the bell calls `navigateTo(".../notifications", null)`. `tabIndexForUrl` returns the CURRENT tab for any `/notifications` URL, and no `activeStudyUrl` is set, so the WebView loads the page hidden under the native screen (zIndex 10). It only becomes visible later when the user switches tabs (the "comes several minutes later" report).

Find (the bell `onClick`, about line 1921):
```kotlin
requestNotificationPermission()
NotificationRepository.markAllRead()
navigateTo("https://www.wisdom-tower-academy.live/notifications", null)
```
Replace with:
```kotlin
requestNotificationPermission()
NotificationRepository.markAllRead()
val notifUrl = "https://www.wisdom-tower-academy.live/notifications"
resetOverlays()
activeStudyUrl = notifUrl
navigateTo(notifUrl, 1)
```
(`resetOverlays` and `activeStudyUrl` are declared above the top bar in the same composable; if the compiler says otherwise, move this lambda below them.)

## P3. Refresh button refreshes a hidden page

Cause (verified in code): the top-bar Refresh button only reloads the hidden WebView (`HARD_REFRESH_JS` + `wv.reload()`). On Home, Learning, Packages, Account and Settings the native screen covers it, so nothing visible changes, and native data (notifications, catalog, profile) is never refreshed.

In the Refresh `IconButton` `onClick` (about line 1872), after `view.performHapticFeedback(...)`, wrap the existing body:
```kotlin
val webVisible = selectedIndex == 1 && activeStudyUrl != null
if (!webVisible) {
    // native screen is showing: refresh native data
    NotificationRepository.refreshNotifications(currentUser?.id, currentUser?.email)
    AcademyRepository.refreshCatalog()
    AuthStateManager.refreshIfNeeded(webView, force = true)
    Toast.makeText(context, "Refreshing…", Toast.LENGTH_SHORT).show()
} else {
    // ... existing code (val wv = webView ... showOffline(...)) unchanged ...
}
```
Check that `Toast` is imported and that `refreshIfNeeded` has the signature `(webView, force)` as logged in `STATUS.md` S2c. Once the notifications screen is native, show `NotificationRepository.isRefreshing` / `lastError` there (added in commit `8fb3e15`).

## P4. Not patched, to check later (hypothesis)

`tabIndexForUrl` sends every path containing "academy" or "learning" to tab 1 (Learning). `handleGlobalNav` checks package paths first, so package links are fine, but any other `/academy/...` link opened through `navigateTo` lands on the Learning tab. Test after P1 to P3 before changing it.
