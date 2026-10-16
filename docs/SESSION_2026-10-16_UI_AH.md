# SESSION 2026-10-16 UI_AH: M11 slice 8, dialogs in the two big study files (patch script)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AG.md`. Owner said: "Continue".

## Step 1: what the code really does (code search, G3)
One `AlertDialog` each, found by search (fragments only; the two files were NOT read whole, 31 KB and 36 KB):
- `HubItemListScreen.kt`: the dialog opened when `confirmRemove` is set (remove downloads).
- `NativeTutorScreen.kt`: the dialog opened when `showClearConfirm` is true (clear chat).
Both start with `AlertDialog(` followed by `onDismissRequest = ...` as the first argument. Neither has the enter motion.

## Changed (written and pushed; NOT applied, NOT compiled)
New `scripts/patch_m11_dialogs.py`: adds `modifier = Modifier.wisdomDialogEnter(),` as first argument of those two dialogs and one import per file. Exact anchors, both files or nothing, safe to run twice. No resend of the big files.
`docs/UI_MOTION_PLAN.md` section 7, M11 row: now also lists slice 7 (UI_AG) and this slice.

## Risks (hypotheses, not proven)
- If either dialog already has a `modifier =` argument further down, the build fails with a duplicate-argument error; the fix is to merge the two. I did not read the argument lists.
- If the anchor text differs in whitespace from the fragment, the script prints an ERROR and writes nothing.

## Still not touched
`CompetitionExamScreen.kt` dialogs (exam screen: plan rule 6, controls stay instant, last slice).

## Owner: run this
Actions > Apply pending patches > Run workflow: script `patch_m11_dialogs.py`, branch `fix/m11-dialogs`. Wait for the build on that branch, test, merge the Pull request.
Test on the phone: Learning > a hub > select downloaded items and remove (the confirmation card scales in softly); AI Tutor > clear chat (same). Do not leave the exam running while testing.

## Next
M11 slice 9: the drawer screen push / pop (patch script on `MainActivity.kt`) or the trophy shimmer (needs a live-contest signal). Then the phone check of Home / Learning / Packages closes M11.
