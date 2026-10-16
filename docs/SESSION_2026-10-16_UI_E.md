# SESSION 2026-10-16 UI_E (Claude chat): Admin UI V2, U4 part 3 (slice U4 complete in code)

Task: `docs/ADMIN_UI_V2_PLAN.md`. Code is in the WEBSITE repo; this repo gets docs only. Follows `SESSION_2026-10-16_UI_C.md` and `_UI_D.md`.

## Done (website commits, each one file, whole file resent after reading it whole)
- `08c7206` U4 3a `NotificationAudiencePicker.tsx`: gold selected chips, kit card, `AdminInput`, `AdminPill`; deleting a custom audience asks in a bottom sheet (was the browser confirm). Same five RPC calls and logic.
- `a72d66e` U4 3b `NotificationBlockEditor.tsx`: add and Bold buttons in kit colours, one kit card per block, `AdminTextarea`, delete in the danger colour. The PREVIEW (`NotificationPreview`) is untouched on purpose: it mirrors the gold Android reading view. Exports unchanged.
- `2799c92` U4 3c `NotificationComposerV2.tsx`: kit card, `AdminField`/`AdminInput`/`AdminSelect`, gold selected category tiles, kit primary (cyan) submit pill. "Send now" to groups now confirms in a bottom sheet (same sentence). `handleSubmit(skipConfirm)`: pressing Send in the sheet runs the same checks again, then sends. All validation, payloads, RPC and fetch calls unchanged.
- Slice U4 is now complete in code: `NotificationsPanel` (UI_C), `ScheduledNotificationsPanel` (UI_D), and these three.

## One small behaviour change
- Composer: `scrollIntoView` on Edit uses `behavior: "auto"` instead of `"smooth"` (plan F9: smooth programmatic scrolling is suspected of fighting touch scrolling in the WebView).

## Evidence
- Code read of each old file and of `ui.tsx`; grep audit (no `animate-`, `backdrop-`, `overflow-x`, header/footer/nav; one `min-w-[44px]` on a small button, which is narrow, not wide). Imports checked by eye in all three files.
- NOT verified: real `next build`, Vercel results for `0d6c5c6`, `52fc793`, `08c7206`, `a72d66e`, `2799c92`, anything on a phone. All `[~]`.

## Unsure (hypotheses)
- The composer feedback banner stays inline (messages are long and carry numbers), not a toast.
- Radio buttons keep the native look with an amber accent; not restyled.
- The Send sheet re-runs validation; if the admin edits nothing between taps this is invisible.

## For the owner to test (after Vercel is green)
1. Push Broadcasts shows three tiles; Compose opens the form; type something, press Back, open Scheduled, return to Compose: the text is still there.
2. Pick a group and press Send now: a bottom sheet asks first (do not press Send unless you mean it; it reaches real students). Phone Back closes the sheet.
3. Scheduled: Cancel asks in a sheet. Edit opens Compose with the row loaded.
4. Custom audience: the trash icon asks in a sheet.

## Next
1. Vercel results (paste the first red error line, if any).
2. U5 Competitions (`CompetitionsAdminPanel.tsx` 33 KB, `EntryFlagsInfo.tsx`), then U6 Users (29 KB), U7 Payments, U8 grants/locks/catalog, U9 content/free resources/inquiries/database hub, U10 regression pass.
