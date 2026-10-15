# SESSION 2026-10-15 ADMIN D: slice A3, part 2 (call-site patch script, NOT yet applied)

> Repo is PUBLIC: no secrets, no student data. Owner: "Continue" (free quota, push fast).

## What was pushed (one commit)
NEW `scripts/patch_admin_host.py` (marker `ADMIN-host`). When the owner runs it, `MainActivity.kt` gets 4 small changes: state `adminConsoleUrl`; cleared in `resetOverlays`; the `ADMIN-entry` branch of `navigateTo` sets that state (absolute URL built if the link is relative) instead of `openToolOverlay(targetUrl, "Admin Console")`; and `AdminConsoleScreen` (part 1, `ui/admin/AdminConsoleScreen.kt`) is mounted next to the notifications overlay at zIndex 18, so the top bar and bottom navigation stay visible. Own Back handling is inside the screen.

## Evidence and limits (be honest)
- NOT run, NOT tested on a copy: `MainActivity.kt` is about 250 KB and could not be copied into the chat sandbox. Anchors come from code search of `main` (the `ADMIN-entry` branch, the P15 notifications overlay and `showNotifications` state) and from `scripts/patch_c4_trophy_refresh.py`. The script writes NOTHING unless all 4 anchors match exactly once, so a wrong anchor means a red Action with `ERROR, file not changed`, not a broken app.
- Hypotheses to check if CI turns red: (1) `adminConsoleUrl` must be declared BEFORE `navigateTo` in `MainScreen` (local variable scope); `showNotifications` sits at the same place and is used by notification links, so likely fine; (2) `navigateTo(link)` takes one argument (it is called that way in the overlay code); (3) `WisdomNavy` and `zIndex` are imported (the C4 overlay uses both); (4) the `resetOverlays` anchor still has the C4 line right before `closeToolOverlay()`.
- The page loads without `?overlay=1&app=1`; the A1 admin shell does not need them (hypothesis).
- `[~]` CI NOT seen for part 1 or this commit.

## Owner steps
1. Check the CI result of the latest `main` build. If red, paste the line starting with `e: file:///`.
2. GitHub > Actions > Apply pending patches > script name `patch_admin_host.py` (WITHOUT `scripts/`). Merge the PR it opens. Wait for green CI.
3. Phone test: Account > Admin Console: top bar and bottom navigation visible, only one title bar (the app's), smooth scrolling, no sideways drag, Back goes from a section to the grid and then leaves the admin, copy works.

## Next
A2 (website CSS guard, small), A4 (only if scrolling still freezes), panels A5 to A16.

## Status
- 2026-10-15 | Claude (chat) | A3 part 2 script written, not applied | LEFT: owner runs the Action; A2, A4, A5 to A16 | NOTES: untested on a copy, see hypotheses.
