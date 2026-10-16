# SESSION 2026-10-16 UI_F (Claude chat): Admin UI V2, U6 Users (and a catch-up note on U5)

Task: `docs/ADMIN_UI_V2_PLAN.md`. Code is in the WEBSITE repo; this repo gets docs only. Follows `SESSION_2026-10-16_UI_E.md`. Owner order: "read the handoff and status and continue".

## Catch-up: U5 was already done in code, but no log says so
Read on website `main` at the start of this session: `CompetitionsAdminPanel.tsx` and `EntryFlagsInfo.tsx` both carry a "Slice U5 (2026-10-16)" header and use the kit (`AdminCard`, `AdminPill`, `AdminSheet` for Reschedule, Start now, Cancel contest and Disqualify, `AdminToast`). The UI_E "Next" list still names U5 as open; that is out of date. A cut-off session did U5 without logging. I did NOT check whether Vercel built it. Treat U5 as `[~]` written.

## Done (website commit `c8a62ba`, one file, whole file resent after reading the old one whole)
- U6 `src/components/admin/UsersPanel.tsx` (29 KB to 22 KB). Same state, same calls (`listProfiles`, `getStudentDetail`, `grantAccess`, `grantAllPackages`), same CSV export, same filters and texts. Changes are layout only:
  - Kit look: `AdminSectionTitle`, `AdminPill` (Export CSV ghost, Refresh gold), `AdminSearch`, `AdminSelect`, `AdminCard` per scholar with `AdminAvatar` (a picture still shows when the student has one), gold icons instead of purple, `AdminEmpty`, `AdminSkeleton`, `AdminToast`.
  - The two old pop-ups (history, direct grant) are now ONE `AdminSheet`. Reason: the kit sheet pushes a history entry for the phone Back button; closing one sheet and opening another in the same moment would let the first one's late Back event close the second. "Grant New Package" in the history now swaps the content of the open sheet. The grant form is submitted by the footer pill (`form="grant-form"`).
  - The brand loader was replaced by the static skeleton (no animation, plan section 4). The old toast timer effect is gone because `AdminToast` closes itself after 4 s.
  - Toast colour is now neutral (the old one was always cyan, even for errors; the panel has no success/error flag, so I did not invent one).

## Evidence
- Code read of the old file and of `ui.tsx` (whole). Grep-style review by eye: no `animate-*`, `backdrop-*`, `overflow-x`, no header/footer/nav element, no raw apostrophe, quote, greater-than or closing-brace in JSX text (ampersands and a star character only). Imports checked by eye: removed `Search`, `X`, `CheckCircle2`, `BrandLoader`, none left unused.
- NOT verified: the shim type check from `UI_A` was NOT run in this chat; no `next build`; Vercel result for `c8a62ba` NOT seen; nothing seen on a phone. All `[~]`.

## Unsure (hypotheses)
- `AdminKeyValue` shows "-" for empty fields in two columns; long emails use `break-all`.
- The sheet title is "Student Scholar Profile" with the name as the first line inside (the old window had the name as its big title).
- Two filters stay as selects (side by side) instead of `AdminChips`, to keep behaviour and width identical.

## For the owner to test (after Vercel is green)
1. Scholars and Users: gap under the app bar, cards in the dark/gold look, search and both filters still work.
2. Tap "History & Scores": a bottom sheet with the profile, packages and scores; phone Back closes it.
3. In that sheet tap "Grant New Package": the SAME sheet turns into the grant form (it must not flicker closed). Do not press "Confirm & Unlock" unless you mean to grant a real package.
4. Export CSV still downloads.

## Next
1. Vercel results for `c8a62ba` and the earlier U4/U5 commits (paste the first red error line if any).
2. U7 Payments (`PaymentsPanel.tsx` 22 KB, `src/app/admin/payments/page.tsx`) incl. receipt and reject sheets; remember the sheet-to-sheet rule above.
3. Then U8 grants/locks/catalog, U9 content/free resources/inquiries/database hub, U10 regression pass.
