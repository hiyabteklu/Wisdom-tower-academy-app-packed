# SESSION 2026-10-15 AM (Claude chat): C8 slice 5 (push opens the trophy screen), read-only groundwork

Repo is PUBLIC: no secrets, no student names. Owner: "Continue" after session AL. No code or data changed. Read only.

## Found (code read, not run)
- The push already carries a link. `fcm/AcademyFirebaseMessagingService.kt` takes the link from the message data (keys `url`, `link`, `path`, `target_url`, default `/notifications`), puts it on the tap intent as `EXTRA_TARGET_URL` (`extra_target_url`, same constant also in `AcademyNotificationManager.kt`) and starts `MainActivity` with `FLAG_ACTIVITY_CLEAR_TOP | FLAG_ACTIVITY_SINGLE_TOP`.
- `MainActivity.extractNotificationUrl(intent)` is called from `onCreate` and `onNewIntent`; it reads `EXTRA_TARGET_URL`, then `url`, `link`, `path`.
- `MainActivity` has `var showCompetitions by remember { mutableStateOf(false) }` (marker `C4-competitions-trophy`) and a reset line `showCompetitions = false` before `closeToolOverlay()`.
- NOT read: what `extractNotificationUrl` does with the value after those four lines, and which composable code reacts to it. GitHub code search only returns a few lines around a match, so the rest needs the whole file (`MainActivity.kt`, about 245 KB) or a targeted view in a Claude Code or local session.

## Plan for the patch (not written)
1. Read the end of `extractNotificationUrl` and the code that consumes its result.
2. Choose the competitions link value. It must be the one the dispatcher writes into the notification (`scheduled_notifications.url`) and the push `url`; check `src/app/api/notifications/dispatch/route.ts` in the website repo for what it sends and whether it allows a custom url. Do not invent a value.
3. Write `scripts/patch_c8_push_opens_trophy.py` (exact anchors, safe to run twice, tested on a copy of the real function text, logged in `docs/PENDING_PATCHES.md` or a session file). Behaviour: when the link is the competitions link, set `showCompetitions = true` (after the existing reset logic, signed-in only), and leave every other link as it is today.
4. The owner runs Actions > Apply pending patches, then tests with the real-send test (owner-only audience).

## Next
- Pick one: (a) read the whole `MainActivity.kt` now and write the patch (large read, costs quota), (b) the safe real-send test to the owner only (needs the Supabase connector and the owner on his phone), (c) the website admin screen for scheduled notifications (website repo).
