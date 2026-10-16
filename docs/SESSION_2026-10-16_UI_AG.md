# SESSION 2026-10-16 UI_AG: M11 slice 7, dialogs in other files (small ones)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AF.md`. Owner said: "Continue".

## Step 1: what the code really does (code search + read, G3)
`wisdomDialogEnter` (`ui/theme/WisdomOverlayMotion.kt`) is used only by `ExitGuiltDialog.kt` and `MainActivity.kt` (M7 patch). A search for `AlertDialog` finds dialogs in four more files: `AccountDeletionSection.kt` (about 8 KB), `HubItemListScreen.kt` (31 KB), `NativeTutorScreen.kt` (36 KB), `CompetitionExamScreen.kt`. `HubGateDialog.kt` (5 KB) uses the plain `Dialog(` window. None of these five had the enter motion.

## Changed (written and pushed; CI NOT seen)
- `HubGateDialog.kt` (whole file resent): `.wisdomDialogEnter()` first in the card Column modifier, one import.
- `AccountDeletionSection.kt` (whole file resent): `modifier = Modifier.wisdomDialogEnter()` on the `AlertDialog`, one import. Typing, DELETE check, busy state, deletion call and sign-out are untouched.
Everything else copied unchanged. Scale 0.94 to 1 and fade, 200 ms, `graphicsLayer` only, controls tappable from the first frame. Closing stays the platform's instant dismiss. No new text, colours or dependencies.

## Left OPEN on purpose
- `HubItemListScreen.kt`, `NativeTutorScreen.kt` (30 KB and over: need a small patch script or a careful whole resend; I did not read them this slice, so I do not know what their dialogs are).
- `CompetitionExamScreen.kt`: an exam screen, plan rule 6 says exam controls are never delayed and exam screens go last; its dialogs (submit / leave) must stay instant. Not touched.

## Hypothesis (not proven)
Material3 `AlertDialog(modifier = ...)` applies the modifier to the dialog surface, so the scale and fade act on the card, not the scrim. If the owner sees the card pop without the fade, the first place to look is that call.

## Not done
`docs/UI_MOTION_PLAN.md` section 7 M11 row was NOT updated in this commit (whole-file resend of 20 KB skipped to save quota). The next slice must add: "Slice 7 UI_AG: dialogs in `HubGateDialog.kt` and `AccountDeletionSection.kt`".

## Next
M11 slice 8: read `HubItemListScreen.kt` and `NativeTutorScreen.kt` dialogs and add `wisdomDialogEnter` (patch script if a whole resend is unsafe), or the drawer push / pop patch script on `MainActivity.kt`.

## Owner should look at (phone)
Open a closed hub (the gate pop-up) and Settings > Security > Delete my account: the dialog card scales in softly. Do not complete the deletion while testing.
