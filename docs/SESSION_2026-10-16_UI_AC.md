# SESSION 2026-10-16 UI_AC: M11 slice 4 (review screen frame)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AB.md`. Owner said: "Continue". One small slice.

## Inspected first
`ui/competition/CompetitionReviewScreen.kt` (whole). The frame is Back + title, the score line, "Question x of y", the page (`CompetitionReviewView`, already animated per question in UI_Z) and Previous / Next. After loading, the score line appeared in one frame.

## Changed (one file, whole file resent)
`CompetitionReviewScreen.kt`: import of `wisdomReveal`; the score line now has `.wisdomReveal(key = "comp_review_score_" + competitionId, index = 0)` (rises in once per contest per app session). Back, Previous, Next, the "Question x of y" line (it changes per question) and all logic are unchanged. Header comment line added.

## Evidence and limits
`[~]` Code read only. NOT compiled, CI NOT seen, not seen on a device. Same call shape as UI_AA and UI_AB.

## M11 status (for `docs/UI_MOTION_PLAN.md` section 7; plan file not resent)
Slice 1 UI_Z `707a8a8`, slice 2 UI_AA `c7ca038`, slice 3 UI_AB `7de9a2a`, slice 4 UI_AC (this commit). Competition Kotlin screens now all use the kit. Still open: drawer screens (About, Contact, FAQ, Privacy, Terms; needs a patch script on `MainActivity.kt`), trophy shimmer while a contest is live (needs a live signal in the top bar), dialogs in other files, phone check of Home / Learning / Packages.

## Phone check
Open a finished contest's Review: after loading, the score line rises in once. Previous / Next work at once. Reopening the same contest's review in the same app session: no replay.

## Next
M11 slice 5: drawer screens (patch script; read `docs/EDITING_LARGE_FILES.md` and the `activeDrawerScreen` block first), or trophy shimmer, or the plan table update.
