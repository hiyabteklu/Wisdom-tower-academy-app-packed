# SESSION 2026-10-16 UI_C (Claude chat): Admin UI V2, U3 catch-up and U4 part 1

Task: `docs/ADMIN_UI_V2_PLAN.md`. Code is in the WEBSITE repo `hiyabteklu/Wisdom-tower-academy`; this repo gets docs only.

## Found at the start
- U3 (Overview panel) is already pushed: website commit `fd83e31` (2026-10-16 06:58 +03). It had no session log. Its commit message says: look only, same data and texts, kit cards, gold chips, kit filter chips and Refresh pill. `[~]` Vercel result NOT seen by me.
- Newest app-repo log before this one: `docs/SESSION_2026-10-16_UI_B.md` (U1, U2).

## Done now
- U4 part 1, website commit `0d6c5c6`: `src/components/admin/NotificationsPanel.tsx` only (whole file resent after reading it whole).
  - Landing is three kit tiles: Compose, Scheduled, History (History tile shows a count badge only after the list has really loaded).
  - Inside a tile: a Back pill and the tile title. History has the round Refresh button.
  - Composer (`NotificationComposerV2`) and scheduled list (`ScheduledNotificationsPanel`) are the SAME components with the SAME props, kept mounted and only hidden, so a half-written message survives switching tiles. Pressing Edit on a scheduled row now also switches to the Compose tile (small new behaviour, needed because the composer is no longer always visible).
  - History rows are kit cards with kit badges; delete now asks first in a bottom sheet (Cancel / Delete). The delete call is unchanged.
  - The FCM developer note stays a closed `<details>`, now on the landing only, in kit colours.
  - Every handler, fetch call and text kept. Not changed: composer, block editor, audience picker, scheduled list (next parts).

## Evidence
- Code read of the old file and of `ui.tsx` (props checked by eye). Pattern audit with grep: no `animate-`, `backdrop-`, `overflow-x`, `min-w-[`, header, footer or nav. Imports checked by eye: all used.
- NOT verified: real `next build` (no registry), the Vercel result for `fd83e31` and `0d6c5c6`, anything on a phone. Mark `[~]`.

## Hypotheses / unsure
- The Back pill inside a tile is separate from the page's top chevron and the phone Back button (which still leave the whole Push Broadcasts section). Hypothesis: that is acceptable; if the owner wants Back to step from a tile to the tile grid, the panel would need a history entry like `AdminSheet`.
- `History as HistoryIcon` and `CalendarClock` / `Send` icons assume the installed lucide-react has them (they exist in current versions); Vercel will show if not.

## Next, in order
1. Owner (or an agent) reads the Vercel result for `fd83e31` and `0d6c5c6`; if red, paste the error.
2. U4 part 2: `ScheduledNotificationsPanel` (rows as `AdminRow`, edit and cancel confirm as sheets).
3. U4 part 3: `NotificationComposerV2`, `NotificationBlockEditor`, `NotificationAudiencePicker`.
4. Then U5 Competitions, U6 Users, U7 Payments, U8 grants/locks/catalog, U9 content/free resources/inquiries/database hub, U10 regression pass.
5. The status list at the bottom of `docs/ADMIN_UI_V2_PLAN.md` still has only the U0 line (append-only; a whole-file resend of a big file was avoided). This file and `SESSION_2026-10-16_UI_B.md` are the log for U1 to U4.
