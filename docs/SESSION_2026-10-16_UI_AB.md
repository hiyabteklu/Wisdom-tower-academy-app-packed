# SESSION 2026-10-16 UI_AB: M11 slice 3 (Account points card motion)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AA.md` and `docs/UI_MOTION_PLAN.md`. Owner said: "Continue". One small slice.

## Inspected first
`ui/competition/CompetitionPointsCard.kt` (whole). The card draws nothing until `myPoints()` returns, then appears in one frame, which is the visible "pop" in Account.

## Changed (one file)
`CompetitionPointsCard.kt` (whole file resent): import of `wisdomReveal`; the glass card modifier now ends in `.wisdomReveal(key = "account_points_card", index = 0)`, so it rises in once per app session when the data arrives. Numbers are drawn at their real value from the first frame (no count-up). Header comment line added. Nothing else changed; the Account screen file was not touched.

## Evidence and limits
`[~]` Code read only. NOT compiled, CI NOT seen, not seen on a device. Same call shape as `CompetitionRulesScreen.kt` from UI_AA.

## Status for `docs/UI_MOTION_PLAN.md` section 7 (the plan file was not resent this slice to save quota)
M11: slice 1 UI_Z (`707a8a8`), slice 2 UI_AA (`c7ca038`), slice 3 UI_AB (this commit, points card). Still open: review screen frame (`CompetitionReviewScreen.kt` not read yet), drawer screens (patch script), trophy shimmer, dialogs in other files, phone check of Home / Learning / Packages.

## Phone check
Sign in with a student that has competition points, open Account: the points card fades and rises in once after a moment instead of popping. Leave and return to Account: no replay.

## Next
M11 slice 4: review screen frame, or drawer screens (patch script), or trophy shimmer.
