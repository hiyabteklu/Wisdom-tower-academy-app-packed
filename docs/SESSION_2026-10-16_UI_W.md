# SESSION 2026-10-16 UI_W: M9 written (competition list and leaderboard motion)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_V.md` and `docs/UI_MOTION_PLAN.md`. Owner said "Yes" to starting M9.

## Current motion (G3: live code on `main`, read before changing)
- `CompetitionsHubScreen.kt`: the contest list is a `LazyColumn` of `CompetitionCard`; cards appear in one frame (no entrance).
- `CompetitionLeaderboardScreen.kt`: the three trophy cards, the own row and the prize panel appear in one frame; ranks 4 to N use a plain `if (expanded)`, so they pop in with no motion.
- Kit already on `main` and reused (not duplicated): `WisdomReveal.kt` (`wisdomReveal(key, index)`, once per key per app session, `graphicsLayer` only) and `WisdomMotion.kt` (`WisdomExpandable`).

## What was written (visual only; no text, data, timing, grading or C10 logic touched)
- Leaderboard: trophy cards rise in the order 2nd, 1st, 3rd (indexes 0, 1, 2); own row (outside the top 10) and prize panel rise after them (indexes 3, 4). Keys are `lb_<competitionId>_<part>`, so each plays once per contest per app session.
- Leaderboard: ranks 4 to N open and close through `WisdomExpandable`. The button and the expandable sit in one inner Column with no spacing, and the 12 dp gap is padding inside the expandable, so the closed state leaves no extra gap (a zero-height child would otherwise still get the parent's spacing).
- Hub: each contest card rises in with a stagger (first 8), key `competition_card_<id>`; the 30 s reload or a phase change does not replay it.
- `HeroTrophyCard` got a `modifier` parameter (default `Modifier`); `LeaderboardBody` got `competitionId`.

## Evidence
- Code read only. Nothing compiled here (no build tools in this chat), CI result NOT seen, not seen on a device. `[~]`.
- Hypothesis to check on the phone: a `wisdomReveal` layer on a card inside `LazyColumn` does not flicker when the list reloads (item keys are the contest ids, so the state should survive).

## Not done
- Trophy shimmer in the top bar when a contest is live (plan section 5, top bar row): belongs to the top bar in `MainActivity.kt`, a patch-script job; left for M11 or the owner's call.
- Exam screen motion is M10. Review, rules page and points card untouched.
- The status table in `docs/UI_MOTION_PLAN.md` is still not updated (large file); this log is the status: M1 to M9 written.

## Owner step
Build from `main`, open Trophy: cards rise one after another; open a finished contest's Leaderboard: 2nd, 1st, 3rd rise in turn, the "Ranks 4 to N" button opens and closes smoothly; reopen it and the cards do not replay. If a build is red, paste the line that starts with `e: file:///`.

## Next
M10: quiz and exam runner (last, most careful: timer, submit, close stay instant).
