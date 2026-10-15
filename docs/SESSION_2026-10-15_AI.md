# SESSION 2026-10-15 AI (Claude chat): glass look for the rules page

Repo is PUBLIC. Owner: build of session AH is GREEN (his word, run not seen from chat); "continue". Same order as session AH: glass, pill buttons, no bright solid colour.

## Done (`[~]` written, NOT compiled by me, CI NOT seen, not seen on a device)
- `ui/competition/CompetitionRulesScreen.kt` (whole file resent): the red warning box is now `WisdomGlassCard` (24dp corners) with a 6% red fill and a 30% red edge (the warning lines keep their red text and wording); Cancel and "I understand, start" are `CompetitionPillButton` (start emphasized, soft cyan tint). Removed the solid `RulesButton` and its colours and unused imports. `CompetitionFullScreen` (opaque navy base, zIndex 17) is unchanged on purpose: it is the layering fix of sessions W and X.

## Next, one per chat (read each file first)
1. `CompetitionLeaderboardScreen.kt`, 2. `CompetitionReviewScreen.kt`, 3. `CompetitionPointsCard.kt` (Account). Use `WisdomGlassCard` and `CompetitionPillButton`.
2. Board `docs/COMPETITION_STATUS.md` still lacks the lines for sessions AF to AI.
