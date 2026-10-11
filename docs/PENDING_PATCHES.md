# PENDING_PATCHES.md — owner report, session log and exact edits NOT yet applied

> READ THIS RIGHT AFTER `STATUS.md`. Why this file exists: `MainActivity.kt` is 244 KB and `STATUS.md` is 38 KB, and the chat tools can only replace whole files, so these things could not be pushed there. The next agent that CAN patch files (Claude Code, Codex, AI Studio, Android Studio): (1) apply P1 to P3 below, one commit each, (2) copy sections A and B below into `STATUS.md` (section A and section C) and then delete them from this file.
> **Easiest way to apply P1 to P3: `python3 scripts/apply_pending_patches.py`** (commit `4df5de5`; tested on the real file, each anchor must match exactly once, safe to run twice). Owner can also run it through GitHub Actions: the workflow file could not be pushed by the chat tool (403, workflows need extra permission), so the owner adds `.github/workflows/apply-pending-patches.yml` by hand in the GitHub web page (text given in the chat, also summarized here: trigger `workflow_dispatch`, `permissions: contents: write`, checkout `main`, run the script, commit to branch `fix/nav-bell-refresh`, `git push --force origin fix/nav-bell-refresh`). Then run "Build Production AAB & APK" on that branch; merge only if green. `scripts/restore_mainactivity.py` (run by the build) keeps a valid `MainActivity.kt` that is already on disk, so the patches are not overwritten.
> Repo is PUBLIC: no secrets, no personal data.

## A. OWNER REPORT 2026-10-11 (from the phone, in the owner's words; copy to STATUS.md section A)

- 2026-10-11 — "notification, refresh buttons doesn't work, comes several minutes later after click."
- 2026-10-11 — "cross linking is not working, example can't open courses from packages, learning or home, it only works from learning section sometimes."
- 2026-10-11 — "there are fabricated pages, log your result, manual input + face tracker... etc." (screenshot of the study workspace: Performance Tracker / Log Score / Recent Activity & Drills / Learning Hubs subtitle). "Everywhere like this it comes from nothing, fabricated." The owner's point 4 was never sent (blank); the "face tracker" was NOT found in the app code (hypothesis: a page of the website inside the WebView). Ask the owner for a screenshot of it.
- 2026-10-11 — "Continue with what's important first."
- 2026-10-11 — Owner chose to make `MainActivity.kt` smaller (split into several files) so any tool can edit it; agreed to a GitHub-Action-based patching method.

## B. SESSION LOG entry (copy to STATUS.md section C)

- 2026-10-11 | Claude (chat, owner on free plan) | DONE: S12 (new item, owner report above). (a) commit `8fb3e15` `NotificationRepository.kt`: removed the invented "Welcome… All content is unlocked" notification (it also made the unread dot always red), added `isRefreshing` / `lastError` flows, URL-encoded the query, a failed or empty reply is no longer silent. (b) commit `8cef475` `StudyWorkspaceScreen.kt` resent whole: removed the invented "Performance Tracker", "Log Score" dialog (scores were only in local SharedPreferences `wt_study_history`), "Recent Activity & Drills", the hub subtitle "All 6 academic study formats with verified curriculum coverage", and the wrong grade labels. The website has NO manual score entry: `AcademicResultSaver.tsx` is "Progress Tracker" and reads real rows from Supabase `academic_results` + `getScopeStats`. Kept the header, a "Learning Hubs" label (website wording) and the 6 hub cards (names and descriptions verified equal to `website-reference/src/data/academy.ts`). (c) commits `5186ac7`, `fe75b0a` `docs/PENDING_PATCHES.md` (this file), `e049fd3` / `4f2dfd9` pointers in `CLAUDE.md` / `AGENTS.md`. (d) commit `4df5de5` `scripts/apply_pending_patches.py` applies P1 to P3 mechanically (tested on a copy of the real `MainActivity.kt`: applies, second run changes nothing). Root causes found by reading `MainActivity.kt`: see P1 to P3 | LEFT: run the patch script (P1 to P3 fix cross-linking, the bell and the refresh button); then split `MainActivity.kt` (plan: JS constants lines ~231-770 to `WebScripts.kt`, bottom nav/loaders/dialogs lines ~3871-4541 to `ShellComponents.kt`, then cut `MainScreen` (lines ~950-3870) into smaller composables, one step per commit with a green build in between); S4 (d) rest: `GuidesData.kt`, Home/Settings wording, `docs/FIDELITY_AUDIT.md`; native real "Progress Tracker" only if the owner wants it (read `docs/SUPABASE_NOTES.md` for the `academic_results` policies first); hub cards on the website also show an item count (`ResourceHubGrid.tsx` `hubCounts`), the native cards do not | TEST: owner should check that the GitHub Action build is green after `8cef475` (also covers everything uncompiled before). On a phone: Packages > Grade 9 > Open Study Hubs: only the header, "LEARNING HUBS" and 6 hub cards; no Performance Tracker; after P1: tapping a hub opens it; after P2/P3: bell shows the notifications page, refresh works on every tab | NOTES/UNSURE: not compiled. `StudyHistoryRecord`, `RecordScoreDialog`, `StudyHistoryItemRow`, `getGradeLabel` were deleted (grep showed no other user). Old scores users typed are still in the phone's SharedPreferences `wt_study_history` but are no longer shown (harmless). I could not append to `STATUS.md` (38 KB, whole-file replace only). P3 in the script does NOT call `AuthStateManager.refreshIfNeeded`: it is a `suspend` function and cannot be called from a button click without a coroutine scope.

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

Cause (verified in code): the top-bar Refresh button only reloads the hidden WebView (`HARD_REFRESH_JS` + `wv.reload()`). On Home, Learning, Packages, Account and Settings the native screen covers it, so nothing visible changes, and native data (notifications, catalog) is never refreshed.

In the Refresh `IconButton` `onClick` (about line 1872), right after `view.performHapticFeedback(...)`, insert (the script does exactly this):
```kotlin
if (!(selectedIndex == 1 && activeStudyUrl != null)) {
    NotificationRepository.refreshNotifications(currentUser?.id, currentUser?.email)
    AcademyRepository.refreshCatalog()
    Toast.makeText(context, "Refreshing…", Toast.LENGTH_SHORT).show()
    return@IconButton
}
```
`Toast`, `AcademyRepository` and `NotificationRepository` are already imported in `MainActivity.kt`. Once the notifications screen is native, show `NotificationRepository.isRefreshing` / `lastError` there (added in commit `8fb3e15`). Token refresh is NOT included on purpose (`AuthStateManager.refreshIfNeeded` is `suspend`).

## P4. Not patched, to check later (hypothesis)

`tabIndexForUrl` sends every path containing "academy" or "learning" to tab 1 (Learning). `handleGlobalNav` checks package paths first, so package links are fine, but any other `/academy/...` link opened through `navigateTo` lands on the Learning tab. Test after P1 to P3 before changing it.
