# SESSION 2026-10-16 UI_AJ: M11 slice 10, trophy glow while a contest is live

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_AI.md`. Owner said: Continue.

## Step 1: what the code really does (read from `main`, G3)
- The top-bar trophy is `CompetitionTrophyIcon` (`ui/competition/CompetitionTrophyIcon.kt`), called from `MainActivity.kt` with `tint = Accent, refreshKey = showCompetitions`. It already calls `CompetitionRepository.listCompetitions()` on sign-in, on every `refreshKey` change and every 2 minutes, to drive the red dot.
- The live signal already exists: each contest from the server carries `phase` (`CompetitionPhase.LIVE`, computed by the database). So NO `MainActivity.kt` change and NO patch script are needed; the earlier note "needs a live-contest signal in the top bar" is corrected: the signal was already in the same call.

## Changed (written and pushed; NOT compiled, NOT seen on a device)
`CompetitionTrophyIcon.kt` resent whole (5 KB): new state `hasLive` (any contest with phase LIVE, set from the same successful call, reset when signed out), and a private `TrophyGlow` composable shown only while live: a soft circle in the icon tint behind the trophy, breathing (alpha 0.10 to 0.32, scale 0.86 to 1.0, 1.3 s each way, linear reverse). `graphicsLayer` only (read in draw phase), one animation clock, runs only while live. Dot logic, refresh timing, icon size and the touch target are unchanged. A failed call keeps the last known state.

## Risks (hypotheses, not proven)
- The glow can extend past the 22 dp icon (34 dp circle, `requiredSize`); the 44 dp button is bigger, so it should not clip. Phone check needed.
- Up to 2 minutes of lag: the glow starts or stops at the next refresh after a contest opens or closes.
- If the owner finds it too strong or too weak, tune alpha / duration in `TrophyGlow`.

## Owner: nothing to run
No patch script. It arrives with the next build of `main`. Test: with a live contest, the top-bar trophy has a soft glow breathing behind it; with none live, no glow; red dot still behaves as before.

## Next
M11 is code-complete except exam-screen dialogs (plan rule 6, they stay instant, so intentionally skipped). Remaining: update the status table in `docs/UI_MOTION_PLAN.md` section 7 (M11 row: slices 9 and 10) and the owner's phone check of Home / Learning / Packages, which closes M11.
