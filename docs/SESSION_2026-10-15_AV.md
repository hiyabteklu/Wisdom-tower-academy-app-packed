# SESSION 2026-10-15 AV: Notifications v2, slice R4

**Owner order:** read the handoff and status, continue the notifications v2 plan (`docs/NOTIFICATIONS_V2_PLAN.md`, R0 already done in session AU).

## Done in this commit
- `data/model/NotificationModel.kt`: added `NotificationRun`, `NotificationBlock` (Title, Subtitle, Paragraph, Callout, Bullets, Divider), `NotificationCategory` (ADMIN, MATERIAL, CONTEST) and two new fields on `NativeNotificationItem`: `content` (default empty) and a computed `category`. Old types `general` and `payment` map to ADMIN. Every existing constructor call keeps working (new field has a default).
- `data/repository/NotificationRepository.kt`: reads `metadata.content` (`{v:1, blocks:[...]}`) from the existing `/api/notifications` reply. Unknown or broken blocks are skipped; a missing or invalid `content` gives an empty list, so old rows are unchanged. No change to the network call, read-state logic or any other behavior.

## Evidence
- Code only. **[~] written, not compiled.** CI result NOT yet seen. Not tested on a device.
- Nothing outside the two files was touched. No forbidden file, no new dependency, no new host.

## Left (next slices, in order)
- R5 (app): `NotificationReaderScreen.kt`, gold list rows, Contests filter, tap rules. Needs the `contentScopePath` read.
- R1 (Supabase migration, rolled-back tests), then R2/R3 (website composer + path selector + audience chips), R6 (patch script for `MainActivity.kt`), R7 (real-send test), R8 (cleanup).
- NOT updated in this commit (kept the commit small): the progress table in `docs/NOTIFICATIONS_V2_PLAN.md` section 8 and the stage-board row in `docs/COMPETITION_STATUS.md`. Next agent: add a row for R4 `[~]`.

## Owner: what to check
- Wait for the CI build of this commit to go green. Nothing visible changes in the app yet (the reader comes in R5).
