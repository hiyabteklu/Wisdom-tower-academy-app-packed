# SESSION 2026-10-16 UI_D (Claude chat): Admin UI V2, U4 part 2

Task: `docs/ADMIN_UI_V2_PLAN.md`. Code is in the WEBSITE repo; this repo gets docs only.

## Done
- Website commit `52fc793`: `src/components/admin/ScheduledNotificationsPanel.tsx` only (whole file resent after reading it whole).
  - Rows are kit cards (`AdminCard`) with kit badges (status tone: pending cyan, sending gold, sent green, failed red, else neutral; category gold).
  - Edit is a gold pill and Cancel a danger pill (44 px).
  - Cancel now asks in a bottom sheet ("Keep it" / "Cancel it") instead of the browser confirm box; the sheet repeats the title and EAT send time.
  - Feedback is the kit slim toast (green for "Cancelled.", red for errors). Loading is a static skeleton, empty is the kit empty state, header is the kit section title with the round Refresh button.
  - Unchanged: the exports `ScheduledRowV2`, `ScheduledStatus`, `formatEat`, `friendlyScheduleError` (the composer imports them), props, state, both RPC calls, all texts.

## Evidence
- Code read of the old file and the kit. Grep audit: no `animate-`, `backdrop-`, `overflow-x`, `min-w-[`, header, footer or nav. Imports checked by eye.
- NOT verified: real build, Vercel result of `0d6c5c6` and `52fc793`, phone. Mark `[~]`.

## Unsure (hypotheses)
- This panel sits inside a hidden wrapper while another tile is open (see UI_C). The fixed toast and sheet are inside that wrapper, so an error from the background load while the admin is on another tile will not show. Fine for now.

## Next
1. Vercel result for `0d6c5c6` and `52fc793` (paste the error line if red).
2. U4 part 3: `NotificationComposerV2`, `NotificationBlockEditor`, `NotificationAudiencePicker` (read each whole first; they are the largest files of U4).
3. Then U5 to U10 per the plan.
